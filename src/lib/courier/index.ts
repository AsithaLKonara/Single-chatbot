// Courier adapter interface and factory

export interface TrackingStatus {
    trackingNumber: string;
    status: string;
    description: string;
    location?: string;
    estimatedDelivery?: string;
    events: TrackingEvent[];
}

export interface TrackingEvent {
    timestamp: string;
    description: string;
    location?: string;
}

export interface CourierAdapter {
    track(trackingNumber: string): Promise<TrackingStatus | null>;
}

export type CourierProvider = "dhl" | "fedex" | "local";

// Factory — returns the right adapter based on provider name
export function getCourier(provider: CourierProvider): CourierAdapter {
    switch (provider) {
        case "dhl":
            return new (require("./dhl").DHLCourier)();
        case "local":
            return new (require("./local").LocalCourier)();
        case "fedex":
        default:
            return new (require("./local").LocalCourier)(); // fallback
    }
}

// Auto-detect provider from tracking number format
export function detectProvider(trackingNumber: string): CourierProvider {
    const tn = trackingNumber.trim().toUpperCase();
    if (/^\d{10,11}$/.test(tn) || tn.startsWith("1Z")) return "dhl";
    return "local";
}

// Format tracking status for chat display
export function formatTrackingStatus(status: TrackingStatus): string {
    const latest = status.events[0];
    const lines = [
        `📍 Tracking: ${status.trackingNumber}`,
        `Status: ${status.status.toUpperCase()}`,
        `${status.description}`,
    ];
    if (status.location) lines.push(`Location: ${status.location}`);
    if (status.estimatedDelivery) lines.push(`Est. Delivery: ${status.estimatedDelivery}`);
    if (latest) lines.push(`\nLatest update:\n${latest.timestamp} — ${latest.description}`);
    return lines.join("\n");
}
