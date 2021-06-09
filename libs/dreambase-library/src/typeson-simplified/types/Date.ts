export default {
  Date: {
    replace: (date: Date) => ({
      $t: "Date",
      date: isNaN(date.getTime()) ? "NaN" : date.toISOString(),
    }),
    revive: ({ date }) => new Date(date === "NaN" ? NaN : Date.parse(date)),
  },
};
