import { proxy, subscribe, getVersion } from 'valtio/vanilla';
import * as Y from 'yjs';
import deepEqual from 'fast-deep-equal';
import { parseProxyOps } from './parseProxyOps';

const isProxyObject = <T>(x: T): x is T & Record<string, unknown> =>
  typeof x === 'object' && x !== null && getVersion(x) !== undefined;

const isProxyArray = <T>(x: T): x is T & unknown[] =>
  Array.isArray(x) && getVersion(x) !== undefined;

const isPrimitiveMapValue = (v: unknown) =>
  v === null ||
  typeof v === 'string' ||
  typeof v === 'number' ||
  typeof v === 'boolean';

const isPrimitiveArrayValue = (v: unknown) =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

type Options = {
  transactionOrigin?: any;
};

const transact = (doc: Y.Doc | null, opts: Options, fn: () => void) => {
  if (doc) {
    doc.transact(fn, opts.transactionOrigin);
  } else {
    fn();
  }
};

export const bindProxyAndYMap = <T>(
  p: Record<string, T>,
  y: Y.Map<T>,
  opts: Options = {},
) => {
  const pv2yvCache = new WeakMap<object, unknown>();

  const setPValueToY = (pv: T, k: string) => {
    transact(y.doc, opts, () => {
      if (
        isProxyObject(pv) &&
        pv2yvCache.has(pv) &&
        pv2yvCache.get(pv) === y.get(k)
      ) {
        return;
      }
      if (isProxyArray(pv)) {
        const yv = new Y.Array();
        pv2yvCache.set(pv, yv);
        bindProxyAndYArray(pv, yv, opts);
        y.set(k, yv as unknown as T);
      } else if (isProxyObject(pv)) {
        const yv = new Y.Map();
        pv2yvCache.set(pv, yv);
        bindProxyAndYMap(pv, yv, opts);
        y.set(k, yv as unknown as T);
      } else if (isPrimitiveMapValue(pv)) {
        y.set(k, pv);
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('unsupported p type', pv);
      }
    });
  };

  const setYValueToP = (yv: T, k: string) => {
    const prev = p[k];
    if (isProxyObject(prev) && pv2yvCache.get(prev) === yv) {
      return;
    }
    if (yv instanceof Y.Array) {
      const pv = proxy([]);
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv, opts);
      p[k] = pv as unknown as T;
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv, opts);
      p[k] = pv as unknown as T;
    } else if (isPrimitiveMapValue(yv)) {
      p[k] = yv;
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('unsupported y type', yv);
    }
  };

  // initialize from p
  Object.entries(p).forEach(([k, pv]) => {
    const yv = y.get(k);
    if (
      isProxyArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv, opts);
    } else if (
      !Array.isArray(pv) &&
      isProxyObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv, opts);
    } else {
      setPValueToY(pv, k);
    }
  });

  // initialize from y
  y.forEach((yv, k) => {
    const pv = p[k];
    if (
      isProxyArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv, opts);
    } else if (
      !Array.isArray(pv) &&
      isProxyObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv, opts);
    } else {
      setYValueToP(yv, k);
    }
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
        const pv = p[k];
        const yv = y.get(k);
        if (!deepEqual(yv instanceof Y.AbstractType ? yv.toJSON() : yv, pv)) {
          setPValueToY(pv, k);
        }
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

export const bindProxyAndYArray = <T>(
  p: T[],
  y: Y.Array<T>,
  opts: Options = {},
) => {
  const pv2yvCache = new WeakMap<object, unknown>();

  const insertPValueToY = (pv: T, i: number) => {
    if (isProxyArray(pv)) {
      const yv = new Y.Array();
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv, opts);
      y.insert(i, [yv as unknown as T]);
    } else if (isProxyObject(pv)) {
      const yv = new Y.Map();
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv, opts);
      y.insert(i, [yv as unknown as T]);
    } else if (isPrimitiveArrayValue(pv)) {
      y.insert(i, [pv]);
    } else {
      throw new Error('unsupported p type');
    }
  };

  const insertYValueToP = (yv: T, i: number) => {
    if (yv instanceof Y.Array) {
      const pv = proxy([]);
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv, opts);
      p.splice(i, 0, pv as unknown as T);
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
      p.splice(i, 0, pv as unknown as T);
    } else if (isPrimitiveArrayValue(yv)) {
      p.splice(i, 0, yv);
    } else {
      throw new Error('unsupported y type');
    }
  };

  // initialize from p
  p.forEach((pv, i) => {
    const yv = y.get(i);
    if (
      isProxyArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYArray(pv, yv, opts);
      }
    } else if (
      !Array.isArray(pv) &&
      isProxyObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYMap(pv, yv, opts);
      }
    } else if (
      isPrimitiveArrayValue(pv) &&
      isPrimitiveArrayValue(yv) &&
      pv === yv
    ) {
      // do nothing
    } else {
      insertPValueToY(pv, i);
    }
  });

  // initialize from y
  y.forEach((yv, i) => {
    const pv = p[i];
    if (
      isProxyArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYArray(pv, yv, opts);
      }
    } else if (
      !Array.isArray(pv) &&
      isProxyObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYMap(pv, yv, opts);
      }
    } else if (
      isPrimitiveArrayValue(pv) &&
      isPrimitiveArrayValue(yv) &&
      pv === yv
    ) {
      // do nothing
    } else {
      insertYValueToP(yv, i);
    }
  });

  // strip p
  p.splice(y.length);

  // subscribe p
  subscribe(p, (ops) => {
    const arrayOps = parseProxyOps(ops);
    if (deepEqual(y.toJSON(), p)) {
      return;
    }
    transact(y.doc, opts, () => {
      arrayOps.forEach((op) => {
        const i = op[1];
        if (op[0] === 'delete') {
          if (y.length > i) {
            y.delete(i, 1);
          }
          return;
        }
        const pv = p[i];
        if (pv === undefined) {
          return;
        }
        if (op[0] === 'set') {
          if (y.length > i) {
            y.delete(i, 1);
          }
          insertPValueToY(pv, i);
        } else if (op[0] === 'insert') {
          insertPValueToY(pv, i);
        }
      });
    });
  });

  // subscribe y
  y.observe((event) => {
    if (deepEqual(p, y.toJSON())) {
      return;
    }
    let retain = 0;
    event.changes.delta.forEach((item) => {
      if (item.retain) {
        retain += item.retain;
      }
      if (item.delete) {
        p.splice(retain, item.delete);
      }
      if (item.insert) {
        if (Array.isArray(item.insert)) {
          item.insert.forEach((yv, i) => {
            insertYValueToP(yv, retain + i);
          });
        } else {
          insertYValueToP(item.insert as unknown as T, retain);
        }
        retain += item.insert.length;
      }
    });
  });
};
