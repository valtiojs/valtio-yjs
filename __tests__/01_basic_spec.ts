import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxyAndYMap, bindProxyAndYArray } from '../src/index';

describe('bindProxyAndYMap', () => {
  it('simple map', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string }>({});
    const m = doc.getMap('map');

    bindProxyAndYMap(p, m);
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

    bindProxyAndYMap(p, m);
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

  it('nested map (from proxy)', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map');

    bindProxyAndYMap(p, m);
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
    const m = doc.getMap('map');

    bindProxyAndYMap(p, m);
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
});

describe('bindProxyAndYArray', () => {
  it('simple array', async () => {
    const doc = new Y.Doc();
    const p = proxy<string[]>([]);
    const a = doc.getArray<string>('arr');

    bindProxyAndYArray(p, a);
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

  it('simple array with various operations', async () => {
    const doc = new Y.Doc();
    const p = proxy([10, 11, 12, 13]);
    const a = doc.getArray<number>('arr');

    bindProxyAndYArray(p, a);

    a.push([20]);
    await Promise.resolve();
    expect(a.toJSON()).toEqual([10, 11, 12, 13, 20]);
    expect(p).toEqual([10, 11, 12, 13, 20]);

    p.push(21);
    await Promise.resolve();
    expect(p).toEqual([10, 11, 12, 13, 20, 21]);
    expect(a.toJSON()).toEqual([10, 11, 12, 13, 20, 21]);

    a.delete(5, 1);
    await Promise.resolve();
    expect(a.toJSON()).toEqual([10, 11, 12, 13, 20]);
    expect(p).toEqual([10, 11, 12, 13, 20]);

    p.pop();
    await Promise.resolve();
    expect(p).toEqual([10, 11, 12, 13]);
    expect(a.toJSON()).toEqual([10, 11, 12, 13]);

    a.unshift([9]);
    await Promise.resolve();
    expect(a.toJSON()).toEqual([9, 10, 11, 12, 13]);
    expect(p).toEqual([9, 10, 11, 12, 13]);

    p.unshift(8);
    await Promise.resolve();
    expect(p).toEqual([8, 9, 10, 11, 12, 13]);
    expect(a.toJSON()).toEqual([8, 9, 10, 11, 12, 13]);

    a.delete(0, 1);
    await Promise.resolve();
    expect(a.toJSON()).toEqual([9, 10, 11, 12, 13]);
    expect(p).toEqual([9, 10, 11, 12, 13]);

    p.shift();
    await Promise.resolve();
    expect(p).toEqual([10, 11, 12, 13]);
    expect(a.toJSON()).toEqual([10, 11, 12, 13]);

    doc.transact(() => {
      a.delete(2, 1);
      a.insert(2, [99]);
    });
    await Promise.resolve();
    expect(p).toEqual([10, 11, 99, 13]);
    expect(a.toJSON()).toEqual([10, 11, 99, 13]);

    p[2] = 98;
    await Promise.resolve();
    expect(p).toEqual([10, 11, 98, 13]);
    expect(a.toJSON()).toEqual([10, 11, 98, 13]);

    // TODO
    // splice with one
    // splice to remove
    // splice to insert
  });
});
