import type { CourierAdapter, TrackingStatus } from "./index";

const DHL_API_KEY = process.env.DHL_API_KEY ?? "";
const DHL_BASE = "https://api-eu.dhl.com/track/shipments";

export class DHLCourier implements CourierAdapter {
    async track(trackingNumber: string): Promise<TrackingStatus | null> {
        if (!DHL_API_KEY) {
            console.warn("DHL_API_KEY not configured — returning mock data");
            return this.mockStatus(trackingNumber);
        }

        try {
            const res = await fetch(
                `${DHL_BASE}?trackingNumber=${encodeURIComponent(trackingNumber)}`,
                { headers: { "DHL-API-Key": DHL_API_KEY } }
            );

            if (!res.ok) {
                console.error(`DHL API error: ${res.status}`);
                return null;
            }

            const json = await res.json();
            const shipment = json?.shipments?.[0];
            if (!shipment) return null;

            return {
                trackingNumber,
                status: shipment.status?.status ?? "unknown",
                description: shipment.status?.description ?? "",
                location: shipment.status?.location?.address?.addressLocality,
                estimatedDelivery: shipment.estimatedTimeOfDelivery,
                events: (shipment.events ?? []).map(
                    (e: { timestamp: string; description: string; location?: { address?: { addressLocality?: string } } }) => ({
                        timestamp: e.timestamp,
                        description: e.description,
                        location: e.location?.address?.addressLocality,
                    })
                ),
            };
        } catch (err) {
            console.error("DHL track error:", err);
            return null;
        }
    }

    private mockStatus(trackingNumber: string): TrackingStatus {
        return {
            trackingNumber,
            status: "in-transit",
            description: "Shipment is on its way",
            location: "Colombo Hub",
            estimatedDelivery: "Tomorrow by 18:00",
            events: [
                {
                    timestamp: new Date().toISOString(),
                    description: "Out for delivery",
                    location: "Colombo",
                },
            ],
        };
    }
}
