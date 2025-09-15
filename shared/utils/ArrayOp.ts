/**
 * 배열에서 특정 요소를 빼서 다른 배열의 지정한 위치에 삽입한다.
 *
 * 예:
 * const fromArray = [1, 2, 3, 4, 5];
 * const toArray = [6, 7, 8, 9, 10];
 * const { fromArray, toArray } = moveItem(fromArray, 2, toArray, 3);
 *
 * 결과:
 * fromArray = [1, 2, 4, 5];
 * toArray   = [6, 7, 8, 3, 9, 10];
 */
export const moveItem = <T>(
  fromArray: T[],
  fromIndex: number,
  toArray: T[],
  toIndex: number
): { fromArray: T[]; toArray: T[] } => {
  const newFromArray = [...fromArray];
  const newToArray = [...toArray];

  const [item] = newFromArray.splice(fromIndex, 1);
  newToArray.splice(toIndex, 0, item);

  return { fromArray: newFromArray, toArray: newToArray };
};
