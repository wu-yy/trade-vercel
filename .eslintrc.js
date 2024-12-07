module.exports = {
    root: true,
    env: {
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-essential', // Vue 3 项目
    ],
    parserOptions: {
      parser: 'babel-eslint',
    },
    rules: {
      // 你可以自定义规则
      'no-unused-vars': 'warn',
      'vue/no-unused-components': 'warn',
      'vue/multi-word-component-names': 'off'
    },
  };
  