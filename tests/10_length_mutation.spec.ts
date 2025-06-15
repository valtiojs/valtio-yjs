import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('array length reset', () => {
  it('reset then push', async () => {
    const p = proxy<string[]>([]);
    const doc = new Y.Doc();
    const m = doc.getMap('map');
    const a = new Y.Array();
    m.set('arr', a);
    bind(p, a);

    p.push('a');
    p.push('b');
    p.length = 0;
    p.push('b');
    await Promise.resolve();

    expect(a.toJSON()).toEqual(['b']);
    expect(p).toEqual(['b']);
  });

  it('shrink then push', async () => {
    const p = proxy(['a', 'b', 'c']);
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    bind(p, a);

    p.length = 2;
    await Promise.resolve();

    expect(a.toJSON()).toEqual(['a', 'b']);
    expect(p).toEqual(['a', 'b']);

    p.push('c');
    await Promise.resolve();

    expect(a.toJSON()).toEqual(['a', 'b', 'c']);
    expect(p).toEqual(['a', 'b', 'c']);
  });

  it('extend', async () => {
    const p: string[] = proxy([]);
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    bind(p, a);
    p.push('a', 'b', 'c');
    await Promise.resolve();
    p.length = 5;
    p[4] = 'e';
    await Promise.resolve();
    expect(p.toString()).toEqual('a,b,c,,e');
    expect(a.toJSON()).toEqual(['a', 'b', 'c', null, 'e']);
  });
});
