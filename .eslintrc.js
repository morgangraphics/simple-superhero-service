// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:security/recommended',
  ],
  
  // required to lint *.vue files
  plugins: [
    //'html',
    'security',
  ],
  // check if imports actually resolve
  'settings': {
  },
  // add your custom rules here
  'rules': {
    'arrow-parens': ['error', 'as-needed'],
    // allow debugger during development
    indent: ['error', 4],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-underscore-dangle': 0,
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
    }]
  }
}
