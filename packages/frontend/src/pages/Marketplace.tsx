import { useState, useEffect } from 'react';
import { Search, ShoppingBag, ChevronRight, Menu, X, Sparkles, TrendingUp, Shield, LayoutDashboard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import productService from '@/services/product.service';
import { ProductDTO } from 'shared';
import { ProductCard } from '@/components/ProductCard';

export const Marketplace = () => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const currentCategory = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getPublicCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

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


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white sticky top-0 z-[100] border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <ShoppingBag size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
                            Stock<span className="text-emerald-600">Sathi</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl relative group">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-slate-100 border border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    navigate(val ? `/?search=${val}` : '/');
                                }
                            }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    </div>

                    {/* Auth Buttons — Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm"
                            >
                                <LayoutDashboard size={16} />Visit Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-5 py-2.5 text-slate-600 font-semibold hover:text-emerald-600 transition-colors text-sm"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm"
                                >
                                    Create Business
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={24} className="text-slate-700" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Sidebar */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-[200] md:hidden backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
                    <div className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white p-5 shadow-2xl flex flex-col gap-5" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Menu</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={22} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                                    className="flex items-center justify-center gap-2 bg-emerald-600 py-3 rounded-xl font-semibold text-white text-sm hover:bg-emerald-700 transition-colors"
                                >
                                    <LayoutDashboard size={16} />Visit Dashboard
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/login')} className="bg-slate-100 py-3 rounded-xl font-semibold text-slate-700 text-sm hover:bg-slate-200 transition-colors">Login</button>
                                    <button onClick={() => navigate('/register')} className="bg-emerald-600 py-3 rounded-xl font-semibold text-white text-sm hover:bg-emerald-700 transition-colors">Create Business</button>
                                </>
                            )}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
                            <div className="flex flex-col gap-1">
                                {categoriesLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                                    ))
                                ) : categories.length > 0 ? (
                                    categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { navigate(`/?category=${cat}`); setIsMenuOpen(false); }}
                                            className="text-left py-2.5 px-3 font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm"
                                        >
                                            {cat}
                                        </button>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic px-3">No categories found</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Bar */}
            <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar sticky top-[56px] md:top-[72px] z-[90]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex gap-2 md:gap-3 items-center">
                    <button
                        onClick={() => navigate('/')}
                        className={`text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 px-4 py-2 rounded-lg ${!currentCategory ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                        All <ChevronRight size={14} className="opacity-60" />
                    </button>
                    {categoriesLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg shrink-0"></div>
                        ))
                    ) : (
                        categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => navigate(`/?category=${cat}`)}
                                className={`text-sm font-semibold whitespace-nowrap transition-all px-4 py-2 rounded-lg ${currentCategory === cat ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                            >
                                {cat}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 flex flex-col gap-8">
                {/* Hero Section */}
                {!currentCategory && !searchTerm && (
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 min-h-[220px] md:min-h-[320px] flex items-center px-6 md:px-12">
                        <div className="relative z-10 flex flex-col gap-4 md:gap-5 max-w-lg py-8">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-300" />
                                <span className="text-emerald-200 font-semibold text-xs uppercase tracking-wider">Local Marketplace</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                Fresh Stock,<br />Local Prices
                            </h2>
                            <p className="text-emerald-100 text-sm md:text-base leading-relaxed max-w-sm">
                                Connect directly with local shopkeepers and manufacturers. Get the best deals in your area.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2 text-emerald-200 text-xs font-medium">
                                    <Shield size={14} />
                                    <span>Verified Sellers</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-200 text-xs font-medium">
                                    <TrendingUp size={14} />
                                    <span>Best Prices</span>
                                </div>
                            </div>
                        </div>
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full"></div>
                            <div className="absolute bottom-0 right-40 w-48 h-48 bg-white rounded-full"></div>
                        </div>
                    </div>
                )}

                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">
                        {searchTerm ? `Results for "${searchTerm}"` : (currentCategory || 'All Products')}
                    </h3>
                    <span className="text-sm font-medium text-slate-400">{products.length} items</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-[420px] animate-pulse border border-slate-100 overflow-hidden">
                                <div className="h-48 bg-slate-100"></div>
                                <div className="p-5 space-y-4">
                                    <div className="h-4 bg-slate-100 w-1/3 rounded-full"></div>
                                    <div className="h-5 bg-slate-100 w-3/4 rounded-full"></div>
                                    <div className="h-4 bg-slate-100 w-1/2 rounded-full"></div>
                                    <div className="h-10 bg-slate-100 rounded-xl mt-6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                image={product.imageUrl || ''}
                                category={product.category || 'Product'}
                                name={product.name}
                                price={Number(product.sellingPrice)}
                                originalPrice={Number(product.sellingPrice) * 1.2}
                                store={(product as any).shop?.name || 'Local Store'}
                                quantity={product.unitType}
                                badge="New"
                                onClick={() => navigate(`/product/${product.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                            <Search size={36} />
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="text-xl font-bold text-slate-800">No Products Found</h4>
                            <p className="text-slate-500 text-sm max-w-xs">Try a different search term or browse our categories.</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                        >
                            Browse All
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-auto bg-slate-800 text-white pt-12 pb-6">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                                <ShoppingBag size={22} />
                            </div>
                            <h2 className="text-xl font-bold">Stock<span className="text-emerald-400">Sathi</span></h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Connecting local businesses with customers. Your trusted marketplace for quality products at the best prices.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-slate-300">Marketplace</h4>
                        <ul className="space-y-2.5 text-sm text-slate-400">
                            <li className="hover:text-white cursor-pointer transition-colors">Browse Products</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Seller Dashboard</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Become a Seller</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-slate-300">Support</h4>
                        <ul className="space-y-2.5 text-sm text-slate-400">
                            <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                    <p>&copy; 2024 StockSathi. All rights reserved.</p>
                    <div className="flex gap-5">
                        <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
