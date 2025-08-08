/* eslint @typescript-eslint/no-explicit-any: "off" */

import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('https://codesandbox.io/s/ni1fk', () => {
  it('update proxy value through ydoc', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<{ foo?: string }>({});
    const m1 = doc1.getMap('map');
    bind(p1, m1);

    const p2 = proxy<{ foo?: string }>({});
    const m2 = doc2.getMap('map');
    bind(p2, m2);

    p1.foo = 'a';
    await Promise.resolve();
    expect(p1.foo).toBe('a');
    expect(m1.get('foo')).toBe('a');
    expect(m2.get('foo')).toBe('a');
    expect(p2.foo).toBe('a');

    await Promise.resolve();
    p1.foo = 'b';
    await Promise.resolve();
    expect(p1.foo).toBe('b');
    expect(m1.get('foo')).toBe('b');
    expect(m2.get('foo')).toBe('b');
    expect(p2.foo).toBe('b');
  });

  it('update proxy nested value through ydoc', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<{ foo?: { bar?: string } }>({});
    const m1 = doc1.getMap('map') as any;
    bind(p1, m1);

    const p2 = proxy<{ foo?: { bar?: string } }>({});
    const m2 = doc2.getMap('map') as any;
    bind(p2, m2);

    p1.foo = { bar: 'a' };
    await Promise.resolve();
    expect(p1.foo.bar).toBe('a');
    expect(m1.get('foo').get('bar')).toBe('a');
    expect(m2.get('foo').get('bar')).toBe('a');
    expect(p2.foo?.bar).toBe('a');

    await Promise.resolve();
    p1.foo.bar = 'b';
    await Promise.resolve();
    expect(p1.foo.bar).toBe('b');
    expect(m1.get('foo').get('bar')).toBe('b');
    expect(m2.get('foo').get('bar')).toBe('b');
    expect(p2.foo?.bar).toBe('b');
  });
});

describe('nested objects and arrays', () => {
  it('array in object', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<{ texts: string[] }>({ texts: [] });
    const m1 = doc1.getMap('map') as any;
    bind(p1, m1);

    const p2 = proxy<{ texts: string[] }>({ texts: [] });
    const m2 = doc2.getMap('map') as any;
    bind(p2, m2);

    p1.texts.push('a');
    await Promise.resolve();
    expect(p1.texts[0]).toBe('a');
    expect(m1.get('texts').get(0)).toBe('a');
    expect(m2.get('texts').get(0)).toBe('a');
    expect(p2.texts[0]).toBe('a');

    await Promise.resolve();
    p1.texts.push('b');
    await Promise.resolve();
    expect(p1.texts[1]).toBe('b');
    expect(m1.get('texts').get(1)).toBe('b');
    expect(m2.get('texts').get(1)).toBe('b');
    expect(p2.texts[1]).toBe('b');
  });

  it('object in array', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    type FooObj = { foo: string };
    const p1 = proxy<FooObj[]>([]);
    const a1 = doc1.getArray<FooObj>('arr');
    bind(p1, a1);

    const p2 = proxy<FooObj[]>([]);
    const a2 = doc2.getArray<FooObj>('arr');
    bind(p2, a2);

    p1.push({ foo: 'a' });
    await Promise.resolve();
    expect(p1[0]!.foo).toBe('a');
    expect((a1.get(0) as unknown as Y.Map<FooObj>).get('foo')).toBe('a');
    expect((a2.get(0) as unknown as Y.Map<FooObj>).get('foo')).toBe('a');
    expect(p2[0]!.foo).toBe('a');

    await Promise.resolve();
    p1.push({ foo: 'b' });
    await Promise.resolve();
    expect(p1[1]!.foo).toBe('b');
    expect((a1.get(1) as unknown as Y.Map<FooObj>).get('foo')).toBe('b');
    expect((a2.get(1) as unknown as Y.Map<FooObj>).get('foo')).toBe('b');
    expect(p2[1]!.foo).toBe('b');
  });

  it('array in array', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<string[][]>([]);
    const a1 = doc1.getArray<string[]>('arr');
    bind(p1, a1);

    const p2 = proxy<string[][]>([]);
    const a2 = doc2.getArray<string[]>('arr');
    bind(p2, a2);

    p1.push(['a']);
    await Promise.resolve();
    expect(p1[0]![0]).toBe('a');
    expect((a1.get(0) as unknown as Y.Array<string[]>).get(0)).toBe('a');
    expect((a2.get(0) as unknown as Y.Array<string[]>).get(0)).toBe('a');
    expect(p2[0]![0]).toBe('a');

    await Promise.resolve();
    p1.push(['b']);
    await Promise.resolve();
    expect(p1[1]![0]).toBe('b');
    expect((a1.get(1) as unknown as Y.Array<string[]>).get(0)).toBe('b');
    expect((a2.get(1) as unknown as Y.Array<string[]>).get(0)).toBe('b');
    expect(p2[1]![0]).toBe('b');
  });

  it('array with undefined', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<(string | undefined)[]>([]);
    const a1 = doc1.getArray<string | undefined>('arr');
    bind(p1, a1);

    const p2 = proxy<(string | undefined)[]>([]);
    const a2 = doc2.getArray<string | undefined>('arr');
    bind(p2, a2);

    p1.push('a');
    p1.push(undefined);
    p1.push('b');
    p1.push(undefined);
    await Promise.resolve();
    expect(p2[0]).toBe('a');
    expect(p2[1]).toBe(undefined);
    expect(p2[2]).toBe('b');
    expect(p2[3]).toBe(undefined);

    p1.length = 6;
    p1[5] = 'c';
    await Promise.resolve();
    expect(p1[4]).toBeUndefined();
    expect(p2[4]).toBeUndefined();
    expect(p2[5]).toBe('c');
    expect(p2.length).toBe(6);
  });

  it('object with undefined', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    const p1 = proxy<{ a: string | undefined; b: number | undefined }>({
      a: undefined,
      b: undefined,
    });
    const a1 = doc1.getMap('map');
    bind(p1, a1);

    const p2 = proxy<{ a: string | undefined; b: number | undefined }>({
      a: undefined,
      b: undefined,
    });
    const a2 = doc2.getMap('map');
    bind(p2, a2);

    expect(p1.a).toBeUndefined();
    expect(p1.b).toBeUndefined();
    expect(p2.a).toBeUndefined();
    expect(p2.b).toBeUndefined();
    p1.a = 'hello';
    await Promise.resolve();
    expect(p2.a).toBe('hello');
    p1.b = 10;
    await Promise.resolve();
    expect(p2.b).toBe(10);
    p1.a = undefined;
    await Promise.resolve();
    expect(p2.a).toBeUndefined();
    p1.b = undefined;
    await Promise.resolve();
    expect(p2.b).toBeUndefined();
  });
});
