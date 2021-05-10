import { subscribe, snapshot } from 'valtio/vanilla';
import * as Y from 'yjs';

const isObject = (x: unknown): x is Record<string, unknown> => (
  typeof x === 'object' && x !== null
);

const subscribers = new WeakMap();

export const bindProxyAndYMap = <T>(p: Record<string, T>, y: Y.Map<T>) => {
  const y2p = () => {
    y.forEach((v, k) => {
      if (v instanceof Y.Array) {
        throw new Error('TODO');
      } else if (v instanceof Y.Map) {
        throw new Error('TODO');
      } else if (v instanceof Y.AbstractType) {
        throw new Error('unsupported y type');
      } else {
        const vv = p[k];
        subscribers.get(vv as any)?.();
        p[k] = v;
      }
    });
  };
  let prevSnap = snapshot(p);
  const p2y = (force?: boolean) => {
    const nextSnap = snapshot(p);
    Object.keys(p).forEach((k) => {
      if (!force && Object.is(prevSnap[k], nextSnap[k])) {
        return;
      }
      const v = p[k];
      const vv = y.get(k);
      if (Array.isArray(v)) {
        if (vv instanceof Y.Array) {
          bindProxyAndYArray(v, vv);
        } else {
          subscribers.get(vv as any)?.();
          const a = new Y.Array();
          bindProxyAndYArray(v, a);
          y.set(k, a as any);
        }
      } else if (isObject(v)) {
        if (vv instanceof Y.Map) {
          bindProxyAndYMap(v, vv);
        } else {
          subscribers.get(vv as any)?.();
          const m = new Y.Map() as any;
          bindProxyAndYMap(v, m);
          y.set(k, m);
        }
      } else if (!Object.is(v, vv)) {
        subscribers.get(vv as any)?.();
        y.set(k, v);
      }
    });
    prevSnap = nextSnap;
  };
  y.observe(y2p);
  const unobserve = () => y.unobserve(y2p);
  subscribers.set(y, unobserve);
  y2p();
  const unsubscribe = subscribe(p, p2y);
  subscribers.set(p, unsubscribe);
  p2y(true);
};

export const unbind = (x: unknown) => {
  throw new Error(`TODO ${x}`);
};

export const bindProxyAndYArray = <T>(p: T[], y: Y.Array<T>) => {
  throw new Error(`TODO ${p} ${y}`);
};
