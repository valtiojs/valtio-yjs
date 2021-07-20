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

type Op = [op: string, path: string[], value1: unknown, value2: unknown];
const guessInsertOps = (ops: Op[]): Op[] => {
  const newOps = [...ops];
  let i = 0;
  let startPos = -1;
  let startIdx = -1;
  const replaceWithInsert = () => {
    if (i - 1 > startPos) {
      newOps.splice(startPos, i - startPos, [
        'insert',
        [String(startIdx - (i - 1 - startPos))],
        newOps[i - 1][2],
        undefined,
      ]);
    }
  };
  while (i < newOps.length) {
    if (startPos >= 0) {
      if (
        newOps[i][0] === 'set' &&
        newOps[i][1].length === 1 &&
        newOps[i][1][0] === String(startIdx - (i - startPos)) &&
        newOps[i][3] === newOps[i - 1][2]
      ) {
        // continue
      } else {
        replaceWithInsert();
        startPos = -1;
        startIdx = -1;
      }
    } else if (
      newOps[i][0] === 'set' &&
      newOps[i][1].length === 1 &&
      newOps[i][3] === undefined
    ) {
      const idx = Number(newOps[i][1][0]);
      if (Number.isFinite(idx)) {
        startPos = i;
        startIdx = idx;
      }
    }
    i += 1;
  }
  if (startPos >= 0) {
    replaceWithInsert();
  }
  return newOps;
};

/*
console.log(
  guessInsertOps([
    ['set', ['3'], 'c', undefined],
    ['set', ['2'], 'b', 'c'],
    ['set', ['1'], 'a', 'b'],
    ['set', ['0'], 'd', 'a'],
  ]),
);
*/

export const bindProxyAndYArray = <T>(p: T[], y: Y.Array<T>) => {
  const insertPValueToY = (pv: T, i: number) => {
    if (Array.isArray(pv)) {
      const yv = new Y.Array();
      bindProxyAndYArray(pv, yv);
      y.insert(i, [yv as unknown as T]);
    } else if (isObject(pv)) {
      const yv = new Y.Map();
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
      bindProxyAndYArray(pv, yv);
      p.splice(i, 0, pv as unknown as T);
    } else if (yv instanceof Y.Map) {
      const pv = proxy(yv.toJSON());
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
    const json = yv instanceof Y.AbstractType ? yv.toJSON() : yv;
    if (!deepEqual(json, pv)) {
      insertPValueToY(pv, i);
    }
  });

  // initialize from y
  y.forEach((yv, i) => {
    const json = yv instanceof Y.AbstractType ? yv.toJSON() : yv;
    if (!deepEqual(p[i], json)) {
      insertYValueToP(yv, i);
    }
  });

  // strip p
  p.splice(y.length);

  // subscribe p
  subscribe(p, (ops) => {
    if (p.length === y.length) {
      return;
    }
    // console.log(ops);
    const transact = (fn: () => void) => {
      if (y.doc) {
        y.doc.transact(fn);
      } else {
        fn();
      }
    };
    transact(() => {
      guessInsertOps(ops as Op[]).forEach((op) => {
        const path = op[1];
        if (path.length !== 1) {
          return;
        }
        const i = Number(path[0]);
        if (Number.isFinite(i)) {
          if (op[0] === 'delete') {
            y.delete(i, 1);
          } else if (op[0] === 'set') {
            if (y.length > i) {
              y.delete(i, 1);
            }
            const pv = p[i];
            insertPValueToY(pv, i);
          } else if (op[0] === 'insert') {
            const pv = p[i];
            insertPValueToY(pv, i);
          }
        }
      });
    });
  });

  // subscribe y
  y.observe((event) => {
    if (y.length === p.length) {
      return;
    }
    // console.log(JSON.stringify(event.changes));
    let retain: number | undefined;
    event.changes.delta.forEach((item) => {
      if ('retain' in item) {
        retain = item.retain;
      }
      if (item.delete) {
        p.splice(retain || 0, item.delete);
      }
      if (item.insert) {
        if (Array.isArray(item.insert)) {
          item.insert.forEach((yv, i) => {
            insertYValueToP(yv, (retain || 0) + i);
          });
        } else {
          insertYValueToP(item.insert as unknown as T, retain || 0);
        }
      }
    });
  });
};
