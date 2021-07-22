import { subscribe } from 'valtio/vanilla';

type Op = Parameters<Parameters<typeof subscribe>[1]>[0][number];
type ArrayOp = [op: string, path: string[], value1: unknown, value2: unknown];

export const parseProxyOps = (ops: Op[]): ArrayOp[] => {
  const arrayOps = [...ops] as ArrayOp[];
  let i = 0;
  let startPos = -1;
  let startIdx = -1;
  const replaceWithInsert = () => {
    if (i - 1 > startPos) {
      arrayOps.splice(startPos, i - startPos, [
        'insert',
        [String(startIdx - (i - 1 - startPos))],
        arrayOps[i - 1][2],
        undefined,
      ]);
    }
  };
  while (i < arrayOps.length) {
    if (startPos >= 0) {
      if (
        arrayOps[i][0] === 'set' &&
        arrayOps[i][1].length === 1 &&
        arrayOps[i][1][0] === String(startIdx - (i - startPos)) &&
        arrayOps[i][3] === arrayOps[i - 1][2]
      ) {
        // continue
      } else {
        replaceWithInsert();
        startPos = -1;
        startIdx = -1;
      }
    } else if (
      arrayOps[i][0] === 'set' &&
      arrayOps[i][1].length === 1 &&
      arrayOps[i][3] === undefined
    ) {
      const idx = Number(arrayOps[i][1][0]);
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
  return arrayOps;
};
