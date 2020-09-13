//@ts-check
const _fetch = fetch;
export { _fetch as fetch };
export const randomFillSync = crypto.getRandomValues;
