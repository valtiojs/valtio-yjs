import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxyAndYMap } from '../src/index';

describe('issue #14', () => {
  it('nested map direct set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);

    p.items.item1.color = 'red';
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map 1 level outer set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);

    p.items.item1 = { color: 'red' };
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map 2 level outer set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);

    p.items = { item1: { color: 'red' } };
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map array property replace', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { point: [0, 0] } } });
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);

    p.items.item1.point = [100, 100];
    await Promise.resolve();

    expect(m.get('items').get('item1').get('point').toJSON()).toStrictEqual([
      100, 100,
    ]);
  });

  it('nested map set trigger another y update #31', async () => {
    const proxy1 = proxy<Record<string, any>>();
    const proxy2 = proxy<Record<string, any>>();

    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    bindProxyAndYMap(proxy1, doc1.getMap('test'));
    bindProxyAndYMap(proxy2, doc2.getMap('test'));

    const listener1 = jest.fn((update) => {
      Y.applyUpdate(doc2, update, 'hello');
    });

    const listener2 = jest.fn();

    doc1.on('update', listener1);
    doc2.on('update', listener2);

    proxy1.b = { b: 'b' };

    await Promise.resolve();

    expect(listener1).toBeCalledTimes(1);
    expect(listener2).toBeCalledTimes(1);
  });
});
