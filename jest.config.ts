import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '(/tests/.*|(\\.|/)(test|spec))[^d]\\.ts$',
    globals: {
        'ts-jest': {
            tsconfig: './tests/tsconfig.json',
            compiler: 'ttypescript',
        },
    },
    detectOpenHandles: true,
    testTimeout: 30000,
}
export default config
