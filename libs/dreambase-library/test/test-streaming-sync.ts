/**
 * Tests for StreamingSyncProcessor
 */

import {
  processStreamingSync,
  buildSyncAcceptHeader,
  isStreamingResponse,
  collectBlobRefs,
  StreamSyncMessage,
  StreamSyncProgress,
} from '../src/typeson-simplified/StreamingSyncProcessor.js';
import { TSONRef } from '../src/typeson-simplified/TSONRef.js';

// Helper to create a ReadableStream from NDJSON messages
function createMockStream(messages: StreamSyncMessage[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const ndjson = messages.map((m) => JSON.stringify(m)).join('\n') + '\n';

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(ndjson));
      controller.close();
    },
  });
}

// Helper to create chunked stream (simulates network chunking)
function createChunkedStream(
  messages: StreamSyncMessage[],
  chunkSize: number
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const ndjson = messages.map((m) => JSON.stringify(m)).join('\n') + '\n';
  const bytes = encoder.encode(ndjson);

  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close();
        return;
      }
      const chunk = bytes.slice(offset, offset + chunkSize);
      controller.enqueue(chunk);
      offset += chunkSize;
    },
  });
}

describe('StreamingSyncProcessor', () => {
  describe('buildSyncAcceptHeader', () => {
    it('should include streaming format when supported', () => {
      const header = buildSyncAcceptHeader(true);
      expect(header).toContain('application/x-ndjson-stream');
      expect(header).toContain('application/json');
    });

    it('should not include streaming format when not supported', () => {
      const header = buildSyncAcceptHeader(false);
      expect(header).not.toContain('ndjson');
      expect(header).toContain('application/json');
    });
  });

  describe('isStreamingResponse', () => {
    it('should detect streaming response', () => {
      const response = new Response('', {
        headers: { 'Content-Type': 'application/x-ndjson-stream' },
      });
      expect(isStreamingResponse(response)).toBe(true);
    });

    it('should detect non-streaming response', () => {
      const response = new Response('', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(isStreamingResponse(response)).toBe(false);
    });
  });

  describe('collectBlobRefs', () => {
    it('should find TSONRef in simple object', () => {
      const ref = new TSONRef('ArrayBuffer', 'test-id', 1000);
      const obj = { data: ref };

      const refs = collectBlobRefs(obj);
      expect(refs).toHaveLength(1);
      expect(refs[0]).toBe(ref);
    });

    it('should find $ref format in object', () => {
      const obj = { data: { $t: 'ArrayBuffer', $ref: 'blob-id', $size: 100 } };

      const refs = collectBlobRefs(obj);
      expect(refs).toHaveLength(1);
      expect(refs[0].ref).toBe('blob-id');
    });

    it('should find refs in nested structures', () => {
      const ref1 = new TSONRef('ArrayBuffer', 'ref-1', 1000);
      const ref2 = { $t: 'Blob', $ref: 'ref-2', $size: 2000, $ct: 'image/png' };

      const obj = {
        file: { content: ref1 },
        attachments: [{ data: ref2 }],
      };

      const refs = collectBlobRefs(obj);
      expect(refs).toHaveLength(2);
    });

    it('should handle objects without refs', () => {
      const obj = { name: 'test', count: 42 };
      const refs = collectBlobRefs(obj);
      expect(refs).toHaveLength(0);
    });

    it('should handle null and undefined', () => {
      expect(collectBlobRefs(null)).toHaveLength(0);
      expect(collectBlobRefs(undefined)).toHaveLength(0);
    });
  });

  describe('processStreamingSync', () => {
    const defaultBlobOptions = {
      concurrency: 5,
      strategy: 'lazy' as const,
      fetchBlob: async () => new ArrayBuffer(0),
    };

    it('should process simple streaming response', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        {
          type: 'changes',
          tbl: 'files',
          objects: [
            { key: 'file-1', value: { name: 'test.txt' } },
            { key: 'file-2', value: { name: 'doc.pdf' } },
          ],
          realmId: 'realm-1',
        },
        { type: 'realm-complete', realmId: 'realm-1' },
        {
          type: 'footer',
          serverRevision: 'rev-2',
          realms: ['realm-1'],
          inviteRealms: [],
          schema: {},
        },
      ];

      const stream = createMockStream(messages);
      const written: Array<{ table: string; objects: unknown[] }> = [];
      const completedRealms: string[] = [];

      const footer = await processStreamingSync(
        stream,
        {
          bulkPut: async (table, objects) => {
            written.push({ table, objects });
          },
          onRealmComplete: (realmId) => {
            completedRealms.push(realmId);
          },
        },
        defaultBlobOptions
      );

      expect(footer.serverRevision).toBe('rev-2');
      expect(footer.realms).toEqual(['realm-1']);
      expect(written).toHaveLength(1);
      expect(written[0].table).toBe('files');
      expect(written[0].objects).toHaveLength(2);
      expect(completedRealms).toEqual(['realm-1']);
    });

    it('should handle chunked network delivery', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        { type: 'changes', tbl: 'items', objects: [{ key: 'a', value: {} }] },
        {
          type: 'footer',
          serverRevision: 'rev-2',
          realms: [],
          inviteRealms: [],
          schema: {},
        },
      ];

      // Deliver in very small chunks to test buffer handling
      const stream = createChunkedStream(messages, 10);

      const footer = await processStreamingSync(
        stream,
        { bulkPut: async () => {} },
        defaultBlobOptions
      );

      expect(footer.serverRevision).toBe('rev-2');
    });

    it('should skip already-completed realms on resume', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 2 },
        // Realm 1 - already completed
        {
          type: 'changes',
          tbl: 'files',
          objects: [{ key: 'f1', value: {} }],
          realmId: 'realm-1',
        },
        { type: 'realm-complete', realmId: 'realm-1' },
        // Realm 2 - needs processing
        {
          type: 'changes',
          tbl: 'files',
          objects: [{ key: 'f2', value: {} }],
          realmId: 'realm-2',
        },
        { type: 'realm-complete', realmId: 'realm-2' },
        {
          type: 'footer',
          serverRevision: 'rev-2',
          realms: ['realm-1', 'realm-2'],
          inviteRealms: [],
          schema: {},
        },
      ];

      const stream = createMockStream(messages);
      const written: string[] = [];

      await processStreamingSync(
        stream,
        {
          bulkPut: async (_, objects) => {
            objects.forEach((o) => written.push(o.key));
          },
        },
        defaultBlobOptions,
        // Resume state: realm-1 already completed
        {
          snapshotRevision: 'rev-1',
          completedRealms: ['realm-1'],
          startedAt: Date.now(),
          processedCount: 1,
        }
      );

      // Should only have written realm-2's data
      expect(written).toEqual(['f2']);
    });

    it('should save progress periodically', async () => {
      // Create 3 change messages with 100 objects each
      const pad = (n: number) => n.toString().padStart(4, '0');
      const chunk1 = Array.from({ length: 100 }, (_, i) => ({
        key: `k${pad(i)}`,
        value: {},
      }));
      const chunk2 = Array.from({ length: 100 }, (_, i) => ({
        key: `k${pad(100 + i)}`,
        value: {},
      }));
      const chunk3 = Array.from({ length: 50 }, (_, i) => ({
        key: `k${pad(200 + i)}`,
        value: {},
      }));

      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        { type: 'changes', tbl: 'items', objects: chunk1 },
        { type: 'changes', tbl: 'items', objects: chunk2 },
        { type: 'changes', tbl: 'items', objects: chunk3 },
        {
          type: 'footer',
          serverRevision: 'rev-2',
          realms: [],
          inviteRealms: [],
          schema: {},
        },
      ];

      const stream = createMockStream(messages);
      const savedProgress: StreamSyncProgress[] = [];

      await processStreamingSync(
        stream,
        {
          bulkPut: async () => {},
          saveProgress: async (p) => {
            savedProgress.push({ ...p });
          },
        },
        defaultBlobOptions
      );

      // Should save at 100 and 200 objects
      expect(savedProgress.length).toBeGreaterThanOrEqual(2);
      expect(savedProgress[0].processedCount).toBe(100);
      expect(savedProgress[1].processedCount).toBe(200);
    });

    it('should resolve blob refs with eager strategy', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        {
          type: 'changes',
          tbl: 'files',
          objects: [
            {
              key: 'file-1',
              value: {
                name: 'test.bin',
                content: { $t: 'ArrayBuffer', $ref: 'blob-abc', $size: 1000 },
              },
            },
          ],
        },
        {
          type: 'footer',
          serverRevision: 'rev-2',
          realms: [],
          inviteRealms: [],
          schema: {},
        },
      ];

      const stream = createMockStream(messages);
      let writtenValue: any;

      await processStreamingSync(
        stream,
        {
          bulkPut: async (_, objects) => {
            writtenValue = objects[0].value;
          },
        },
        {
          concurrency: 5,
          strategy: 'eager',
          fetchBlob: async (id) => {
            expect(id).toBe('blob-abc');
            return new ArrayBuffer(1000);
          },
        }
      );

      // After eager resolution, content should be ArrayBuffer
      expect(writtenValue.content).toBeInstanceOf(ArrayBuffer);
    });

    it('should throw if stream ends without footer', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        // Missing footer
      ];

      const stream = createMockStream(messages);

      await expect(
        processStreamingSync(stream, { bulkPut: async () => {} }, defaultBlobOptions)
      ).rejects.toThrow('Streaming sync ended without footer');
    });

    it('should call onHeader callback', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 5, estimatedObjects: 1000 },
        { type: 'footer', serverRevision: 'rev-1', realms: [], inviteRealms: [], schema: {} },
      ];

      const stream = createMockStream(messages);
      let receivedHeader: any;

      await processStreamingSync(
        stream,
        {
          bulkPut: async () => {},
          onHeader: (header) => {
            receivedHeader = header;
          },
        },
        defaultBlobOptions
      );

      expect(receivedHeader.snapshotRevision).toBe('rev-1');
      expect(receivedHeader.totalRealms).toBe(5);
      expect(receivedHeader.estimatedObjects).toBe(1000);
    });

    it('should track progress correctly', async () => {
      const messages: StreamSyncMessage[] = [
        { type: 'header', snapshotRevision: 'rev-1', totalRealms: 1 },
        {
          type: 'changes',
          tbl: 'items',
          objects: [{ key: 'a', value: {} }, { key: 'b', value: {} }],
          realmId: 'realm-1',
        },
        { type: 'realm-complete', realmId: 'realm-1' },
        { type: 'footer', serverRevision: 'rev-2', realms: ['realm-1'], inviteRealms: [], schema: {} },
      ];

      const stream = createMockStream(messages);
      let lastProgress: StreamSyncProgress | undefined;

      await processStreamingSync(
        stream,
        {
          bulkPut: async () => {},
          saveProgress: async (p) => {
            lastProgress = { ...p };
          },
        },
        defaultBlobOptions
      );

      expect(lastProgress).toBeDefined();
      expect(lastProgress!.completedRealms).toContain('realm-1');
      expect(lastProgress!.snapshotRevision).toBe('rev-1');
    });
  });
});
