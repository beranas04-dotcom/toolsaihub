// Global type declarations for Google Analytics gtag

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config' | 'set',
            eventName: string,
            params?: Record<string, any>
        ) => void;
    }
}

export { };
