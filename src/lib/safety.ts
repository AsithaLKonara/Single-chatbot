// Agent Safety & Policy Framework

export enum RiskLevel {
    LOW = "LOW",       // product search, view cart
    MEDIUM = "MEDIUM", // add to cart, clear cart
    HIGH = "HIGH"      // checkout, payment, personal info
}

export interface SafetyPolicy {
    maxDiscount: number;
    maxQuantity: number;
    requireApproval: boolean;
    confirmationRequired: string[]; // Tools that need user confirmation
    restrictedTools: string[];
}

export const DEFAULT_POLICY: SafetyPolicy = {
    maxDiscount: 0.20, // 20%
    maxQuantity: 10,
    requireApproval: false,
    confirmationRequired: ["checkout_start", "order_create", "apply_discount"],
    restrictedTools: ["delete_customer", "override_price"]
};

export function getRiskLevel(tool: string): RiskLevel {
    const riskMap: Record<string, RiskLevel> = {
        "product_search": RiskLevel.LOW,
        "cart_view": RiskLevel.LOW,
        "cart_add": RiskLevel.MEDIUM,
        "cart_clear": RiskLevel.MEDIUM,
        "checkout_start": RiskLevel.HIGH,
        "order_status": RiskLevel.MEDIUM,
        "courier_track": RiskLevel.LOW
    };
    return riskMap[tool] || RiskLevel.MEDIUM;
}

export async function validateAction(tool: string, args: any, policy: SafetyPolicy = DEFAULT_POLICY) {
    // 1. Tool Restriction
    if (policy.restrictedTools.includes(tool)) {
        return { valid: false, reason: "Tool is restricted under current policy." };
    }

    // 2. Quantity check
    if (args.quantity && args.quantity > policy.maxQuantity) {
        return { valid: false, reason: `Quantity ${args.quantity} exceeds safety limit of ${policy.maxQuantity}.` };
    }

    // 3. Discount check (if applicable)
    if (args.discount && args.discount > policy.maxDiscount) {
        return { valid: false, reason: "Discount requested exceeds authorized limit." };
    }

    return { valid: true };
}
