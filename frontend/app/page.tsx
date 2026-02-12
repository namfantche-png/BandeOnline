'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, MessageSquare, TrendingUp } from 'lucide-react';
import { adsApi } from '@/lib/api';
import { AdImage } from '@/components/AdImage';
import { useAuth } from '@/contexts/AuthContext';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  images: string[];
  isHighlighted: boolean;
  createdAt: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    const loadFeaturedAds = async () => {
      setIsLoadingFeatured(true);
      try {
        const res = await adsApi.getAll({ page: 1, limit: 8, featured: true });
        setFeaturedAds(res.data?.data ?? []);
      } catch {
        setFeaturedAds([]);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeaturedAds();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-GW', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-t-4 border-primary-500">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold">
              <span className="text-primary-500">Bissau</span>
              <span className="text-accent-500">Market</span>
            </h1>
          </div>
          {!isAuthenticated && (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-primary-500 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link
                href="/registrar"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
              >
                Registrar
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-dark mb-4">
            Compre e Venda Online
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A maior plataforma de anúncios classificados do mercado africano lusófono
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anúncios..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/anuncios"
              className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Explorar Anúncios
            </Link>
            <Link
              href="/registrar"
              className="px-8 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 font-medium"
            >
              Começar a Vender
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      {!isLoadingFeatured && featuredAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-400 rounded" />
              Anúncios em Destaque
            </h3>
            <Link
              href="/anuncios"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todos os anúncios
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/anuncios/${ad.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden ring-2 ring-amber-400"
              >
                <div className="relative">
                  <div className="h-48 bg-gray-200">
                    {ad.images && ad.images[0] ? (
                      <AdImage
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-1 rounded">
                      Destaque
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h4>
                  <p className="text-lg font-bold text-primary-600 mt-1">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{ad.city}</span>
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Por que escolher BissauMarket?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <ShoppingBag className="w-12 h-12 text-primary-500 mb-4" />
              <h4 className="text-xl font-bold mb-2">Fácil de Usar</h4>
              <p className="text-gray-600">
                Interface simples e intuitiva, otimizada para internet lenta
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <MessageSquare className="w-12 h-12 text-accent-500 mb-4" />
              <h4 className="text-xl font-bold mb-2">Chat em Tempo Real</h4>
              <p className="text-gray-600">
                Comunique-se diretamente com compradores e vendedores
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <TrendingUp className="w-12 h-12 text-success-500 mb-4" />
              <h4 className="text-xl font-bold mb-2">Planos Flexíveis</h4>
              <p className="text-gray-600">
                Escolha o plano que melhor se adequa ao seu negócio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Nossos Planos</h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* FREE Plan */}
          <div className="border border-gray-300 rounded-lg p-8 hover:shadow-lg transition">
            <h4 className="text-2xl font-bold mb-2">FREE</h4>
            <p className="text-gray-600 mb-4">Grátis</p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span>
                <span>3 anúncios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span>
                <span>Chat com compradores</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">✓</span>
                <span>Perfil básico</span>
              </li>
            </ul>
            <Link
              href="/registrar"
              className="w-full block text-center px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
            >
              Começar
            </Link>
          </div>

          {/* PRO Plan */}
          <div className="border-2 border-primary-500 rounded-lg p-8 bg-primary-50 hover:shadow-lg transition">
            <div className="bg-primary-500 text-white px-3 py-1 rounded-full inline-block mb-2 text-sm font-bold">
              Popular
            </div>
            <h4 className="text-2xl font-bold mb-2">PRO</h4>
            <p className="text-gray-600 mb-4">5.000 XOF/mês</p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span>
                <span>20 anúncios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>1 anúncio em destaque</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Chat prioritário</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Estatísticas</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Escolher PRO
            </Link>
          </div>

          {/* PREMIUM Plan */}
          <div className="border border-gray-300 rounded-lg p-8 hover:shadow-lg transition">
            <h4 className="text-2xl font-bold mb-2">PREMIUM</h4>
            <p className="text-gray-600 mb-4">15.000 XOF/mês</p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Anúncios ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Destaques ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Loja virtual</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Suporte dedicado</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full block text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Escolher PREMIUM
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-bold mb-4">Sobre</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Quem somos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Suporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Redes Sociais</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BissauMarket. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
