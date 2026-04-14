import { ReactNode, Suspense, type ComponentType } from 'react';

export function makeAsyncComponent<ComponentProps extends Record<string, any>>(
    displayName: string,
    LazyComponent: ComponentType<ComponentProps>,
    fallback: ReactNode = null,
) {
    const Component: ComponentType<ComponentProps> = (props) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );
    Component.displayName = displayName;
    return Component;
}
