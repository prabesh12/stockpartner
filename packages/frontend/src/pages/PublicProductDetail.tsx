import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Phone, MapPin, Share2, ShieldCheck, Truck } from 'lucide-react';
import productService from '@/services/product.service';
import { ProductDTO } from 'shared';

export const PublicProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<(ProductDTO & { shop: { name: string; contactNumber: string; address: string } }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">{error || 'Something went wrong'}</h2>
            <button 
                onClick={() => navigate('/')}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-all"
            >
                Return to Marketplace
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Minimal Header */}
            <header className="bg-white sticky top-0 z-[100] border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors group flex items-center gap-2"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden md:block font-bold text-gray-700">Back</span>
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                         <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <ShoppingBag size={18} />
                         </div>
                         <span className="font-black text-gray-900">StockSathi</span>
                    </div>
                    <button className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 size={24} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                
                {/* Left side: Images */}
                <div className="md:col-span-7 flex flex-col gap-6">
                    <div className="bg-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 aspect-square md:aspect-auto md:h-[600px] group relative">
                        {product.imageUrl ? (
                            <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                                <ShoppingBag size={80} className="opacity-10" />
                                <span className="font-black text-sm uppercase tracking-[0.3em] opacity-20">NO PRODUCT IMAGE</span>
                            </div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                             <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Featured</span>
                        </div>
                    </div>
                    
                    {/* Small Gallery Placeholder */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {[product.imageUrl, null, null].map((img, i) => (
                            <div key={i} className={`w-20 h-20 md:w-32 md:h-32 rounded-3xl border-2 shrink-0 ${i === 0 ? 'border-orange-500 shadow-lg shadow-orange-100' : 'border-transparent bg-white shadow-sm'}`}>
                                {img ? (
                                    <img src={img} className="w-full h-full object-cover rounded-[22px] md:rounded-[28px]" alt="Gallery item" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-[22px] md:rounded-[28px] text-gray-300">
                                        <ShoppingBag size={24} className="opacity-10" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side: Info */}
                <div className="md:col-span-5 flex flex-col gap-8 md:gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest">
                                {product.category || 'General'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-baseline gap-3">
                             <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                                Rs {Number(product.sellingPrice).toLocaleString()}
                             </span>
                             <span className="text-sm font-bold text-gray-400">/ {product.unitType}</span>
                        </div>
                    </div>

                    {/* Product Meta Section */}
                    {product.description && (
                         <div className="flex flex-col gap-4 pt-6 border-t border-gray-200">
                             <h3 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-widest">Description</h3>
                             <p className="text-gray-600 font-medium leading-relaxed md:text-lg">
                                {product.description}
                             </p>
                         </div>
                    )}

                    {/* Shop Section */}
                    <div className="bg-white rounded-[32px] p-6 md:p-8 flex flex-col gap-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] pointer-events-none group-hover:bg-orange-50 transition-colors duration-500"></div>
                        <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Retailer</span>
                             <h2 className="text-xl md:text-2xl font-black text-gray-900">{product.shop.name}</h2>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex flex-col">
                                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</span>
                                     <span className="text-sm md:text-base font-bold text-gray-700">{product.shop.address || 'Address not provided'}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div className="flex flex-col">
                                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</span>
                                     <span className="text-sm md:text-base font-bold text-gray-700">{product.shop.contactNumber || 'No contact number'}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <a 
                            href={`tel:${product.shop.contactNumber}`}
                            className="w-full bg-gray-900 text-white flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black md:text-lg hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 group active:scale-95"
                        >
                            <Phone size={20} fill="currentColor" className="group-hover:animate-bounce" />
                            Call to Purchase
                        </a>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 gap-2">
                             <ShieldCheck className="text-green-500" size={24} />
                             <span className="text-[10px] font-black uppercase text-gray-400">Verified Shop</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 gap-2">
                             <Truck className="text-blue-500" size={24} />
                             <span className="text-[10px] font-black uppercase text-gray-400">Local Delivery</span>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Simple Related Section placeholder */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-20 border-t border-gray-200">
                 <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-8">From the same shop</h3>
                 <div className="flex items-center justify-center py-10 bg-white rounded-[40px] border border-gray-100 border-dashed">
                      <p className="text-gray-400 font-bold uppercase tracking-widest">More products coming soon</p>
                 </div>
            </div>

             {/* Footer - Reusing basic styles or keep it clean */}
             <footer className="bg-white py-12 border-t border-gray-100 mt-auto">
                 <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                           <ShoppingBag size={18} />
                        </div>
                        <span className="font-black text-gray-900">StockSathi</span>
                     </div>
                     <p className="text-gray-400 font-bold text-sm tracking-tight">&copy; 2024 StockSathi Marketplace. All rights reserved.</p>
                 </div>
             </footer>
        </div>
    );
};
