import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('issue #7', () => {
  it('array item move up', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e']);
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    bind(p, a);

    const moveUp = (index: number) => {
      const [item] = p.splice(index, 1);
      p.splice(index - 1, 0, item!);
    };

    moveUp(2);
    await Promise.resolve();
    expect(a.toJSON()).toEqual(['a', 'c', 'b', 'd', 'e']);
    expect(p).toEqual(['a', 'c', 'b', 'd', 'e']);

    moveUp(3);
    await Promise.resolve();
    expect(a.toJSON()).toEqual(['a', 'c', 'd', 'b', 'e']);
    expect(p).toEqual(['a', 'c', 'd', 'b', 'e']);
  });

  it('array item move down', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e']);
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    bind(p, a);

    const moveDown = (index: number) => {
      const [item] = p.splice(index, 1);
      p.splice(index + 1, 0, item!);
    };

    moveDown(2);
    await Promise.resolve();
    expect(a.toJSON()).toEqual(['a', 'b', 'd', 'c', 'e']);
    expect(p).toEqual(['a', 'b', 'd', 'c', 'e']);

    moveDown(1);
    await Promise.resolve();
    expect(a.toJSON()).toEqual(['a', 'd', 'b', 'c', 'e']);
    expect(p).toEqual(['a', 'd', 'b', 'c', 'e']);
  });
});
