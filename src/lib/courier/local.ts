import type { CourierAdapter, TrackingStatus } from "./index";

const LOCAL_BASE = process.env.LOCAL_COURIER_URL ?? "";

export class LocalCourier implements CourierAdapter {
    async track(trackingNumber: string): Promise<TrackingStatus | null> {
        if (!LOCAL_BASE) {
            console.warn("LOCAL_COURIER_URL not configured — returning mock data");
            return this.mockStatus(trackingNumber);
        }

        try {
            const res = await fetch(
                `${LOCAL_BASE}/track?id=${encodeURIComponent(trackingNumber)}`
            );

            if (!res.ok) {
                console.error(`Local courier error: ${res.status}`);
                return this.mockStatus(trackingNumber);
            }

            const json = await res.json();

            return {
                trackingNumber,
                status: json.status ?? "unknown",
                description: json.description ?? "",
                location: json.location,
                estimatedDelivery: json.estimated_delivery,
                events: (json.events ?? []).map(
                    (e: { time?: string; timestamp?: string; description?: string; message?: string; location?: string }) => ({
                        timestamp: e.time ?? e.timestamp ?? "",
                        description: e.description ?? e.message ?? "",
                        location: e.location,
                    })
                ),
            };
        } catch (err) {
            console.error("Local courier track error:", err);
            return this.mockStatus(trackingNumber);
        }
    }

    private mockStatus(trackingNumber: string): TrackingStatus {
        return {
            trackingNumber,
            status: "processing",
            description: "Your parcel is being processed at our warehouse",
            location: "Warehouse",
            estimatedDelivery: "2-3 business days",
            events: [
                {
                    timestamp: new Date().toISOString(),
                    description: "Order received and being prepared",
                    location: "Warehouse",
                },
            ],
        };
    }
}
