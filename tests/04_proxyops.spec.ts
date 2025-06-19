/* eslint @typescript-eslint/no-explicit-any: "off" */

import { describe, expect, it } from 'vitest';
import { proxy, subscribe } from 'valtio/vanilla';
import { parseProxyOps } from '../src/parseProxyOps.js';

describe('single operation', () => {
  it('push', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.push('d');
    await Promise.resolve();
    expect(lastOps).toEqual([['set', ['3'], 'd', undefined]]);
    expect(parseProxyOps(lastOps)).toEqual([['set', 3, 'd', undefined]]);
  });

  it('unshift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.unshift('d');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['2'], 'b', 'c'],
      ['set', ['1'], 'a', 'b'],
      ['set', ['0'], 'd', 'a'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['insert', 0, 'd', undefined]]);
  });

  it('pop', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.pop();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 2, 'c', undefined]]);
  });

  it('shift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.shift();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['0'], 'b', 'a'],
      ['set', ['1'], 'c', 'b'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 0, 'a', undefined]]);
  });

  it('splice 0 1', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(0, 1);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['0'], 'b', 'a'],
      ['set', ['1'], 'c', 'b'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 0, 'a', undefined]]);
  });

  it('splice 0 2', async () => {
    const p = proxy(['a', 'b', 'c', 'd']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(0, 2);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['0'], 'c', 'a'],
      ['set', ['1'], 'd', 'b'],
      ['delete', ['3'], 'd'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 4],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 1, 'b', undefined],
      ['delete', 0, 'a', undefined],
    ]);
  });

  it('splice 1 1', async () => {
    const p = proxy(['a', 'b', 'c', 'd']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 1);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['1'], 'c', 'b'],
      ['set', ['2'], 'd', 'c'],
      ['delete', ['3'], 'd'],
      ['set', ['length'], 3, 4],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 1, 'b', undefined]]);
  });

  it('splice 1 2', async () => {
    const p = proxy(['a', 'b', 'c', 'd']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 2);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['1'], 'd', 'b'],
      ['delete', ['3'], 'd'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 4],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, 'c', undefined],
      ['delete', 1, 'b', undefined],
    ]);
  });

  it('splice 2 2', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e', 'f']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(2, 2);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['2'], 'e', 'c'],
      ['set', ['3'], 'f', 'd'],
      ['delete', ['5'], 'f'],
      ['delete', ['4'], 'e'],
      ['set', ['length'], 4, 6],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 3, 'd', undefined],
      ['delete', 2, 'c', undefined],
    ]);
  });

  it('splice 1 3', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e', 'f']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 3);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['1'], 'e', 'b'],
      ['set', ['2'], 'f', 'c'],
      ['delete', ['5'], 'f'],
      ['delete', ['4'], 'e'],
      ['delete', ['3'], 'd'],
      ['set', ['length'], 3, 6],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 3, 'd', undefined],
      ['delete', 2, 'c', undefined],
      ['delete', 1, 'b', undefined],
    ]);
  });

  it('splice 1 0 d', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 0, 'd');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['2'], 'b', 'c'],
      ['set', ['1'], 'd', 'b'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['insert', 1, 'd', undefined]]);
  });

  it('splice 1 0 d e', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 0, 'd', 'e');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['4'], 'c', undefined],
      ['set', ['3'], 'b', undefined],
      ['set', ['1'], 'd', 'b'],
      ['set', ['2'], 'e', 'c'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['insert', 1, 'd', undefined],
      ['insert', 2, 'e', undefined],
    ]);
  });

  it('splice 1 0 d e f', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 0, 'd', 'e', 'f');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['5'], 'c', undefined],
      ['set', ['4'], 'b', undefined],
      ['set', ['1'], 'd', 'b'],
      ['set', ['2'], 'e', 'c'],
      ['set', ['3'], 'f', undefined],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['insert', 1, 'd', undefined],
      ['insert', 2, 'e', undefined],
      ['set', 3, 'f', undefined],
    ]);
  });

  it('splice 1 1 e f g', async () => {
    const p = proxy(['a', 'b', 'c', 'd']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 1, 'e', 'f', 'g');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['5'], 'd', undefined],
      ['set', ['4'], 'c', undefined],
      ['set', ['1'], 'e', 'b'],
      ['set', ['2'], 'f', 'c'],
      ['set', ['3'], 'g', 'd'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 1, 'e', 'b'],
      ['insert', 2, 'f', undefined],
      ['insert', 3, 'g', undefined],
    ]);
  });

  it('splice 1 1 e f g with 5 initial items', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'x']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 1, 'e', 'f', 'g');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['6'], 'x', undefined],
      ['set', ['5'], 'd', undefined],
      ['set', ['4'], 'c', 'x'],
      ['set', ['1'], 'e', 'b'],
      ['set', ['2'], 'f', 'c'],
      ['set', ['3'], 'g', 'd'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 1, 'e', 'b'],
      ['insert', 2, 'f', undefined],
      ['insert', 3, 'g', undefined],
    ]);
  });

  it('splice 1 2 e f g', async () => {
    const p = proxy(['a', 'b', 'c', 'd']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 2, 'e', 'f', 'g');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['4'], 'd', undefined],
      ['set', ['1'], 'e', 'b'],
      ['set', ['2'], 'f', 'c'],
      ['set', ['3'], 'g', 'd'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 1, 'e', 'b'],
      ['set', 2, 'f', 'c'],
      ['insert', 3, 'g', undefined],
    ]);
  });

  it('splice -1 1', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(-1, 1);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 2, 'c', undefined]]);
  });

  it('splice -2 1', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(-2, 1);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['1'], 'c', 'b'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([['delete', 1, 'b', undefined]]);
  });

  it('splice -2 1 d e', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(-2, 1, 'd', 'e');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['1'], 'd', 'b'],
      ['set', ['2'], 'e', 'c'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 1, 'd', 'b'],
      ['insert', 2, 'e', undefined],
    ]);
  });
});

