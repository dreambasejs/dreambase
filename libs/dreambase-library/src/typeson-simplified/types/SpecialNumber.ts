const SPECIAL_NUMBERS = {
  Infinity,
  "-Infinity": -Infinity,
  NaN,
};

export default {
  SpecialNumber: {
    replace: (num: number) => ({
      $t: "SpecialNumber",
      v:
        num === Infinity ? "Infinity" : num === -Infinity ? "-Infinity" : "NaN",
    }),
    revive: ({ v }) => SPECIAL_NUMBERS[v],
  },
};
