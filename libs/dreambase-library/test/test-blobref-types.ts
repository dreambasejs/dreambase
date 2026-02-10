/**
 * Tests for BlobRef type definitions
 */

import { TypesonSimplified } from '../src/typeson-simplified/TypesonSimplified.js';
import {
  BLOB_THRESHOLD,
  blobRefTypeDefs,
  createBlobRefContext,
  BlobStore,
  BlobRefContext,
} from '../src/typeson-simplified/types/BlobRef.js';
import { TSONRef } from '../src/typeson-simplified/TSONRef.js';

describe('BlobRef Type Definitions', () => {
  describe('BLOB_THRESHOLD', () => {
    it('should be 4KB', () => {
      expect(BLOB_THRESHOLD).toBe(4 * 1024);
    });
  });

  describe('createBlobRefContext', () => {
    it('should create context with blob store', () => {
      const mockStore: BlobStore = {
        store: () => 'blob-id',
      };
      const ctx = createBlobRefContext(mockStore);

      expect(ctx.blobStore).toBe(mockStore);
      expect(ctx.threshold).toBe(BLOB_THRESHOLD);
    });

    it('should allow custom threshold', () => {
      const mockStore: BlobStore = {
        store: () => 'blob-id',
      };
      const ctx = createBlobRefContext(mockStore, { threshold: 1024 });

      expect(ctx.threshold).toBe(1024);
    });
  });

  describe('ArrayBuffer serialization', () => {
    const tson = TypesonSimplified(blobRefTypeDefs);

    it('should inline small ArrayBuffer', () => {
      const small = new ArrayBuffer(100);
      const json = tson.stringify({ data: small });
      const parsed = JSON.parse(json);

      expect(parsed.data.$t).toBe('ArrayBuffer');
      expect(parsed.data.$v).toBeDefined();
      expect(parsed.data.$ref).toBeUndefined();
    });

    it('should use blob ref for large ArrayBuffer with context', () => {
      const large = new ArrayBuffer(BLOB_THRESHOLD + 100);
      let storedData: ArrayBuffer | null = null;

      const mockStore: BlobStore = {
        store: (data: ArrayBuffer) => {
          storedData = data;
          return 'mock-blob-id';
        },
      };
      const ctx = createBlobRefContext(mockStore);

      const json = tson.stringify({ data: large }, ctx);
      const parsed = JSON.parse(json);

      expect(parsed.data.$t).toBe('ArrayBuffer');
      expect(parsed.data.$ref).toBe('mock-blob-id');
      expect(parsed.data.$size).toBe(large.byteLength);
      expect(parsed.data.$v).toBeUndefined();
      expect(storedData).toBe(large);
    });

    it('should inline large ArrayBuffer without context', () => {
      const large = new ArrayBuffer(BLOB_THRESHOLD + 100);
      const json = tson.stringify({ data: large });
      const parsed = JSON.parse(json);

      // Without blob store context, falls back to inline
      expect(parsed.data.$v).toBeDefined();
      expect(parsed.data.$ref).toBeUndefined();
    });

    it('should revive inline ArrayBuffer', () => {
      const original = new ArrayBuffer(100);
      new Uint8Array(original).set([1, 2, 3, 4, 5]);

      const json = tson.stringify({ data: original });
      const revived = tson.parse(json);

      expect(revived.data).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(revived.data).slice(0, 5)).toEqual(
        new Uint8Array([1, 2, 3, 4, 5])
      );
    });

    it('should revive blob ref as TSONRef', () => {
      const refJson = JSON.stringify({
        data: { $t: 'ArrayBuffer', $ref: 'blob-123', $size: 10000 },
      });

      const revived = tson.parse(refJson);

      expect(TSONRef.isTSONRef(revived.data)).toBe(true);
      expect(revived.data.ref).toBe('blob-123');
      expect(revived.data.size).toBe(10000);
    });
  });

  describe('TypedArray serialization', () => {
    const tson = TypesonSimplified(blobRefTypeDefs);

    it('should inline small Uint8Array', () => {
      const small = new Uint8Array([1, 2, 3, 4, 5]);
      const json = tson.stringify({ data: small });
      const parsed = JSON.parse(json);

      expect(parsed.data.$t).toBe('Uint8Array');
      expect(parsed.data.$v).toBeDefined();
    });

    it('should use blob ref for large Uint8Array with context', () => {
      const large = new Uint8Array(BLOB_THRESHOLD + 100);
      const mockStore: BlobStore = {
        store: () => 'typed-array-blob-id',
      };
      const ctx = createBlobRefContext(mockStore);

      const json = tson.stringify({ data: large }, ctx);
      const parsed = JSON.parse(json);

      expect(parsed.data.$t).toBe('Uint8Array');
      expect(parsed.data.$ref).toBe('typed-array-blob-id');
    });

    it('should revive inline Uint8Array', () => {
      const original = new Uint8Array([10, 20, 30]);
      const json = tson.stringify({ data: original });
      const revived = tson.parse(json);

      expect(revived.data).toBeInstanceOf(Uint8Array);
      expect(Array.from(revived.data)).toEqual([10, 20, 30]);
    });

    it('should revive Uint8Array blob ref as TSONRef', () => {
      const refJson = JSON.stringify({
        data: { $t: 'Uint8Array', $ref: 'u8-blob', $size: 5000 },
      });

      const revived = tson.parse(refJson);

      expect(TSONRef.isTSONRef(revived.data)).toBe(true);
      expect(revived.data.type).toBe('Uint8Array');
    });

    it('should handle all TypedArray types', () => {
      const types = [
        ['Int8Array', Int8Array],
        ['Uint8Array', Uint8Array],
        ['Uint8ClampedArray', Uint8ClampedArray],
        ['Int16Array', Int16Array],
        ['Uint16Array', Uint16Array],
        ['Int32Array', Int32Array],
        ['Uint32Array', Uint32Array],
        ['Float32Array', Float32Array],
        ['Float64Array', Float64Array],
      ] as const;

      for (const [name, Ctor] of types) {
        const arr = new Ctor(4);
        const json = tson.stringify({ data: arr });
        const parsed = JSON.parse(json);

        expect(parsed.data.$t).toBe(name);

        const revived = tson.parse(json);
        expect(revived.data).toBeInstanceOf(Ctor);
      }
    });
  });

  describe('forceInline option', () => {
    const tson = TypesonSimplified(blobRefTypeDefs);

    it('should inline even large data when forceInline is true', () => {
      const large = new ArrayBuffer(BLOB_THRESHOLD + 100);
      const ctx: BlobRefContext = {
        blobStore: { store: () => 'should-not-be-called' },
        forceInline: true,
      };

      const json = tson.stringify({ data: large }, ctx);
      const parsed = JSON.parse(json);

      expect(parsed.data.$v).toBeDefined();
      expect(parsed.data.$ref).toBeUndefined();
    });

    it('should throw when exceeding maxInlineSize', () => {
      const large = new ArrayBuffer(10000);
      const ctx: BlobRefContext = {
        forceInline: true,
        maxInlineSize: 5000,
      };

      expect(() => {
        tson.stringify({ data: large }, ctx);
      }).toThrow(/exceeds maxInlineSize/);
    });
  });

  describe('Blob handling', () => {
    const tson = TypesonSimplified(blobRefTypeDefs);

    it('should revive Blob $ref as TSONRef with contentType', () => {
      const refJson = JSON.stringify({
        image: { $t: 'Blob', $ref: 'image-blob', $size: 50000, $ct: 'image/png' },
      });

      const revived = tson.parse(refJson);

      expect(TSONRef.isTSONRef(revived.image)).toBe(true);
      expect(revived.image.type).toBe('Blob');
      expect(revived.image.contentType).toBe('image/png');
    });

    it('should throw when trying to serialize Blob directly', () => {
      const blob = new Blob(['hello'], { type: 'text/plain' });

      expect(() => {
        tson.stringify({ data: blob });
      }).toThrow(/Cannot serialize Blob directly/);
    });
  });

  describe('round-trip with resolution', () => {
    const tson = TypesonSimplified(blobRefTypeDefs);

    it('should complete round-trip with blob resolution', async () => {
      // Simulate server-side: serialize with blob offloading
      const original = new Uint8Array(BLOB_THRESHOLD + 100);
      original.fill(42);

      // Store blob data for later retrieval
      const blobStorage = new Map<string, ArrayBuffer>();
      const mockStore: BlobStore = {
        store: (data: ArrayBuffer) => {
          const id = `blob-${blobStorage.size}`;
          blobStorage.set(id, data);
          return id;
        },
      };
      const ctx = createBlobRefContext(mockStore);

      const json = tson.stringify({ data: original }, ctx);

      // Simulate client-side: parse and resolve
      const parsed = tson.parse(json);
      expect(TSONRef.isTSONRef(parsed.data)).toBe(true);

      // Configure resolver
      TSONRef.resolver = async (ref) => {
        const data = blobStorage.get(ref.ref);
        if (!data) throw new Error(`Blob not found: ${ref.ref}`);
        return data;
      };

      // Resolve the reference
      const resolved = await parsed.data.resolve();

      expect(resolved).toBeInstanceOf(Uint8Array);
      expect(resolved.length).toBe(original.length);
      expect(resolved[0]).toBe(42);

      // Cleanup
      TSONRef.resolver = null;
    });
  });
});
