module.exports = {
  'extends': '../.eslintrc.js',
  env: {
    mocha: true
  },
  globals: {
    sinon: true,
    expect: true,
    should: true,
    functionsTest: true,
    mockFunctionsConfig: true
  },
  rules: {
    'no-unused-expressions': 0
  }
}