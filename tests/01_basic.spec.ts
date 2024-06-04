/* eslint @typescript-eslint/no-explicit-any: "off" */

import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('bind', () => {
  it('simple map', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string }>({});
    const m = doc.getMap('map');

    bind(p, m);
    expect(p.foo).toBe(undefined);

    m.set('foo', 'a');
    expect(p.foo).toBe('a');

    p.foo = 'b';
    await Promise.resolve();
    expect(m.get('foo')).toBe('b');
  });

  it('simple map with initial values', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string; bar?: number }>({ foo: 'a' });
    const m = doc.getMap('map');
    m.set('bar', 1);

    bind(p, m);
    expect(p.foo).toBe('a');
    expect(p.bar).toBe(1);
    expect(m.get('foo')).toBe('a');
    expect(m.get('bar')).toBe(1);

    m.set('foo', 'b');
    expect(p.foo).toBe('b');

    p.bar = 2;
    await Promise.resolve();
    expect(m.get('bar')).toBe(2);
  });

  it('simple map with null value', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo: string | null }>({
      foo: null,
    });
    const m = doc.getMap('map');
    bind(p, m);

    expect(p.foo).toBe(null);
    expect(m.get('foo')).toBe(null);

    m.set('foo', 'bar');
    expect(p.foo).toBe('bar');
    expect(m.get('foo')).toBe('bar');

    p.foo = null;
    await Promise.resolve();
    expect(p.foo).toBe(null);
    expect(m.get('foo')).toBe(null);
  });

  it('nested map (from proxy)', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map') as any;

    bind(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = { bar: 'a' };
    await Promise.resolve();
    expect(p.foo.bar).toBe('a');
    expect(m.get('foo').get('bar')).toBe('a');

    m.get('foo').set('bar', 'b');
    expect(p.foo.bar).toBe('b');
    expect(m.get('foo').get('bar')).toBe('b');
  });

  it('nested map (from y.map)', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map') as any;

    bind(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    m.set('foo', new Y.Map());
    m.get('foo').set('bar', 'a');
    expect(p?.foo?.bar).toBe('a');
    expect(m.get('foo').get('bar')).toBe('a');

    (p as any).foo.bar = 'b';
    await Promise.resolve();
    expect(p?.foo?.bar).toBe('b');
    expect(m.get('foo').get('bar')).toBe('b');
  });

  it('is a single transaction', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string; bar?: number }>({ foo: 'a', bar: 5 });
    const m = doc.getMap('map') as any;

    const listener = vi.fn();
    doc.on('update', listener);

    bind(p, m);

    expect(listener).toBeCalledTimes(1);
  });

  it('can unsubscribe', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string }>({});
    const m = doc.getMap('map');

    const unsub = bind(p, m);

    unsub();
    expect(p.foo).toBe(undefined);

    m.set('foo', 'a');
    expect(m.get('foo')).toBe('a');
    expect(p.foo).toBe(undefined);

    p.foo = 'b';
    await Promise.resolve();
    expect(m.get('foo')).toBe('a');
    expect(p.foo).toBe('b');
  });
});

describe('bind', () => {
  it('simple array', async () => {
    const doc = new Y.Doc();
    const p = proxy<string[]>([]);
    const a = doc.getArray<string>('arr');

    bind(p, a);
    expect(p).toEqual([]);
    expect(a.toJSON()).toEqual([]);

    a.push(['a']);
    await Promise.resolve();
    expect(a.toJSON()).toEqual(['a']);
    expect(p).toEqual(['a']);

    p.push('b');
    await Promise.resolve();
    expect(p).toEqual(['a', 'b']);
    expect(a.toJSON()).toEqual(['a', 'b']);
  });

  describe('simple array with various operations', () => {
    const doc = new Y.Doc();
    const p = proxy([10, 11, 12, 13]);
    const a = doc.getArray<number>('arr');

    bind(p, a);

    it('a push', async () => {
      a.push([20]);
      await Promise.resolve();
      expect(a.toJSON()).toEqual([10, 11, 12, 13, 20]);
      expect(p).toEqual([10, 11, 12, 13, 20]);
    });

    it('p push', async () => {
      p.push(21);
      await Promise.resolve();
      expect(p).toEqual([10, 11, 12, 13, 20, 21]);
      expect(a.toJSON()).toEqual([10, 11, 12, 13, 20, 21]);
    });

    it('a pop', async () => {
      a.delete(5, 1);
      await Promise.resolve();
      expect(a.toJSON()).toEqual([10, 11, 12, 13, 20]);
      expect(p).toEqual([10, 11, 12, 13, 20]);
    });

    it('p pop', async () => {
      p.pop();
      await Promise.resolve();
      expect(p).toEqual([10, 11, 12, 13]);
      expect(a.toJSON()).toEqual([10, 11, 12, 13]);
    });

    it('a unshift', async () => {
      a.unshift([9]);
      await Promise.resolve();
      expect(a.toJSON()).toEqual([9, 10, 11, 12, 13]);
      expect(p).toEqual([9, 10, 11, 12, 13]);
    });

    it('p unshift', async () => {
      p.unshift(8);
      await Promise.resolve();
      expect(p).toEqual([8, 9, 10, 11, 12, 13]);
      expect(a.toJSON()).toEqual([8, 9, 10, 11, 12, 13]);
    });

    it('a shift', async () => {
      a.delete(0, 1);
      await Promise.resolve();
      expect(a.toJSON()).toEqual([9, 10, 11, 12, 13]);
      expect(p).toEqual([9, 10, 11, 12, 13]);
    });

    it('a shift', async () => {
      p.shift();
      await Promise.resolve();
      expect(p).toEqual([10, 11, 12, 13]);
      expect(a.toJSON()).toEqual([10, 11, 12, 13]);
    });

    it('a replace', async () => {
      doc.transact(() => {
        a.delete(2, 1);
        a.insert(2, [99]);
      });
      await Promise.resolve();
      expect(p).toEqual([10, 11, 99, 13]);
      expect(a.toJSON()).toEqual([10, 11, 99, 13]);
    });

    it('p replace', async () => {
      p[2] = 98;
      await Promise.resolve();
      expect(p).toEqual([10, 11, 98, 13]);
      expect(a.toJSON()).toEqual([10, 11, 98, 13]);
    });

    it('p splice (delete+insert)', async () => {
      p.splice(2, 1, 97);
      await Promise.resolve();
      expect(p).toEqual([10, 11, 97, 13]);
      expect(a.toJSON()).toEqual([10, 11, 97, 13]);
    });

    it('p splice (delete)', async () => {
      p.splice(1, 1);
      await Promise.resolve();
      expect(p).toEqual([10, 97, 13]);
      expect(a.toJSON()).toEqual([10, 97, 13]);
    });

    it('p splice (insert)', async () => {
      p.splice(1, 0, 95, 96);
      await Promise.resolve();
      expect(p).toEqual([10, 95, 96, 97, 13]);
      expect(a.toJSON()).toEqual([10, 95, 96, 97, 13]);
    });
  });
});
