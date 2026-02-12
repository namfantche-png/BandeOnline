'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adsApi, categoriesApi } from '@/lib/api';
import { AdImage } from '@/components/AdImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

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
  category: { name: string };
  user: { firstName: string; lastName: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAds();
  }, [page, filters.category, filters.city]);

  useEffect(() => {
    loadFeaturedAds();
  }, []);

  const loadFeaturedAds = async () => {
    try {
      const res = await adsApi.getAll({ page: 1, limit: 8, featured: true });
      setFeaturedAds(res.data?.data ?? []);
    } catch {
      setFeaturedAds([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const response = await adsApi.getAll({
        page,
        limit: 12,
        category: filters.category || undefined,
        city: filters.city || undefined,
        search: filters.search || undefined,
      });
      setAds(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAds();
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Pesquisar anúncios..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as cidades</option>
                <option value="Bissau">Bissau</option>
                <option value="Bafatá">Bafatá</option>
                <option value="Gabú">Gabú</option>
                <option value="Cacheu">Cacheu</option>
                <option value="Bolama">Bolama</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Pesquisar
              </button>
            </div>
          </form>
        </div>

        {/* Anúncios em Destaque */}
        {featuredAds.length > 0 && !filters.search && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-400 rounded" />
              Anúncios em Destaque
            </h2>
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
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-1 rounded">
                        Destaque
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h3>
                    <p className="text-lg font-bold text-blue-600 mt-1">{formatPrice(ad.price, ad.currency)}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{ad.city}</span>
                      <span>{formatDate(ad.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {filters.search ? `Resultados para "${filters.search}"` : 'Todos os Anúncios'}
          </h1>
          <span className="text-gray-500 text-sm">
            Página {page} de {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum anúncio encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar os filtros ou faça uma nova pesquisa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <Link
                key={ad.id}
                href={`/anuncios/${ad.id}`}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden ${
                  ad.isHighlighted ? 'ring-2 ring-yellow-400' : ''
                }`}
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {ad.isHighlighted && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded">
                      Destaque
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h3>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{ad.city}</span>
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {ad.category?.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
