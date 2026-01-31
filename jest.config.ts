import type { JestConfigWithTsJest } from 'ts-jest/dist/types'

const config: JestConfigWithTsJest = {
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: './tests/tsconfig.json',
                compiler: 'ts-patch/compiler',
            },
        ],
    },
    testEnvironment: 'node',
    testRegex: '(/tests/.*|(\\.|/)(test|spec))[^d]\\.ts$',
    detectOpenHandles: true,
    testTimeout: 30000,
}
export default config
