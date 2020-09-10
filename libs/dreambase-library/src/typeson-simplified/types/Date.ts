export default {
  Date: {
    replace: (date: Date) => ({ $t: "Date", v: date.getTime() }),
    revive: ({ v }) => new Date(v),
  },
};
