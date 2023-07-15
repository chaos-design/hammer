module.exports = {
  extends: [
    '@chaos-design/eslint-config-ts',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    '@chaos-design/eslint-config-ts',
  ],
  settings: {
    react: {
      version: '17.0',
    },
  },
  rules: {
    'jsx-quotes': ['error', 'prefer-double'],
    'react/react-in-jsx-scope': 'off',
  },
};
