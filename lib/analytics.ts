export function trackEvent(eventName: string, params: Record<string, any> = {}) {
    if (typeof window === "undefined") return;

    // GA4 gtag
    // @ts-ignore
    if (typeof window.gtag === "function") {
        // @ts-ignore
        window.gtag("event", eventName, params);
    }
}
