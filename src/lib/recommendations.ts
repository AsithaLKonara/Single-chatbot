import { WCProduct, searchProducts } from "./woocommerce";
import { prisma } from "./prisma";
import { getSystemWeights } from "./governor";

export interface ScoredProduct extends WCProduct {
    score: number;
}

export function rankProducts(
    products: WCProduct[], 
    context: { query?: string, strategy?: string },
    weights: { stock: number, conversion: number, similarity: number } = { stock: 0.5, conversion: 0.3, similarity: 0.2 }
): ScoredProduct[] {
    return products.map(p => {
        let score = 0;
        
        // 1. Stock Weight
        if (p.stock_status === "instock") score += (100 * weights.stock);
        
        // 2. Sales / Strategy Weight
        const price = parseFloat(p.price);
        let convScore = 0;
        if (context.strategy === "PREMIUM" && price > 5000) convScore = 50;
        if (context.strategy === "VALUE" && price < 2000) convScore = 50;
        score += (convScore * weights.conversion);
        
        // 3. Similarity Weight
        let simScore = 0;
        if (context.query && p.name.toLowerCase().includes(context.query.toLowerCase())) {
            simScore = 100;
        }
        score += (simScore * weights.similarity);
        
        return { ...p, score };
    }).sort((a, b) => b.score - a.score);
}

export async function getRecommendations(userId: string, productId?: number, strategy?: string) {
    let baseProducts: WCProduct[] = [];
    
    // 1. Cross-sell / Upsell
    if (productId) {
        const current = await prisma.cartItem.findFirst({
            where: { productId },
            orderBy: { createdAt: "desc" }
        });
        
        if (current) {
            baseProducts = await searchProducts(current.name.split(" ")[0]);
        }
    }

    // 2. Personalization
    if (baseProducts.length === 0) {
        const lastItems = await prisma.cartItem.findMany({
            where: { cart: { userId } },
            take: 3,
            orderBy: { createdAt: "desc" }
        });

        if (lastItems.length > 0) {
            baseProducts = await searchProducts(lastItems[0].name);
        }
    }

    // 3. Fallback
    if (baseProducts.length === 0) {
        baseProducts = await searchProducts("best");
    }

    // Rank results with global optimized weights
    const weights = await getSystemWeights();
    return rankProducts(baseProducts, { strategy }, weights.rankingWeights).slice(0, 4);
}
