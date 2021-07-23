import { proxy, subscribe } from 'valtio/vanilla';
import * as Y from 'yjs';
import deepEqual from 'fast-deep-equal';
import { parseProxyOps } from './parseProxyOps';

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null;

export const bindProxyAndYMap = <T>(p: Record<string, T>, y: Y.Map<T>) => {
  const pv2yvCache = new WeakMap<object, unknown>();

  const setPValueToY = (pv: T, k: string) => {
    if (isObject(pv) && pv2yvCache.has(pv) && pv2yvCache.get(pv) === y.get(k)) {
      return;
    }
    if (Array.isArray(pv)) {
      const yv = new Y.Array();
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
      y.set(k, yv as unknown as T);
    } else if (isObject(pv)) {
      const yv = new Y.Map();
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
      y.set(k, yv as unknown as T);
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
    const prev = p[k];
    if (isObject(prev) && pv2yvCache.get(prev) === yv) {
      return;
    }
    if (yv instanceof Y.Array) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
      p[k] = pv as unknown as T;
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
      p[k] = pv as unknown as T;
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
  Object.entries(p).forEach(([k, pv]) => {
    const yv = y.get(k);
    if (
      Array.isArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
    } else if (
      !Array.isArray(pv) &&
      isObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
    } else {
      setPValueToY(pv, k);
    }
  });

  // initialize from y
  y.forEach((yv, k) => {
    const pv = p[k];
    if (
      Array.isArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
    } else if (
      !Array.isArray(pv) &&
      isObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
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
  const pv2yvCache = new WeakMap<object, unknown>();

  const insertPValueToY = (pv: T, i: number) => {
    if (Array.isArray(pv)) {
      const yv = new Y.Array();
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
      y.insert(i, [yv as unknown as T]);
    } else if (isObject(pv)) {
      const yv = new Y.Map();
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
      y.insert(i, [yv as unknown as T]);
    } else if (
      typeof pv === 'string' ||
      typeof pv === 'number' ||
      typeof pv === 'boolean'
    ) {
      y.insert(i, [pv]);
    } else {
      throw new Error('unsupported p type');
    }
  };

  const insertYValueToP = (yv: T, i: number) => {
    if (yv instanceof Y.Array) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYArray(pv, yv);
      p.splice(i, 0, pv as unknown as T);
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
      pv2yvCache.set(pv, yv);
      bindProxyAndYMap(pv, yv);
      p.splice(i, 0, pv as unknown as T);
    } else if (
      typeof yv === 'string' ||
      typeof yv === 'number' ||
      typeof yv === 'boolean'
    ) {
      p.splice(i, 0, yv);
    } else {
      throw new Error('unsupported y type');
    }
  };

  // initialize from p
  p.forEach((pv, i) => {
    const yv = y.get(i);
    if (
      Array.isArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYArray(pv, yv);
      }
    } else if (
      !Array.isArray(pv) &&
      isObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYMap(pv, yv);
      }
    } else {
      insertPValueToY(pv, i);
    }
  });

  // initialize from y
  y.forEach((yv, i) => {
    const pv = p[i];
    if (
      Array.isArray(pv) &&
      yv instanceof Y.Array &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYArray(pv, yv);
      }
    } else if (
      !Array.isArray(pv) &&
      isObject(pv) &&
      yv instanceof Y.Map &&
      deepEqual(pv, yv.toJSON())
    ) {
      if (pv2yvCache.get(pv) !== yv) {
        pv2yvCache.set(pv, yv);
        bindProxyAndYMap(pv, yv);
      }
    } else {
      insertYValueToP(yv, i);
    }
  });

  // strip p
  p.splice(y.length);

  // subscribe p
  subscribe(p, (ops) => {
    const arrayOps = parseProxyOps(ops);
    if (
      p.length === y.length &&
      p.every((pv, i) => {
        const yv = y.get(i);
        const json = yv instanceof Y.AbstractType ? yv.toJSON() : yv;
        // FIXME
        return deepEqual(pv, json);
      })
    ) {
      return;
    }
    // console.log(arrayOps);
    const transact = (fn: () => void) => {
      if (y.doc) {
        y.doc.transact(fn);
      } else {
        fn();
      }
    };
    transact(() => {
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
          // FIXME
          while (y.length < i) {
            // HACK it should be replaced in the same transact
            insertPValueToY(false as unknown as T, y.length);
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
    if (
      y.length === p.length &&
      event.changes.delta.reduce((a, c) => a + (c.insert?.length || 0), 0) !==
        event.changes.delta.reduce((a, c) => a + (c.delete || 0), 0)
    ) {
      return;
    }
    // console.log(JSON.stringify(event.changes));
    let retain = 0;
    event.changes.delta.forEach((item) => {
      if (item.retain) {
        retain = item.retain;
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
