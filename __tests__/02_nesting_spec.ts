import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxyAndYMap } from '../src/index';

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
    bindProxyAndYMap(p1, m1);

    const p2 = proxy<{ foo?: string }>({});
    const m2 = doc2.getMap('map');
    bindProxyAndYMap(p2, m2);

    p1.foo = 'a';
    await Promise.resolve();
    expect(p1.foo).toBe('a');
    expect(m1.get('foo')).toBe('a');
    expect(m2.get('foo')).toBe('a');
    expect(p2.foo).toBe('a');

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
    const m1 = doc1.getMap('map');
    bindProxyAndYMap(p1, m1);

    const p2 = proxy<{ foo?: { bar?: string } }>({});
    const m2 = doc2.getMap('map');
    bindProxyAndYMap(p2, m2);

    p1.foo = { bar: 'a' };
    await Promise.resolve();
    expect(p1.foo.bar).toBe('a');
    expect(m1.get('foo').get('bar')).toBe('a');
    expect(m2.get('foo').get('bar')).toBe('a');
    expect(p2.foo?.bar).toBe('a');

    p1.foo.bar = 'b';
    await Promise.resolve();
    expect(p1.foo.bar).toBe('b');
    expect(m1.get('foo').get('bar')).toBe('b');
    expect(m2.get('foo').get('bar')).toBe('b');
    expect(p2.foo?.bar).toBe('b');
  });
});
