import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

export function useHasMounted() {
    return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}

export function useMediaQuery(query: string) {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (typeof window === "undefined") {
                return () => {};
            }

            const mediaQueryList = window.matchMedia(query);
            mediaQueryList.addEventListener("change", onStoreChange);
            return () => mediaQueryList.removeEventListener("change", onStoreChange);
        },
        () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
        () => false
    );
}
