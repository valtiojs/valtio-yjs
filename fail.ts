import * as Y from 'yjs';
import { proxy } from 'valtio/vanilla';
import { bindProxyAndYMap } from './src/index';

const doc = new Y.Doc();
const p = proxy({ items: { item1: { color: 'blue' } } });
const m = doc.getMap('map');

bindProxyAndYMap(p, m);

// p.items.item1.color = 'red';
p.items.item1 = { color: 'red' };
