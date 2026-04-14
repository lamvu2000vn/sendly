import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintConfigPrettier from 'eslint-config-prettier';
import tailwind from 'eslint-plugin-tailwindcss';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tailwind.configs['flat/recommended'],
    {
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'tailwindcss/no-custom-classname': 'off', // Optional: disable if using custom classes often
        },
        settings: {
            tailwindcss: {
                callees: ['cn', 'clsx', 'cva', 'twMerge'],
                cssFiles: ['src/app/globals.css'],
            },
        },
    },
    // Keep prettier config last to override others.
    eslintConfigPrettier,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
]);

export default eslintConfig;
