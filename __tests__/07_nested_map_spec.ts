import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxyAndYMap } from '../src/index';

describe('issue #14', () => {
  it('nested map direct set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map');

    bindProxyAndYMap(p, m);

    p.items.item1.color = 'red';
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map 1 level outer set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map');

    bindProxyAndYMap(p, m);

    p.items.item1 = { color: 'red' };
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });
});
