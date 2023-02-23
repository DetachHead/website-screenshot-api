/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['@detachhead/eslint-config'],
    overrides: [
        {
            files: ['src/**/*.ts'],
            parserOptions: {
                ecmaVersion: 'latest',
                project: './src/tsconfig.json',
            },
        },
        {
            files: ['tests/**/*.ts'],
            parserOptions: {
                ecmaVersion: 'latest',
                project: './tests/tsconfig.json',
            },
        },
    ],
}

module.exports = config
