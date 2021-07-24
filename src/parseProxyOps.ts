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

  const findCorrespondingInsert = (
    startOpIndex: number,
    startArrayIndex: number,
  ) => {
    let s = 0;
    let noInsert: [startOpIndex: number, startArrayIndex: number] | null = null;
    while (startOpIndex + s + 1 < arrayOps.length) {
      if (
        (arrayOps[startOpIndex + s + 1][0] === 'set' ||
          arrayOps[startOpIndex + s + 1][0] === 'insert') &&
        arrayOps[startOpIndex + s + 1][1] < startArrayIndex &&
        arrayOps[startOpIndex + s + 1][3] === arrayOps[startOpIndex][2]
      ) {
        return s + 1;
      }
      if (
        noInsert === null &&
        (arrayOps[startOpIndex + s + 1][0] === 'set' ||
          arrayOps[startOpIndex + s + 1][0] === 'insert') &&
        arrayOps[startOpIndex + s + 1][1] === startArrayIndex - (s + 1) &&
        arrayOps[startOpIndex + s + 1][3] === undefined
      ) {
        s += 1;
      } else if (
        noInsert === null &&
        startOpIndex + s + 1 < arrayOps.length &&
        arrayOps[startOpIndex + s + 1][0] === 'set' &&
        arrayOps[startOpIndex + s + 1][3] !== undefined
      ) {
        noInsert = [startOpIndex + s + 1, arrayOps[startOpIndex + s + 1][1]];
        s += 1;
      } else if (
        noInsert !== null &&
        arrayOps[startOpIndex + s + 1][0] === 'set' &&
        arrayOps[startOpIndex + s + 1][1] ===
          noInsert[1] + (s + 1 - noInsert[0]) &&
        arrayOps[startOpIndex + s + 1][3] !== undefined
      ) {
        s += 1;
      } else {
        return null;
      }
    }
    return null;
  };

  const findContinuousDelete = (
    startOpIndex: number,
    startArrayIndex: number,
  ) => {
    let d = 0;
    while (
      startOpIndex + d + 1 < arrayOps.length &&
      arrayOps[startOpIndex + d + 1][0] === 'delete' &&
      arrayOps[startOpIndex + d + 1][1] === startArrayIndex - (d + 1)
    ) {
      d += 1;
    }
    return d;
  };

  let i = 0;
  while (i < arrayOps.length) {
    if (
      (arrayOps[i][0] === 'set' || arrayOps[i][0] === 'insert') &&
      arrayOps[i][3] === undefined
    ) {
      const startArrayIndex = arrayOps[i][1];
      const s = findCorrespondingInsert(i, startArrayIndex);
      if (s !== null) {
        const newArrayOp: ArrayOp = [
          'insert',
          arrayOps[i + s][1],
          arrayOps[i + s][2],
          undefined,
        ];
        arrayOps.splice(i + s, 1, newArrayOp);
        arrayOps.splice(i, 1);
      } else {
        i += 1;
      }
    } else if (i > 0 && arrayOps[i][0] === 'delete') {
      const startArrayIndex = arrayOps[i][1];
      const d = findContinuousDelete(i, startArrayIndex);
      if (
        arrayOps[i - 1][0] === 'set' &&
        arrayOps[i - 1][1] === startArrayIndex - (d + 1) &&
        arrayOps[i - 1][2] === arrayOps[i][2]
      ) {
        const newArrayOp: ArrayOp = [
          'delete',
          startArrayIndex - (d + 1),
          arrayOps[i - 1][3],
          undefined,
        ];
        arrayOps.splice(i - 1, 2);
        arrayOps.splice(i - 1 + d, 0, newArrayOp);
        i -= 1;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }

  return arrayOps;
};
