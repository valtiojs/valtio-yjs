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

  it.skip('shift', async () => {
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
});
