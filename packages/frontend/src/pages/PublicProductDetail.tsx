import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Phone, MapPin, Share2, ShieldCheck, Truck, Clock, Star, Copy, Check, Heart, MessageCircle, Store } from 'lucide-react';
import productService from '@/services/product.service';
import { ProductDTO } from 'shared';

export const PublicProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<(ProductDTO & { shop: { name: string; contactNumber: string; address: string } }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const data = await productService.getPublicProductDetail(id);
                setProduct(data);
            } catch (err) {
                setError('Product not found or has been removed.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name || 'Check out this product',
                    text: `Check out ${product?.name} on StockSathi`,
                    url: url,
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Loading product...</p>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 flex flex-col items-center justify-center p-6 text-center gap-8">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center text-gray-300 shadow-inner">
                <ShoppingBag size={56} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">{error || 'Something went wrong'}</h2>
                <p className="text-gray-500 font-medium">The product you&apos;re looking for might have been removed or is temporarily unavailable.</p>
            </div>
            <button 
                onClick={() => navigate('/')}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
                Return to Marketplace
            </button>
        </div>
    );

    const galleryImages = [product.imageUrl, null, null, null];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex flex-col font-sans">
            {/* Premium Header */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-100/80">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group flex items-center gap-2 hover:shadow-sm"
                    >
                        <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform text-gray-700" />
                        <span className="hidden md:block font-semibold text-gray-600 group-hover:text-gray-900">Back</span>
                    </button>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
                         <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:shadow-orange-300 transition-shadow">
                            <ShoppingBag size={20} />
                         </div>
                         <span className="font-black text-gray-900 text-lg">Stock<span className="text-orange-500">Sathi</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`p-2.5 md:p-3 rounded-xl transition-all ${isWishlisted ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            <Heart size={22} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'animate-pulse' : ''} />
                        </button>
                        <button 
                            onClick={handleShare}
                            className="p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all relative"
                        >
                            {copied ? <Check size={22} className="text-green-500" /> : <Share2 size={22} className="text-gray-600" />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                
                {/* Left side: Images */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                    {/* Main Image */}
                    <div className="bg-white rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/60 border border-gray-100/50 aspect-square lg:aspect-[4/3] group relative">
                        {product.imageUrl ? (
                            <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300 gap-4">
                                <ShoppingBag size={100} strokeWidth={0.8} className="opacity-30" />
                                <span className="font-bold text-sm uppercase tracking-[0.25em] opacity-40">No Image Available</span>
                            </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-200/50 flex items-center gap-1.5">
                                <Star size={12} fill="currentColor" />
                                Featured
                            </span>
                        </div>
                        
                        {/* Image Counter on Mobile */}
                        <div className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
                            {selectedImageIndex + 1} / {galleryImages.filter(Boolean).length || 1}
                        </div>
                    </div>
                    
                    {/* Gallery Thumbnails */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                        {galleryImages.map((img, i) => (
                            <button 
                                key={i} 
                                onClick={() => setSelectedImageIndex(i)}
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 shrink-0 overflow-hidden transition-all duration-300 ${
                                    i === selectedImageIndex 
                                        ? 'border-orange-500 shadow-lg shadow-orange-100 scale-105' 
                                        : 'border-transparent bg-white shadow-sm hover:border-gray-200 hover:shadow-md'
                                }`}
                            >
                                {img ? (
                                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i + 1}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                        <ShoppingBag size={24} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side: Product Info */}
                <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
                    {/* Product Header */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-100">
                                {product.category || 'General'}
                            </span>
                            <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                In Stock
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight text-balance">
                            {product.name}
                        </h1>
                        
                        {/* Price Section */}
                        <div className="flex items-end gap-3 pt-2">
                            <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                Rs {Number(product.sellingPrice).toLocaleString()}
                            </span>
                            <span className="text-base font-semibold text-gray-400 pb-1.5">/ {product.unitType}</span>
                        </div>
                    </div>

                    {/* Quick Info Pills */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">Usually responds in 1 hour</span>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About this product</h3>
                            <p className="text-gray-600 font-medium leading-relaxed text-base lg:text-lg">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Shop Card */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 flex flex-col gap-5 shadow-xl shadow-gray-100/80 border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
                        {/* Decorative Element */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                        
                        {/* Shop Header */}
                        <div className="flex items-start justify-between relative">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                                    <Store size={28} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Verified Retailer</span>
                                    <h2 className="text-xl lg:text-2xl font-black text-gray-900">{product.shop.name}</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span className="text-[10px] font-bold text-green-600">Verified</span>
                            </div>
                        </div>
                        
                        {/* Shop Details */}
                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</span>
                                    <span className="text-sm font-semibold text-gray-700 truncate">{product.shop.address || 'Address not provided'}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</span>
                                    <span className="text-sm font-semibold text-gray-700">{product.shop.contactNumber || 'No contact number'}</span>
                                </div>
                                {product.shop.contactNumber && (
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(product.shop.contactNumber);
                                        }}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <Copy size={16} className="text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3 pt-2">
                            <a 
                                href={`tel:${product.shop.contactNumber}`}
                                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-center gap-3 py-4 lg:py-5 rounded-2xl font-bold text-base lg:text-lg hover:from-orange-500 hover:to-orange-600 transition-all shadow-xl shadow-gray-200/50 hover:shadow-orange-200/50 active:scale-[0.98] group"
                            >
                                <Phone size={20} className="group-hover:animate-pulse" />
                                Call to Purchase
                            </a>
                            
                            <button className="w-full bg-gray-100 text-gray-700 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]">
                                <MessageCircle size={20} />
                                Send Message
                            </button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 gap-2 hover:shadow-md hover:border-green-100 transition-all group">
                            <ShieldCheck className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Verified Seller</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 gap-2 hover:shadow-md hover:border-blue-100 transition-all group">
                            <Truck className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Local Delivery</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 gap-2 hover:shadow-md hover:border-orange-100 transition-all group">
                            <Clock className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Fast Response</span>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Related Products Section */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12 lg:py-20 border-t border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">From the same shop</h3>
                    <button className="text-orange-500 font-bold text-sm hover:underline">View All</button>
                </div>
                <div className="flex items-center justify-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 border-dashed">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">More products coming soon</p>
                    </div>
                </div>
            </div>

            {/* Premium Footer */}
            <footer className="bg-gray-900 text-white pt-12 lg:pt-16 pb-8 rounded-t-[40px] lg:rounded-t-[60px] mt-auto">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="font-black text-2xl">Stock<span className="text-orange-400">Sathi</span></span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-gray-400 hover:text-white font-semibold transition-colors">About</a>
                            <a href="#" className="text-gray-400 hover:text-white font-semibold transition-colors">Privacy</a>
                            <a href="#" className="text-gray-400 hover:text-white font-semibold transition-colors">Terms</a>
                        </div>
                    </div>
                    <div className="pt-8 text-center">
                        <p className="text-gray-500 font-semibold text-sm">&copy; 2024 StockSathi Marketplace. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
