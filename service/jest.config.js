/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@prisma/client$": "<rootDir>/tests/mocks/prismaClient.ts",
  },
  modulePathIgnorePatterns: ["<rootDir>/prisma/"],
};
