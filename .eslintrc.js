// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:security/recommended',
  ],
  // required to lint *.vue files
  plugins: [
    'html',
    'security',
  ],
  // check if imports actually resolve
  'settings': {
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'valid-jsdoc': ['error', {
      'requireReturn': true,
      'requireReturnType': true,
      'requireParamDescription': true,
      'requireReturnDescription': true
    }],
    'require-jsdoc': ['error', {
        'require': {
            'FunctionDeclaration': true,
            'MethodDefinition': true,
            'ClassDeclaration': true
        }
    }],
    'no-underscore-dangle': 0
  }
}
