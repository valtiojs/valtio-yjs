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
  let startPos = -1;
  let startIdx = -1;
  const replaceWithInsert = () => {
    if (i - 1 > startPos) {
      arrayOps.splice(startPos, i - startPos, [
        'insert',
        startIdx - (i - 1 - startPos),
        arrayOps[i - 1][2],
        undefined,
      ]);
    }
  };
  while (i < arrayOps.length) {
    if (startPos >= 0) {
      if (
        arrayOps[i][0] === 'set' &&
        arrayOps[i][1] === startIdx - (i - startPos) &&
        arrayOps[i][3] === arrayOps[i - 1][2]
      ) {
        // continue
      } else {
        replaceWithInsert();
        startPos = -1;
        startIdx = -1;
      }
    } else if (arrayOps[i][0] === 'set' && arrayOps[i][3] === undefined) {
      startPos = i;
      startIdx = arrayOps[i][1];
    }
    i += 1;
  }
  if (startPos >= 0) {
    replaceWithInsert();
  }
  return arrayOps;
};
