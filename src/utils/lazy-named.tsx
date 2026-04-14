import { lazy } from 'react';

export const lazyNamed = <T extends Record<string, any>, K extends keyof T>(
    factory: () => Promise<T>,
    name: K,
) => {
    return lazy(() =>
        factory().then((module) => ({
            default: module[name],
        })),
    );
};
