import { proxy, subscribe, getVersion } from 'valtio/vanilla';
import * as Y from 'yjs';
import deepEqual from 'fast-deep-equal';
import { parseProxyOps } from './parseProxyOps';

const isProxyObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && getVersion(x) !== undefined;

const isProxyArray = (x: unknown): x is unknown[] =>
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

export function bindProxy<T>(
  p: Record<string, T> | T[],
  y: Y.Map<T> | Y.Array<T>,
  opts: Options = {},
): void {
  if (isProxyArray(p) && !(y instanceof Y.Array)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('proxy not same type');
    }
  }

  if (isProxyObject(p) && !isProxyArray(p) && !(y instanceof Y.Map)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('proxy not same type');
    }
  }

  const pv2yvCache = new WeakMap<object, unknown>();

  // initialize from p
  initializeFromP(p, y, pv2yvCache, opts);

  // initialize from y
  initializeFromY(p, y, pv2yvCache, opts);

  if (isProxyArray(p) && y instanceof Y.Array) {
    p.splice(y.length);
  }

  // subscribe p
  subscribeP(p, y, pv2yvCache, opts);

  // subscribe y
  subscribeY(y, p, pv2yvCache, opts);
}

const initializeFromP = <T>(
  p: Record<string, T> | T[],
  y: Y.Map<T> | Y.Array<T>,
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) => {
  if (isProxyObject(p) && y instanceof Y.Map) {
    Object.entries(p).forEach(([k, pv]) => {
      const yv = y.get(k);
      if (
        isProxyArray(pv) &&
        yv instanceof Y.Array &&
        deepEqual(pv, yv.toJSON())
      ) {
        pv2yvCache.set(pv, yv);
        bindProxy(pv, yv, opts);
      } else if (
        !Array.isArray(pv) &&
        isProxyObject(pv) &&
        yv instanceof Y.Map &&
        deepEqual(pv, yv.toJSON())
      ) {
        pv2yvCache.set(pv, yv);
        bindProxy(pv, yv, opts);
      } else {
        insertPValueToY(pv, y, k, pv2yvCache, opts);
      }
    });
  }

  if (isProxyArray(p) && y instanceof Y.Array) {
    p.forEach((pv, i) => {
      const yv = y.get(i);
      if (
        isProxyArray(pv) &&
        yv instanceof Y.Array &&
        deepEqual(pv, yv.toJSON())
      ) {
        if (pv2yvCache.get(pv) !== yv) {
          pv2yvCache.set(pv, yv);
          bindProxy(pv, yv, opts);
        }
      } else if (
        !Array.isArray(pv) &&
        isProxyObject(pv) &&
        yv instanceof Y.Map &&
        deepEqual(pv, yv.toJSON())
      ) {
        if (pv2yvCache.get(pv) !== yv) {
          pv2yvCache.set(pv, yv);
          bindProxy(pv, yv, opts);
        }
      } else if (
        isPrimitiveArrayValue(pv) &&
        isPrimitiveArrayValue(yv) &&
        pv === yv
      ) {
        // do nothing
      } else {
        insertPValueToY(pv, y, i, pv2yvCache, opts);
      }
    });
  }
};

const initializeFromY = <T>(
  p: Record<string, T> | T[],
  y: Y.Map<T> | Y.Array<T>,
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) => {
  if (isProxyObject(p) && y instanceof Y.Map) {
    y.forEach((yv, k) => {
      const pv = p[k];
      if (
        isProxyArray(pv) &&
        yv instanceof Y.Array &&
        deepEqual(pv, yv.toJSON())
      ) {
        pv2yvCache.set(pv, yv);
        bindProxy(pv, yv, opts);
      } else if (
        !Array.isArray(pv) &&
        isProxyObject(pv) &&
        yv instanceof Y.Map &&
        deepEqual(pv, yv.toJSON())
      ) {
        pv2yvCache.set(pv, yv);
        bindProxy(pv, yv, opts);
      } else {
        insertYValueToP(yv, p, k, pv2yvCache, opts);
      }
    });
  }

  if (isProxyArray(p) && y instanceof Y.Array) {
    y.forEach((yv, i) => {
      const pv = p[i];
      if (
        isProxyArray(pv) &&
        yv instanceof Y.Array &&
        deepEqual(pv, yv.toJSON())
      ) {
        if (pv2yvCache.get(pv) !== yv) {
          pv2yvCache.set(pv, yv);
          bindProxy(pv, yv, opts);
        }
      } else if (
        !Array.isArray(pv) &&
        isProxyObject(pv) &&
        yv instanceof Y.Map &&
        deepEqual(pv, yv.toJSON())
      ) {
        if (pv2yvCache.get(pv) !== yv) {
          pv2yvCache.set(pv, yv);
          bindProxy(pv, yv, opts);
        }
      } else if (
        isPrimitiveArrayValue(pv) &&
        isPrimitiveArrayValue(yv) &&
        pv === yv
      ) {
        // do nothing
      } else {
        insertYValueToP(yv, p, i, pv2yvCache, opts);
      }
    });
  }
};