describe('double operations', () => {
  it('push and push', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.push('d');
    p.push('e');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'd', undefined],
      ['set', ['4'], 'e', undefined],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 3, 'd', undefined],
      ['set', 4, 'e', undefined],
    ]);
  });

  it('unshift and unshift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.unshift('d');
    p.unshift('e');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['2'], 'b', 'c'],
      ['set', ['1'], 'a', 'b'],
      ['set', ['0'], 'd', 'a'],
      ['set', ['4'], 'c', undefined],
      ['set', ['3'], 'b', 'c'],
      ['set', ['2'], 'a', 'b'],
      ['set', ['1'], 'd', 'a'],
      ['set', ['0'], 'e', 'd'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['insert', 0, 'd', undefined],
      ['insert', 0, 'e', undefined],
    ]);
  });

  it('push and pop', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.push('d');
    p.pop();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'd', undefined],
      ['delete', ['3'], 'd'],
      ['set', ['length'], 3, 4],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['set', 3, 'd', undefined],
      ['delete', 3, 'd', undefined],
    ]);
  });

  it('pop and push', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.pop();
    p.push('d');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
      ['set', ['2'], 'd', undefined],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, 'c', undefined],
      ['set', 2, 'd', undefined],
    ]);
  });

  it('unshift and shift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.unshift('d');
    p.shift();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['2'], 'b', 'c'],
      ['set', ['1'], 'a', 'b'],
      ['set', ['0'], 'd', 'a'],
      ['set', ['0'], 'a', 'd'],
      ['set', ['1'], 'b', 'a'],
      ['set', ['2'], 'c', 'b'],
      ['delete', ['3'], 'c'],
      ['set', ['length'], 3, 4],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['insert', 0, 'd', undefined],
      ['delete', 0, 'd', undefined],
    ]);
  });

  it('shift and unshift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.shift();
    p.unshift('d');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['0'], 'b', 'a'],
      ['set', ['1'], 'c', 'b'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
      ['set', ['2'], 'c', undefined],
      ['set', ['1'], 'b', 'c'],
      ['set', ['0'], 'd', 'b'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 0, 'a', undefined],
      ['insert', 0, 'd', undefined],
    ]);
  });

  it('pop and pop', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.pop();
    p.pop();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
      ['delete', ['1'], 'b'],
      ['set', ['length'], 1, 2],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, 'c', undefined],
      ['delete', 1, 'b', undefined],
    ]);
  });

  it('shift and shift', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.shift();
    p.shift();
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['0'], 'b', 'a'],
      ['set', ['1'], 'c', 'b'],
      ['delete', ['2'], 'c'],
      ['set', ['length'], 2, 3],
      ['set', ['0'], 'c', 'b'],
      ['delete', ['1'], 'c'],
      ['set', ['length'], 1, 2],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 0, 'a', undefined],
      ['delete', 0, 'b', undefined],
    ]);
  });

  it('splice 1 0 and splice 1 0', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.splice(1, 0, 'd');
    p.splice(2, 0, 'e');
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['3'], 'c', undefined],
      ['set', ['2'], 'b', 'c'],
      ['set', ['1'], 'd', 'b'],
      ['set', ['4'], 'c', undefined],
      ['set', ['3'], 'b', 'c'],
      ['set', ['2'], 'e', 'b'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['insert', 1, 'd', undefined],
      ['insert', 2, 'e', undefined],
    ]);
  });

  it('moveUp (#7)', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    const [item] = p.splice(2, 1);
    p.splice(2 - 1, 0, item!);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['2'], 'd', 'c'],
      ['set', ['3'], 'e', 'd'],
      ['delete', ['4'], 'e'],
      ['set', ['length'], 4, 5],
      ['set', ['4'], 'e', undefined],
      ['set', ['3'], 'd', 'e'],
      ['set', ['2'], 'b', 'd'],
      ['set', ['1'], 'c', 'b'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, 'c', undefined],
      ['insert', 1, 'c', undefined],
    ]);
  });

  it('moveDown (#7)', async () => {
    const p = proxy(['a', 'b', 'c', 'd', 'e']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    const [item] = p.splice(2, 1);
    p.splice(2 + 1, 0, item!);
    await Promise.resolve();
    expect(lastOps).toEqual([
      ['set', ['2'], 'd', 'c'],
      ['set', ['3'], 'e', 'd'],
      ['delete', ['4'], 'e'],
      ['set', ['length'], 4, 5],
      ['set', ['4'], 'e', undefined],
      ['set', ['3'], 'c', 'e'],
    ]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, 'c', undefined],
      ['insert', 3, 'c', undefined],
    ]);
  });

  it('support mutations on length', async () => {
    const p = proxy(['a', 'b', 'c']);
    let lastOps: any;
    subscribe(p, (ops) => {
      lastOps = ops;
    });

    p.length = 2;
    await Promise.resolve();
    expect(lastOps).toEqual([['set', ['length'], 2, 3]]);
    expect(parseProxyOps(lastOps)).toEqual([
      ['delete', 2, undefined, undefined],
    ]);
  });
});
