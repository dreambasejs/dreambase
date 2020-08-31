export function getBinarySearch<T, TKey>(
  cmp: (a: TKey, b: TKey) => number,
  extractKey: (x: T) => TKey
) {
  /*function search(arr: T[], low: number, high: number, key: TKey) {
    if (high < low) return -1;
    const mid = Math.floor((low + high) / 2);
    const diff = cmp(key, extractKey(arr[mid]));
    if (diff === 0) return mid;
    if (diff > 0) return search(arr, mid + 1, high, key);
    return search(arr, low, mid - 1, key);
  }*/

  function binarySearch(arr: T[], low: number, high: number, key: TKey) {
    const mid = Math.floor((low + high) / 2);
    const diff = cmp(key, extractKey(arr[mid]));
    if (diff === 0) return [true, mid];
    if (diff > 0)
      return mid + 1 < high
        ? binarySearch(arr, mid + 1, high, key)
        : [false, high];
    return low < mid - 1 ? binarySearch(arr, low, mid - 1, key) : [false, low];
  }

  return (arr: T[], key: TKey) => binarySearch(arr, 0, arr.length, key);
}
