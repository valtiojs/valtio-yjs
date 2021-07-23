import { subscribe } from 'valtio/vanilla';

type Op = Parameters<Parameters<typeof subscribe>[1]>[0][number];
type ArrayOp = [
  op: 'insert' | 'set' | 'delete',
  index: number,
  value1: unknown,
  value2: unknown,
];

export const parseProxyOps = (ops: Op[]): ArrayOp[] => {
  const arrayOps: ArrayOp[] = ops.flatMap((op) => {
    if (op[0] === 'resolve' || op[0] === 'reject') return [];
    if (op[1].length !== 1) return [];
    const index = Number(op[1][0]);
    if (!Number.isFinite(index)) return [];
    return [[op[0], index, op[2], op[3]]];
  });
  let i = 0;
  while (i < arrayOps.length) {
    if (
      i + 1 < arrayOps.length &&
      (arrayOps[i][0] === 'set' || arrayOps[i][0] === 'insert') &&
      arrayOps[i + 1][0] === 'set' &&
      arrayOps[i][1] === arrayOps[i + 1][1] + 1 &&
      arrayOps[i][3] === undefined &&
      arrayOps[i][2] === arrayOps[i + 1][3]
    ) {
      arrayOps.splice(i, 2, [
        'insert',
        arrayOps[i + 1][1],
        arrayOps[i + 1][2],
        undefined,
      ]);
    } else {
      i += 1;
    }
  }
  return arrayOps;
};
