"use client";
import { ShoppingCart, Plus, Minus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
    id: number;
    name: string;
    price: string;
    description?: string;
    image?: string;
    permalink?: string;
    onAddToCart: (productId: number) => void;
}

export function ProductCard({
    id,
    name,
    price,
    description,
    image,
    permalink,
    onAddToCart,
}: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all shadow-2xl"
        >
            {/* Image Section */}
            <div className="aspect-square w-full relative overflow-hidden bg-white/5">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                        <ShoppingCart size={48} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                {/* Price Tag */}
                <div className="absolute bottom-4 left-4 bg-white text-black px-3 py-1 rounded-full text-sm font-black shadow-lg">
                    {price}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <h3 className="text-white font-black text-lg leading-tight truncate uppercase tracking-tight">
                    {name}
                </h3>
                {description && (
                    <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {description.replace(/<[^>]*>?/gm, "")}
                    </p>
                )}

                <div className="mt-6 flex items-center gap-3">
                    <button
                        onClick={() => onAddToCart(id)}
                        className="flex-1 h-12 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                    >
                        <Plus size={16} />
                        Add to Cart
                    </button>
                    {permalink && (
                        <a
                            href={permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function ProductCarousel({ products, onAddToCart }: { products: any[], onAddToCart: (id: number) => void }) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {products.map((product) => (
                <div key={product.id} className="min-w-[260px] snap-center">
                    <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        description={product.short_description}
                        image={product.images?.[0]?.src}
                        permalink={product.permalink}
                        onAddToCart={onAddToCart}
                    />
                </div>
            ))}
        </div>
    );
}
