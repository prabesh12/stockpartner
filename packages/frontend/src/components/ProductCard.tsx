import { useState } from 'react';
import { ShoppingCart, Heart, Image as ImageIcon, Store } from 'lucide-react';

interface ProductCardProps {
  id: string;
  image: string;
  badge?: string;
  category: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  store: string;
  quantity?: string;
  onClick?: () => void;
}

export function ProductCard({
  id: _id,
  image,
  badge,
  category,
  name,
  price,
  originalPrice,
  rating: _rating = 0,
  reviews: _reviews = 0,
  store,
  quantity,
  onClick,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="group relative h-full cursor-pointer" onClick={onClick}>
      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-50">
          {/* Badges */}
          <div className="absolute inset-x-3 top-3 z-10 flex justify-between items-start pointer-events-none">
            {badge && (
              <div className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                {badge}
              </div>
            )}
            {discountPercent > 0 && (
              <div className="rounded-md bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute bottom-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 active:scale-90 ${isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white text-slate-400 hover:text-rose-500'
              }`}
          >
            <Heart size={14} className={isFavorite ? 'fill-white' : ''} />
          </button>

          {/* Product Image */}
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <ImageIcon size={28} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 gap-3">
          <div className="space-y-2">
            {/* Category */}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              {category}
            </span>

            {/* Title */}
            <h3 className="line-clamp-2 text-base font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug">
              {name}
            </h3>
          </div>

          <div className="mt-auto space-y-3">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">
                Rs {price.toLocaleString()}
              </span>
              {quantity && (
                <span className="text-xs font-medium text-slate-400">
                  / {quantity}
                </span>
              )}
            </div>

            {originalPrice && originalPrice > price && (
              <span className="text-sm line-through text-slate-400 font-medium">
                Rs {originalPrice.toLocaleString()}
              </span>
            )}

            {/* Store */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Store size={14} />
              </div>
              <span className="text-xs font-medium text-slate-500 truncate">
                {store}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddCart}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all duration-200 ${isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white active:scale-[0.98]'
                }`}
            >
              <ShoppingCart size={16} />
              {isAdded ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
