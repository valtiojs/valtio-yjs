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
});
