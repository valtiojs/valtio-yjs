import { proxy, subscribe } from 'valtio/vanilla';
import { parseProxyOps } from '../src/parseProxyOps';

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
});

describe('double operations', () => {
  // TODO

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
});
