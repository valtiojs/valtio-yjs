import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxy } from '../src/index';

describe('bindProxy options', () => {
  it('transactionOrigin is included in Y.Doc events', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string }>({});
    const m = doc.getMap('map');

    const transactionOrigin = () => {
      const id = counter;
      counter += 1;
      return { id };
    };

    let counter = 0;
    bindProxy(p, m, {
      transactionOrigin,
    });

    const fn = jest.fn();
    doc.on('updateV2', (_: Uint8Array, origin: any) => {
      fn(origin);
    });

    p.foo = 'bar';
    await Promise.resolve();
    expect(fn).toBeCalledWith(transactionOrigin);
    fn.mockClear();

    p.foo = 'baz';
    await Promise.resolve();
    expect(fn).toBeCalledWith(transactionOrigin);
  });
});

describe('bindProxy', () => {
  it('transactionOrigin is included in Y.Doc events', async () => {
    const doc = new Y.Doc();
    const p = proxy<string[]>([]);
    const a = doc.getArray<string>('arr');

    const fn = jest.fn();
    doc.on('updateV2', (_: Uint8Array, origin: any) => {
      fn(origin);
    });

    const transactionOrigin = () => 'valtio-yjs';

    bindProxy(p, a, { transactionOrigin });

    p.push('a');
    await Promise.resolve();
    expect(fn).toBeCalledWith(transactionOrigin);
  });
});
