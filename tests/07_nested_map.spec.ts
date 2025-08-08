/* eslint @typescript-eslint/no-explicit-any: "off" */

import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { proxy, subscribe } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('issue #14', () => {
  it('nested map direct set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bind(p, m);

    p.items.item1.color = 'red';
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map 1 level outer set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bind(p, m);

    p.items.item1 = { color: 'red' };
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map 2 level outer set', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { color: 'blue' } } });
    const m = doc.getMap('map') as any;

    bind(p, m);

    p.items = { item1: { color: 'red' } };
    await Promise.resolve();

    expect(m.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('nested map array property replace', async () => {
    const doc = new Y.Doc();
    const p = proxy({ items: { item1: { point: [0, 0] } } });
    const m = doc.getMap('map') as any;

    bind(p, m);

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

    bind(proxy1, doc1.getMap('test'));
    bind(proxy2, doc2.getMap('test'));

    const listener1 = vi.fn((update) => {
      Y.applyUpdate(doc2, update, 'hello');
    });

    const listener2 = vi.fn();

    doc1.on('update', listener1);
    doc2.on('update', listener2);

    proxy1.b = { b: 'b' };

    await Promise.resolve();

    expect(listener1).toBeCalledTimes(1);
    expect(listener2).toBeCalledTimes(1);
  });

  it('nested map uses ymap value on bind', async () => {
    const proxy1 = proxy({ items: { item1: { color: 'blue' } } });
    const proxy2 = proxy({ items: { item1: { color: 'blue' } } });

    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const map1 = doc1.getMap('map') as any;
    const map2 = doc2.getMap('map') as any;

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
    });

    bind(proxy1, map1);

    proxy1.items = { item1: { color: 'red' } };
    await Promise.resolve();
    expect(map1.get('items').get('item1').get('color')).toStrictEqual('red');

    bind(proxy2, map2);

    await Promise.resolve();
    expect(map1.get('items').get('item1').get('color')).toStrictEqual('red');
  });

  it('triggers a limited set of updates on bind', async () => {
    const proxy1 = proxy<Record<string, any>>({ items: {} });
    const proxy2 = proxy<Record<string, any>>({ items: {} });

    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const map1 = doc1.getMap('map') as any;
    const map2 = doc2.getMap('map') as any;

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    doc1.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc2, update);
      listener1();
    });
    doc2.on('update', (update: Uint8Array) => {
      Y.applyUpdate(doc1, update);
      listener2();
    });

    bind(proxy1, map1);
    proxy1.items.item1 = { color: 'red' };
    proxy1.items.item2 = { color: 'red' };
    proxy1.items.item3 = { color: 'red' };

    await Promise.resolve();
    bind(proxy2, map2);
    await Promise.resolve();

    expect(listener1).toBeCalledTimes(2);
    expect(listener2).toBeCalledTimes(2);
  });

  it('nested map delete', async () => {
    type State = Record<
      'items',
      {
        [key: string]: {
          color: string;
        };
      }
    >;
    const doc = new Y.Doc();
    const p = proxy<State>({
      items: { item1: { color: 'blue' }, item2: { color: 'red' } },
    });
    const m = doc.getMap('map') as any;

    bind(p, m);

    delete p.items.item1;
    await Promise.resolve();

    expect(m.get('items').get('item1')).toBeUndefined();
    expect(m.get('items').get('item2')).toBeDefined();
  });

  it('nested map delete child and parent', async () => {
    type State = Record<
      'parents',
      {
        [key: string]: Record<
          'children',
          {
            [key: string]: {
              color: string;
            };
          }
        >;
      }
    >;
    const doc = new Y.Doc();
    const p = proxy<State>({
      parents: {
        parent1: {
          children: {
            child1: { color: 'blue' },
          },
        },
        parent2: {
          children: {
            child2: { color: 'red' },
          },
        },
      },
    });
    const m = doc.getMap('map') as any;

    bind(p, m);

    delete p.parents.parent1!.children.child1;
    delete p.parents.parent1;
    await Promise.resolve();

    expect(m.toJSON()).toStrictEqual({
      parents: {
        parent2: {
          children: {
            child2: { color: 'red' },
          },
        },
      },
    });
  });

  it('nested map with undefined value', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ a?: { b: number; c: string | undefined } }>({});
    bind(p, doc.getMap());
    p.a = { b: 1, c: undefined };
    await Promise.resolve();
    expect(doc.getMap().get('a')).toBeDefined();
  });
});

describe('issue #56', () => {
  it('no second assign', async () => {
    const doc = new Y.Doc();
    const p = proxy({ a: { b: 1, c: 2 } });
    const sub = vi.fn();
    subscribe(p, sub, true);
    bind(p, doc.getMap());
    p.a = { b: 10, c: 20 };
    await Promise.resolve();
    expect(sub).toHaveBeenCalledOnce();
  });
});
