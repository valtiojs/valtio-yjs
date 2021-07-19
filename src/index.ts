import { proxy, subscribe } from 'valtio/vanilla';
import * as Y from 'yjs';
import deepEqual from 'fast-deep-equal';

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null;

export const bindProxyAndYMap = <T>(p: Record<string, T>, y: Y.Map<T>) => {
  const setPValueToY = (pv: T, k: string) => {
    if (Array.isArray(pv)) {
      const prev = y.get(k);
      if (!(prev instanceof Y.Array) || !deepEqual(prev.toJSON(), pv)) {
        const yv = new Y.Array();
        bindProxyAndYArray(pv, yv);
        y.set(k, yv as unknown as T);
      }
    } else if (isObject(pv)) {
      const prev = y.get(k);
      if (!(prev instanceof Y.Map) || !deepEqual(prev.toJSON(), pv)) {
        const yv = new Y.Map();
        bindProxyAndYMap(pv, yv);
        y.set(k, yv as unknown as T);
      }
    } else if (
      typeof pv === 'string' ||
      typeof pv === 'number' ||
      typeof pv === 'boolean'
    ) {
      y.set(k, pv);
    } else {
      throw new Error('unsupported p type');
    }
  };

  const setYValueToP = (yv: T, k: string) => {
    if (yv instanceof Y.Array) {
      const json = yv.toJSON();
      if (!deepEqual(p[k], json)) {
        const pv = proxy(json);
        bindProxyAndYArray(pv, yv);
        p[k] = pv as unknown as T;
      }
    } else if (yv instanceof Y.Map) {
      const json = yv.toJSON();
      if (!deepEqual(p[k], json)) {
        const pv = proxy(json);
        bindProxyAndYMap(pv, yv);
        p[k] = pv as unknown as T;
      }
    } else if (
      typeof yv === 'string' ||
      typeof yv === 'number' ||
      typeof yv === 'boolean'
    ) {
      p[k] = yv;
    } else {
      throw new Error('unsupported y type');
    }
  };

  // initialize from p
  Object.keys(p).forEach((k) => {
    const pv = p[k];
    setPValueToY(pv, k);
  });

  // initialize from y
  y.forEach(setYValueToP);

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
        const pv = p[k];
        setPValueToY(pv, k);
      }
    });
  });

  // subscribe y
  y.observe((event) => {
    event.keysChanged.forEach((k) => {
      const yv = y.get(k);
      if (yv === undefined) {
        delete p[k];
      } else {
        setYValueToP(yv, k);
      }
    });
  });
};

export const bindProxyAndYArray = <T>(p: T[], y: Y.Array<T>) => {
  throw new Error(`TODO ${p} ${y}`);
};
