module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:jsdoc/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["jsdoc", "@typescript-eslint", "import"],
  rules: {
    eqeqeq: "warn",
    "prefer-const": "warn",
    "jsdoc/no-undefined-types": "error",
    "import/extensions": ["error", "always", { js: "always" }],
  },
  settings: {
    jsdoc: {
      mode: "typescript",
    },
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
    {
      files: ["*.js"],
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      extends: ["eslint:recommended", "plugin:jsdoc/recommended"],
      rules: {
        "jsdoc/no-undefined-types": "error",
        "jsdoc/valid-types": "off",
        "import/extensions": ["error", "always", { js: "always" }],
      },
      settings: {
        jsdoc: {
          mode: "jsdoc",
        },
      },
    },
  ],
};
