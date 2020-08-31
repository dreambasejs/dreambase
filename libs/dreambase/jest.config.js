const { defaults } = require("jest-config");
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleNameMapper: { ...defaults.moduleNameMapper, "(.*)\\.js$": "$1" },
};
