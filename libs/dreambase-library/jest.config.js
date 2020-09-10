import jestConfig from "jest-config";

export default {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleNameMapper: {
    ...jestConfig.defaults.moduleNameMapper,
    "(.*)\\.js$": "$1",
  },
};