function insertPValueToY<T>(
  pv: T,
  y: Y.Map<T> | Y.Array<T>,
  k: number | string,
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) {
  if (y instanceof Y.Map && typeof k === 'string') {
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
        bindProxy(pv, yv, opts);
        y.set(k, yv as unknown as T);
      } else if (isProxyObject(pv)) {
        const yv = new Y.Map();
        pv2yvCache.set(pv, yv);
        bindProxy(pv, yv, opts);
        y.set(k, yv as unknown as T);
      } else if (isPrimitiveMapValue(pv)) {
        y.set(k, pv);
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('unsupported p type', pv);
      }
    });
  }

  if (y instanceof Y.Array && typeof k === 'number') {
    if (isProxyArray(pv)) {
      const yv = new Y.Array();
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      y.insert(k, [yv as unknown as T]);
    } else if (isProxyObject(pv)) {
      const yv = new Y.Map();
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      y.insert(k, [yv as unknown as T]);
    } else if (isPrimitiveArrayValue(pv)) {
      y.insert(k, [pv]);
    } else {
      throw new Error('unsupported p type');
    }
  }
}

function insertYValueToP<T>(
  yv: T,
  p: Record<string, T> | T[],
  k: number | string,
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) {
  if (isProxyObject(p) && typeof k === 'string') {
    const prev = p[k];
    if (isProxyObject(prev) && pv2yvCache.get(prev) === yv) {
      return;
    }
    if (yv instanceof Y.Array) {
      const pv = proxy([]);
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      p[k] = pv as unknown as T;
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      p[k] = pv as unknown as T;
    } else if (isPrimitiveMapValue(yv)) {
      p[k] = yv;
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('unsupported y type', yv);
    }
  }

  if (isProxyArray(p) && typeof k === 'number') {
    if (yv instanceof Y.Array) {
      const pv = proxy([]);
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      p.splice(k, 0, pv as unknown as T);
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxy(pv, yv, opts);
      p.splice(k, 0, pv as unknown as T);
    } else if (isPrimitiveArrayValue(yv)) {
      p.splice(k, 0, yv);
    } else {
      throw new Error('unsupported y type');
    }
  }
}

function subscribeP<T>(
  p: Record<string, T> | T[],
  y: Y.Map<T> | Y.Array<T>,
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) {
  if (isProxyObject(p) && y instanceof Y.Map) {
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
            insertPValueToY(pv, y, k, pv2yvCache, opts);
          }
        }
      });
    });
  }

  if (isProxyArray(p) && y instanceof Y.Array) {
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
            insertPValueToY(pv, y, i, pv2yvCache, opts);
          } else if (op[0] === 'insert') {
            insertPValueToY(pv, y, i, pv2yvCache, opts);
          }
        });
      });
    });
  }
}

function subscribeY<T>(
  y: Y.Map<T> | Y.Array<T>,
  p: Record<string, T> | T[],
  pv2yvCache: WeakMap<object, unknown>,
  opts: Options,
) {
  if (isProxyObject(p) && y instanceof Y.Map) {
    y.observe((event) => {
      event.keysChanged.forEach((k) => {
        const yv = y.get(k);
        if (yv === undefined) {
          delete p[k];
        } else {
          insertYValueToP(yv, p, k, pv2yvCache, opts);
        }
      });
    });
  }

  if (isProxyArray(p) && y instanceof Y.Array) {
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
              insertYValueToP(yv, p, retain + i, pv2yvCache, opts);
            });
          } else {
            insertYValueToP(
              item.insert as unknown as T,
              p,
              retain,
              pv2yvCache,
              opts,
            );
          }
          retain += item.insert.length;
        }
      });
    });
  }
}
