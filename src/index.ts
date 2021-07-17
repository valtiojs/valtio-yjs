import { proxy, subscribe } from 'valtio/vanilla';
import * as Y from 'yjs';
import deepEqual from 'fast-deep-equal';

const isObject = (x: unknown): x is Record<string, unknown> => (
  typeof x === 'object' && x !== null
);

export const bindProxyAndYMap = <T>(p: Record<string, T>, y: Y.Map<T>) => {
  // initialize from y
  y.forEach((v, k) => {
    if (v instanceof Y.Array) {
      const vv = proxy(v.toJSON());
      bindProxyAndYArray(vv, v);
      p[k] = vv as unknown as T;
    } else if (v instanceof Y.Map) {
      const vv = proxy(v.toJSON());
      bindProxyAndYMap(vv, v);
      p[k] = vv as unknown as T;
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      p[k] = v;
    } else {
      throw new Error('unsupported y type');
    }
  });

  // initialize from p
  Object.keys(p).forEach((k) => {
    const v = p[k];
    if (Array.isArray(v)) {
      const vv = new Y.Array();
      bindProxyAndYArray(v, vv);
      y.set(k, vv as unknown as T);
    } else if (isObject(v)) {
      const vv = new Y.Map();
      bindProxyAndYMap(v, vv);
      y.set(k, vv as unknown as T);
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      y.set(k, v);
    } else {
      throw new Error('unsupported p type');
    }
  });

  // subscribe y
  y.observe((event) => {
    event.keysChanged.forEach((k) => {
      const v = y.get(k);
      if (v === undefined) {
        delete p[k];
      } else if (v instanceof Y.Array) {
        const vv = proxy(v.toJSON());
        if (!deepEqual(p[k], vv)) {
          bindProxyAndYArray(vv, v);
          p[k] = vv as unknown as T;
        }
      } else if (v instanceof Y.Map) {
        const vv = proxy(v.toJSON());
        if (!deepEqual(p[k], vv)) {
          bindProxyAndYMap(vv, v);
          p[k] = vv as unknown as T;
        }
      } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        p[k] = v;
      } else {
        throw new Error('unsupported y type');
      }
    });
  });

  // subscribe p
  subscribe(p, (ops) => {
    ops.forEach((op) => {
      const path = op[1];
      if (path.length !== 1) {
        return;
      }
      const k = path[0] as string;
      if (op[0] === 'delete') {
        y.delete(k);
      } else if (op[0] === 'set') {
        const v = p[k];
        if (Array.isArray(v)) {
          const vv = new Y.Array();
          bindProxyAndYArray(v, vv);
          y.set(k, vv as unknown as T);
        } else if (isObject(v)) {
          const vv = new Y.Map();
          bindProxyAndYMap(v, vv);
          y.set(k, vv as unknown as T);
        } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          y.set(k, v);
        } else {
          throw new Error('unsupported p type');
        }
      }
    });
  });
};

export const bindProxyAndYArray = <T>(p: T[], y: Y.Array<T>) => {
  throw new Error(`TODO ${p} ${y}`);
};
