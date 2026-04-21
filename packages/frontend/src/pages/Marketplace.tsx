import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Phone, MapPin, Tag, ChevronRight, Menu, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productService from '@/services/product.service';
import { ProductDTO } from 'shared';

export const Marketplace = () => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentCategory = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await productService.getPublicProducts(
                    currentCategory || undefined,
                    searchTerm || undefined
                );
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentCategory, searchTerm]);

    const categories = ['Electronics', 'Clothing', 'Grocery', 'Fashion', 'Home', 'Services'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="bg-white sticky top-0 z-[100] shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4 gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-orange-200 shadow-lg transform hover:scale-105 transition-transform">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight hidden sm:block">
                            Stock<span className="text-orange-500">Sathi</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl relative group">
                        <input
                            type="text"
                            placeholder="Search in StockSathi..."
                            className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-gray-100 border-none rounded-2xl md:rounded-full focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 font-medium"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    navigate(val ? `/?search=${val}` : '/');
                                }
                            }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 text-gray-700 font-bold hover:text-orange-500 transition-colors"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-full hover:bg-orange-500 transition-all shadow-md shadow-gray-200"
                        >
                            Sell on StockSathi
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={28} className="text-gray-900" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Sidebar */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-[200] md:hidden backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
                    <div className="absolute right-0 top-0 h-full w-4/5 bg-white p-6 shadow-2xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold">Menu</h2>
                             <button onClick={() => setIsMenuOpen(false)}><X size={28} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                             <button onClick={() => navigate('/login')} className="bg-gray-100 py-3 rounded-xl font-bold text-gray-900">Login</button>
                             <button onClick={() => navigate('/register')} className="bg-orange-500 py-3 rounded-xl font-bold text-white">Sell on StockSathi</button>
                        </div>
                        <div className="border-t pt-4">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
                             <div className="flex flex-col gap-2">
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => { navigate(`/?category=${cat}`); setIsMenuOpen(false); }}
                                        className="text-left py-2 font-medium text-gray-700 hover:text-orange-500"
                                    >
                                        {cat}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Horizontal - For desktop and mobile quick scroll */}
            <div className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth sticky top-[68px] md:top-[80px] z-[90]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex gap-4 md:gap-8 items-center min-w-max">
                    <button 
                        onClick={() => navigate('/')}
                        className={`text-sm font-bold tracking-tight whitespace-nowrap transition-colors flex items-center gap-1.5 ${!currentCategory ? 'text-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        All Categories <ChevronRight size={14} className="opacity-50" />
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => navigate(`/?category=${cat}`)}
                            className={`text-sm font-bold tracking-tight whitespace-nowrap transition-colors ${currentCategory === cat ? 'text-orange-500' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full px-4 py-6 md:py-10 flex flex-col gap-8">
                {/* Hero / Promo Section */}
                {!currentCategory && !searchTerm && (
                    <div className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500 h-[200px] md:h-[350px] shadow-2xl flex items-center px-8 md:px-16 animate-in fade-in duration-700">
                        <div className="relative z-10 flex flex-col gap-2 md:gap-6 max-w-xl">
                            <span className="text-white/80 font-black text-xs md:text-sm uppercase tracking-[0.2em] animate-in slide-in-from-left duration-500">Fast & Trusted Marketplace</span>
                            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none animate-in slide-in-from-left delay-100 duration-700">
                                Fresh Stock. <br/> Local Rates.
                            </h2>
                            <p className="text-white/90 text-sm md:text-lg font-medium leading-relaxed max-w-md animate-in slide-in-from-left delay-200 duration-1000">
                                Buy directly from local shopkeepers and manufacturers around you.
                            </p>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                             <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                             <div className="absolute top-40 right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                )}

                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        {searchTerm ? `Search Results for "${searchTerm}"` : (currentCategory || 'Recent Products')}
                    </h3>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{products.length} Items</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-64 md:h-80 animate-pulse border border-gray-100 shadow-sm overflow-hidden">
                                <div className="h-2/3 bg-gray-100"></div>
                                <div className="p-4 space-y-2">
                                     <div className="h-4 bg-gray-100 w-3/4 rounded-full"></div>
                                     <div className="h-4 bg-gray-100 w-1/2 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {products.map((product) => (
                            <div 
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="group bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                            >
                                <div className="relative h-44 md:h-56 bg-gray-100 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                            <ShoppingBag size={40} className="opacity-20" />
                                            <span className="text-xs font-bold tracking-widest uppercase opacity-30">No Image</span>
                                        </div>
                                    )}
                                    {/* Discount / Tag Overlay */}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
                                        New Arrival
                                    </div>
                                </div>
                                <div className="p-3 md:p-5 flex flex-col gap-1 md:gap-2">
                                    <span className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 self-start px-2 py-0.5 rounded-md">
                                        {product.category || 'Product'}
                                    </span>
                                    <h4 className="text-sm md:text-lg font-black text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                                        {product.name}
                                    </h4>
                                    <div className="flex items-baseline gap-1 md:gap-2 mt-1 md:mt-2">
                                        <span className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter">
                                            Rs {Number(product.sellingPrice).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">/{product.unitType}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 md:mt-2 border-t pt-2 md:pt-3">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                                            {(product as any).shop?.name?.charAt(0) || 'S'}
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-500 truncate">{(product as any).shop?.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                            <Search size={48} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-2xl font-black text-gray-900">Zero Results Found</h4>
                            <p className="text-gray-500 font-medium">Try broadening your search or choosing a different category.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-all"
                        >
                            Back to Everything
                        </button>
                    </div>
                )}
            </main>

            {/* Premium Footer */}
            <footer className="mt-auto bg-gray-900 text-white pt-10 md:pt-20 pb-8 rounded-t-[40px] md:rounded-t-[80px]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-xl">
                                <ShoppingBag size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">StockSathi</h2>
                         </div>
                         <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-sm">
                            Empowering local shopkeepers with state-of-the-art inventory management and a global sales reach.
                         </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-orange-500">Marketplace</h4>
                        <ul className="space-y-4 text-gray-400 font-bold">
                            <li className="hover:text-white cursor-pointer transition-colors">How it works</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Seller Dashboard</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Shop Directory</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-orange-500">Company</h4>
                        <ul className="space-y-4 text-gray-400 font-bold">
                            <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 md:mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 font-bold text-sm">
                    <p>&copy; 2024 StockSathi Marketplace. Built for scale.</p>
                    <div className="flex gap-6">
                        <span>FB</span>
                        <span>IG</span>
                        <span>TW</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
