import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Phone, MapPin, Share2, ShieldCheck, Truck, Clock, Star, Copy, Check, Heart, Store, Package, Sparkles, ExternalLink, Navigation, X, Loader2 } from 'lucide-react';
import productService from '@/services/product.service';
import { MapComponent } from '@/components/MapComponent';
import { ProductDTO } from 'shared';
import toast from 'react-hot-toast';

export const PublicProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<(ProductDTO & { shop: { name: string; contactNumber: string; address: string } }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [phoneCopied, setPhoneCopied] = useState(false);
    const [shopProducts, setShopProducts] = useState<ProductDTO[]>([]);
    const [shopProductsLoading, setShopProductsLoading] = useState(false);
    
    // Map & Geolocation state
    const [showMapModal, setShowMapModal] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locating, setLocating] = useState(false);

    const handleViewOnMap = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setShowMapModal(true);
                setLocating(false);
            },
            () => {
                setLocating(false);
                toast.error("Please allow location access to see the route");
                // Open modal anyway with just the shop location if they deny, 
                // but for "path and distance" we need user location.
                // Let's show the map with just shop pin if denied.
                setShowMapModal(true);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };
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

    // Once we have the product, fetch other products from the same shop
    useEffect(() => {
        if (!product?.shopId || !id) return;
        const fetchShopProducts = async () => {
            setShopProductsLoading(true);
            try {
                const data = await productService.getShopProducts(product.shopId, id);
                setShopProducts(data);
            } catch {
                // silently fail — section just stays empty
            } finally {
                setShopProductsLoading(false);
            }
        };
        fetchShopProducts();
    }, [product?.shopId, id]);

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

    const handleCopyPhone = async () => {
        if (product?.shop.contactNumber) {
            await navigator.clipboard.writeText(product.shop.contactNumber);
            setPhoneCopied(true);
            setTimeout(() => setPhoneCopied(false), 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-14 h-14 border-[3px] border-slate-200 rounded-full"></div>
                    <div className="w-14 h-14 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-slate-500 font-medium text-sm tracking-wide">Loading product details...</p>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                <Package size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-slate-800">{error || 'Something went wrong'}</h2>
                <p className="text-slate-500 text-sm leading-relaxed">The product you&apos;re looking for might have been removed or is temporarily unavailable.</p>
            </div>
            <button
                onClick={() => navigate('/')}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md active:scale-[0.98]"
            >
                Return to Marketplace
            </button>
        </div>
    );

    const galleryImages = [product.imageUrl, null, null, null];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Clean Header */}
            <header className="bg-white sticky top-0 z-[100] border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors group flex items-center gap-2"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform text-slate-600" />
                        <span className="hidden md:block text-sm font-medium text-slate-600">Back</span>
                    </button>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                            <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-slate-800">Stock<span className="text-emerald-600">Sathi</span></span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`p-2 rounded-lg transition-all ${isWishlisted ? 'bg-rose-50 text-rose-500' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
                        >
                            {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Left: Product Images */}
                <div className="lg:w-[55%] flex flex-col gap-4">
                    {/* Main Image */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 aspect-square relative group">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 gap-3">
                                <Package size={64} strokeWidth={1} />
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">No Image</span>
                            </div>
                        )}

                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                <Sparkles size={12} />
                                Featured
                            </span>
                        </div>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
                            {selectedImageIndex + 1} / {galleryImages.filter(Boolean).length || 1}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                        {galleryImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImageIndex(i)}
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shrink-0 overflow-hidden transition-all border-2 ${i === selectedImageIndex
                                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                {img ? (
                                    <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                        <Package size={20} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="lg:w-[45%] flex flex-col gap-6">
                    {/* Product Info */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide">
                                {product.category || 'General'}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                In Stock
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl md:text-4xl font-bold text-slate-900">
                                Rs {Number(product.sellingPrice).toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-slate-400">/ {product.unitType}</span>
                        </div>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-100/70 px-3 py-2 rounded-lg w-fit">
                        <Clock size={14} />
                        <span className="text-xs font-medium">Usually responds within 1 hour</span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Shop Card */}
                    <div className="bg-white rounded-xl p-5 flex flex-col gap-4 border border-slate-200 shadow-sm">
                        {/* Shop Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <Store size={22} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Retailer</span>
                                    <h2 className="text-base font-bold text-slate-800">{product.shop.name}</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                                <ShieldCheck size={12} className="text-emerald-600" />
                                <span className="text-[10px] font-semibold text-emerald-700">Verified</span>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <MapPin size={16} className="text-emerald-500 shrink-0" />
                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <span className="text-sm text-slate-600 truncate">{product.shop.address || 'Address not provided'}</span>
                                    {product.shop.address && (
                                        <button 
                                            onClick={handleViewOnMap}
                                            disabled={locating}
                                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-1 ml-2 shrink-0 disabled:opacity-50"
                                        >
                                            {locating ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
                                            (View on Map)
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <Phone size={16} className="text-emerald-500 shrink-0" />
                                <span className="text-sm text-slate-600 flex-1">{product.shop.contactNumber || 'No contact number'}</span>
                                {product.shop.contactNumber && (
                                    <button
                                        onClick={handleCopyPhone}
                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all active:scale-95"
                                    >
                                        {phoneCopied ? (
                                            <Check size={14} className="text-emerald-600" />
                                        ) : (
                                            <Copy size={14} className="text-slate-400" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Map View */}
                        {(product as any).latitude && (product as any).longitude && (
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shop Location</span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${(product as any).latitude},${(product as any).longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                    >
                                        <ExternalLink size={12} /> Directions
                                    </a>
                                </div>
                                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                    <MapComponent
                                        mode="display"
                                        location={[(product as any).latitude, (product as any).longitude]}
                                        zoom={15}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-2.5 pt-1">
                            <a
                                href={`tel:${product.shop.contactNumber}`}
                                className="w-full bg-emerald-600 text-white flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors active:scale-[0.99]"
                            >
                                <Phone size={18} />
                                Call to Purchase
                            </a>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-100 gap-1.5">
                            <ShieldCheck className="text-emerald-500" size={20} />
                            <span className="text-[10px] font-semibold uppercase text-slate-500 text-center">Verified</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-100 gap-1.5">
                            <Truck className="text-sky-500" size={20} />
                            <span className="text-[10px] font-semibold uppercase text-slate-500 text-center">Delivery</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-100 gap-1.5">
                            <Star className="text-amber-500" size={20} />
                            <span className="text-[10px] font-semibold uppercase text-slate-500 text-center">Top Rated</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* More from this shop */}
            <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">More from this shop</h3>
                    <button
                        onClick={() => navigate(`/?search=${product.shop.name}`)}
                        className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors"
                    >
                        View All
                    </button>
                </div>

                {shopProductsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : shopProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {shopProducts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => navigate(`/product/${p.id}`)}
                                className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.98] group"
                            >
                                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <Package size={32} className="text-slate-300" strokeWidth={1.5} />
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs text-slate-400 font-medium truncate">{p.category || 'Product'}</p>
                                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{p.name}</p>
                                    <p className="text-emerald-600 font-bold text-sm mt-1">Rs {Number(p.sellingPrice).toLocaleString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Package size={32} strokeWidth={1.5} />
                            <p className="font-medium text-sm">No other products from this shop</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-slate-800 text-white mt-auto">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <ShoppingBag size={20} />
                            </div>
                            <span className="font-bold text-lg">Stock<span className="text-emerald-400">Sathi</span></span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">About</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                        <p className="text-slate-500 text-sm">&copy; 2024 StockSathi. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800">Shop Location & Route</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                    {userLocation ? 'Optimal route calculated' : 'Viewing shop location'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowMapModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-1">
                            <MapComponent 
                                mode={userLocation ? 'routing' : 'display'}
                                location={[(product as any).latitude, (product as any).longitude]}
                                userLocation={userLocation}
                                zoom={14}
                            />
                        </div>

                        <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <MapPin size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-tight">Destination</p>
                                    <p className="text-sm font-semibold text-slate-800">{product.shop.name}</p>
                                </div>
                            </div>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${(product as any).latitude},${(product as any).longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Navigation size={14} /> Open in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
