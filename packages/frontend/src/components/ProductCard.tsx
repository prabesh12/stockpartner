import { useState } from 'react';
import { ShoppingCart, Star, Heart, Image as ImageIcon } from 'lucide-react';

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
  rating = 0,
  reviews = 0,
  store,
  quantity,
  onClick,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calculate discount if originalPrice exists
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
      {/* Card Container */}
      <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white transition-all duration-500 ease-out hover:border-orange-200 hover:shadow-[0_20px_50px_rgba(255,115,0,0.15)] shadow-xl shadow-gray-200/50 overflow-hidden hover:-translate-y-2">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-50">
          {/* Status Badges */}
          <div className="absolute inset-x-3 top-3 z-10 flex justify-between items-start pointer-events-none">
            {badge && (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-[9px] font-black uppercase text-white shadow-lg shadow-orange-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                {badge}
              </div>
            )}
            {discountPercent > 0 && (
              <div className="rounded-xl bg-red-500 px-2.5 py-1.5 text-[9px] font-black text-white shadow-lg shadow-red-500/30">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Floating Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute bottom-3 right-3 z-20 h-9 w-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-90 ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white'
              }`}
          >
            <Heart
              size={16}
              className={`${isFavorite ? 'fill-white' : ''}`}
            />
          </button>

          {/* Product Image */}
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-2">
              <ImageIcon size={32} strokeWidth={1} className="opacity-20" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30">No Preview</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-orange-500/5"></div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between p-4 gap-3">
          <div className="space-y-3">
            {/* Category */}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-50 px-3 py-1 rounded-full self-start inline-block">
              {category}
            </span>

            {/* Title */}
            <h3 className="line-clamp-2 text-xl font-black text-gray-900 group-hover:text-orange-500 transition-colors tracking-tight leading-tight">
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`transition-colors ${i < (rating || 4)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200 dark:text-gray-700'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400">
                ({reviews || 128})
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-50">
            {/* Price Area */}
            <div className="flex items-end gap-3">
              <div className="flex flex-col">
                {originalPrice && originalPrice > price && (
                  <span className="text-sm line-through text-gray-300 dark:text-gray-600 font-bold leading-none mb-1">
                    Rs {originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                  Rs {price.toLocaleString()}
                </span>
              </div>
              {quantity && (
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">
                  / {quantity}
                </span>
              )}
            </div>

            {/* Store Information */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-500 p-[2px] shadow-lg">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[10px] font-black text-gray-900 uppercase">
                  {store.charAt(0) || 'S'}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate">
                {store}
              </span>
            </div>

            {/* Add to Cart Premium Button */}
            <button
              onClick={handleAddCart}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-black text-xs uppercase tracking-[0.1em] transition-all duration-500 shadow-lg ${isAdded
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-orange-500 text-white hover:bg-gray-900 hover:shadow-orange-200 active:scale-95'
                }`}
            >
              <ShoppingCart size={20} strokeWidth={2.5} />
              {isAdded ? 'Success!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
