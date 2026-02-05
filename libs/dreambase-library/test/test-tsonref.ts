/**
 * Tests for TSONRef and blob reference utilities
 */

import {
  TSONRef,
  TSONRefData,
  hasTSONRefs,
  collectTSONRefs,
  replaceTSONRefs,
  resolveAllRefs,
} from '../src/typeson-simplified/TSONRef.js';

describe('TSONRef', () => {
  afterEach(() => {
    TSONRef.resolver = null;
  });

  describe('constructor and properties', () => {
    it('should create TSONRef with required properties', () => {
      const ref = new TSONRef('ArrayBuffer', 'test-id', 1024);

      expect(ref.type).toBe('ArrayBuffer');
      expect(ref.ref).toBe('test-id');
      expect(ref.size).toBe(1024);
      expect(ref.contentType).toBeUndefined();
    });

    it('should create TSONRef with contentType for Blob', () => {
      const ref = new TSONRef('Blob', 'blob-id', 2048, 'image/png');

      expect(ref.type).toBe('Blob');
      expect(ref.contentType).toBe('image/png');
    });

    it('should be frozen (immutable)', () => {
      const ref = new TSONRef('ArrayBuffer', 'id', 100);

      expect(Object.isFrozen(ref)).toBe(true);
      expect(() => {
        (ref as any).size = 200;
      }).toThrow();
    });
  });

  describe('isTSONRef', () => {
    it('should return true for TSONRef instance', () => {
      const ref = new TSONRef('ArrayBuffer', 'id', 100);
      expect(TSONRef.isTSONRef(ref)).toBe(true);
    });

    it('should return false for plain objects', () => {
      expect(TSONRef.isTSONRef({ type: 'ArrayBuffer', ref: 'id', size: 100 })).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(TSONRef.isTSONRef(null)).toBe(false);
      expect(TSONRef.isTSONRef(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(TSONRef.isTSONRef(42)).toBe(false);
      expect(TSONRef.isTSONRef('string')).toBe(false);
    });
  });

  describe('isTSONRefData', () => {
    it('should return true for valid $ref format', () => {
      const data: TSONRefData = { $t: 'ArrayBuffer', $ref: 'id', $size: 100 };
      expect(TSONRef.isTSONRefData(data)).toBe(true);
    });

    it('should return true with optional $ct', () => {
      const data: TSONRefData = { $t: 'Blob', $ref: 'id', $size: 100, $ct: 'image/png' };
      expect(TSONRef.isTSONRefData(data)).toBe(true);
    });

    it('should return false for incomplete data', () => {
      expect(TSONRef.isTSONRefData({ $t: 'ArrayBuffer', $ref: 'id' })).toBe(false);
      expect(TSONRef.isTSONRefData({ $t: 'ArrayBuffer', $size: 100 })).toBe(false);
    });

    it('should return false for TSONRef instance', () => {
      const ref = new TSONRef('ArrayBuffer', 'id', 100);
      expect(TSONRef.isTSONRefData(ref)).toBe(false);
    });
  });

  describe('fromData', () => {
    it('should create TSONRef from serialized data', () => {
      const data: TSONRefData = { $t: 'ArrayBuffer', $ref: 'blob-123', $size: 1024 };
      const ref = TSONRef.fromData(data);

      expect(ref).toBeInstanceOf(TSONRef);
      expect(ref.type).toBe('ArrayBuffer');
      expect(ref.ref).toBe('blob-123');
      expect(ref.size).toBe(1024);
    });

    it('should preserve contentType', () => {
      const data: TSONRefData = { $t: 'Blob', $ref: 'blob-456', $size: 2048, $ct: 'application/pdf' };
      const ref = TSONRef.fromData(data);

      expect(ref.contentType).toBe('application/pdf');
    });
  });

  describe('toJSON', () => {
    it('should serialize to $ref format', () => {
      const ref = new TSONRef('ArrayBuffer', 'blob-789', 4096);
      const json = ref.toJSON();

      expect(json).toEqual({
        $t: 'ArrayBuffer',
        $ref: 'blob-789',
        $size: 4096,
      });
    });

    it('should include $ct for blobs', () => {
      const ref = new TSONRef('Blob', 'blob-abc', 8192, 'text/plain');
      const json = ref.toJSON();

      expect(json.$ct).toBe('text/plain');
    });
  });

  describe('resolve', () => {
    it('should throw if resolver not configured', async () => {
      const ref = new TSONRef('ArrayBuffer', 'id', 100);

      await expect(ref.resolve()).rejects.toThrow('TSONRef.resolver not configured');
    });

    it('should resolve ArrayBuffer', async () => {
      const mockData = new ArrayBuffer(100);
      TSONRef.resolver = jest.fn().mockResolvedValue(mockData);

      const ref = new TSONRef('ArrayBuffer', 'id', 100);
      const result = await ref.resolve();

      expect(result).toBe(mockData);
      expect(TSONRef.resolver).toHaveBeenCalledWith(ref);
    });

    it('should resolve Uint8Array', async () => {
      const mockData = new ArrayBuffer(50);
      TSONRef.resolver = jest.fn().mockResolvedValue(mockData);

      const ref = new TSONRef<Uint8Array>('Uint8Array', 'id', 50);
      const result = await ref.resolve();

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(50);
    });

    it('should resolve Blob with contentType', async () => {
      const mockData = new ArrayBuffer(200);
      TSONRef.resolver = jest.fn().mockResolvedValue(mockData);

      const ref = new TSONRef<Blob>('Blob', 'id', 200, 'image/jpeg');
      const result = await ref.resolve();

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/jpeg');
      expect(result.size).toBe(200);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct all TypedArray types', () => {
      const buffer = new ArrayBuffer(16);
      const types = [
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array',
      ];

      for (const typeName of types) {
        const ref = new TSONRef(typeName, 'id', 16);
        const result = ref.reconstruct(buffer);
        expect(result.constructor.name).toBe(typeName);
      }
    });
  });
});

describe('hasTSONRefs', () => {
  it('should return false for objects without refs', () => {
    expect(hasTSONRefs({ name: 'test', count: 42 })).toBe(false);
    expect(hasTSONRefs([1, 2, 3])).toBe(false);
    expect(hasTSONRefs(null)).toBe(false);
  });

  it('should return true for TSONRef instance', () => {
    const ref = new TSONRef('ArrayBuffer', 'id', 100);
    expect(hasTSONRefs(ref)).toBe(true);
    expect(hasTSONRefs({ data: ref })).toBe(true);
  });

  it('should return true for $ref format', () => {
    const data: TSONRefData = { $t: 'ArrayBuffer', $ref: 'id', $size: 100 };
    expect(hasTSONRefs(data)).toBe(true);
    expect(hasTSONRefs({ nested: { data } })).toBe(true);
  });

  it('should find refs in arrays', () => {
    const ref = new TSONRef('ArrayBuffer', 'id', 100);
    expect(hasTSONRefs([1, ref, 3])).toBe(true);
  });
});

describe('collectTSONRefs', () => {
  it('should return empty array for objects without refs', () => {
    expect(collectTSONRefs({ name: 'test' })).toEqual([]);
    expect(collectTSONRefs(null)).toEqual([]);
  });

  it('should collect TSONRef instances', () => {
    const ref1 = new TSONRef('ArrayBuffer', 'ref-1', 100);
    const ref2 = new TSONRef('Uint8Array', 'ref-2', 200);
    const obj = { file: ref1, data: ref2 };

    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(2);
    expect(refs).toContain(ref1);
    expect(refs).toContain(ref2);
  });

  it('should convert $ref format to TSONRef', () => {
    const data: TSONRefData = { $t: 'ArrayBuffer', $ref: 'blob-id', $size: 100 };
    const obj = { content: data };

    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toBeInstanceOf(TSONRef);
    expect(refs[0].ref).toBe('blob-id');
  });

  it('should find refs in nested structures', () => {
    const ref = new TSONRef('ArrayBuffer', 'nested-ref', 100);
    const obj = {
      level1: {
        level2: {
          items: [{ data: ref }],
        },
      },
    };

    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toBe(ref);
  });
});

describe('replaceTSONRefs', () => {
  it('should replace TSONRef with resolved data', async () => {
    const mockData = new ArrayBuffer(100);
    const resolver = jest.fn().mockResolvedValue(mockData);

    const ref = new TSONRef('ArrayBuffer', 'blob-1', 100);
    const obj = { content: ref };

    await replaceTSONRefs(obj, resolver);

    expect(obj.content).toBe(mockData);
    expect(resolver).toHaveBeenCalledWith(ref);
  });

  it('should replace $ref format with resolved data', async () => {
    const mockData = new ArrayBuffer(100);
    const resolver = jest.fn().mockResolvedValue(mockData);

    const obj = {
      content: { $t: 'ArrayBuffer', $ref: 'blob-2', $size: 100 } as TSONRefData,
    };

    await replaceTSONRefs(obj, resolver);

    expect(obj.content).toBe(mockData);
  });

  it('should handle multiple refs with concurrency', async () => {
    const resolver = jest.fn().mockImplementation(async (ref: TSONRef) => {
      await new Promise((r) => setTimeout(r, 10));
      return new ArrayBuffer(ref.size);
    });

    const refs = Array.from({ length: 10 }, (_, i) => new TSONRef('ArrayBuffer', `ref-${i}`, 100));
    const obj = { items: refs.map((r) => ({ data: r })) };

    await replaceTSONRefs(obj, resolver, 3);

    // All should be resolved
    for (const item of obj.items) {
      expect((item as any).data).toBeInstanceOf(ArrayBuffer);
    }
  });

  it('should deduplicate refs with same ID', async () => {
    const resolver = jest.fn().mockResolvedValue(new ArrayBuffer(100));

    const obj = {
      a: new TSONRef('ArrayBuffer', 'same-id', 100),
      b: new TSONRef('ArrayBuffer', 'same-id', 100),
    };

    await replaceTSONRefs(obj, resolver);

    // Should only fetch once
    expect(resolver).toHaveBeenCalledTimes(1);
  });
});

describe('resolveAllRefs', () => {
  afterEach(() => {
    TSONRef.resolver = null;
  });

  it('should throw if resolver not configured', async () => {
    await expect(resolveAllRefs({})).rejects.toThrow('TSONRef.resolver not configured');
  });

  it('should use TSONRef.resolver', async () => {
    const mockData = new ArrayBuffer(100);
    TSONRef.resolver = jest.fn().mockResolvedValue(mockData);

    const ref = new TSONRef('ArrayBuffer', 'id', 100);
    const obj = { data: ref };

    await resolveAllRefs(obj);

    expect(obj.data).toBe(mockData);
  });
});
