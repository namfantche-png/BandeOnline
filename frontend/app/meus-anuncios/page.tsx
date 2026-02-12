'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adsApi, subscriptionsApi } from '@/lib/api';
import { AdImage } from '@/components/AdImage';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  city: string;
  images: string[];
  isHighlighted: boolean;
  createdAt: string;
  category: { name: string };
}

export default function MeusAnunciosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [maxHighlights, setMaxHighlights] = useState(0);
  const [highlightingId, setHighlightingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyAds();
      loadSubscription();
    }
  }, [isAuthenticated, page]);

  const loadSubscription = async () => {
    try {
      const res = await subscriptionsApi.getActive();
      const plan = res.data?.plan ?? res.data;
      setMaxHighlights(plan?.maxHighlights ?? 0);
    } catch {
      setMaxHighlights(0);
    }
  };

  const loadMyAds = async () => {
    setIsLoading(true);
    try {
      const response = await adsApi.getMyAds({ page, limit: 12 });
      setAds(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsSold = async (adId: string) => {
    if (!confirm('Marcar este anúncio como vendido?')) return;
    try {
      await adsApi.markAsSold(adId);
      loadMyAds();
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error);
      alert('Erro ao marcar como vendido.');
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;
    try {
      await adsApi.delete(adId);
      loadMyAds();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir anúncio.');
    }
  };

  const handleHighlight = async (adId: string) => {
    setHighlightingId(adId);
    try {
      await adsApi.highlight(adId);
      loadMyAds();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao destacar anúncio.');
    } finally {
      setHighlightingId(null);
    }
  };

  const handleUnhighlight = async (adId: string) => {
    setHighlightingId(adId);
    try {
      await adsApi.unhighlight(adId);
      loadMyAds();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao remover destaque.');
    } finally {
      setHighlightingId(null);
    }
  };

  const canHighlight = maxHighlights > 0;

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      paused: 'bg-orange-100 text-orange-800',
      removed: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Ativo',
      pending: 'Pendente',
      sold: 'Vendido',
      paused: 'Pausado',
      removed: 'Removido',
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
          <Link
            href="/anuncios/criar"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Publicar Anúncio
          </Link>
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum anúncio publicado</h3>
            <p className="mt-2 text-sm text-gray-500">Comece a vender publicando seu primeiro anúncio.</p>
            <Link
              href="/anuncios/criar"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Publicar Anúncio
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                    ad.isHighlighted ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <Link href={`/anuncios/${ad.id}`}>
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
                        {ad.isHighlighted && (
                          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate flex-1">{ad.title}</h3>
                      {getStatusBadge(ad.status)}
                    </div>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(ad.price, ad.currency)}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{ad.city}</span>
                      <span className="ml-2">{formatDate(ad.createdAt)}</span>
                    </div>
                    {ad.category?.name && (
                      <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {ad.category.name}
                      </span>
                    )}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Link
                        href={`/anuncios/${ad.id}/editar`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </Link>
                      {canHighlight && ad.status === 'active' && (
                        ad.isHighlighted ? (
                          <button
                            onClick={() => handleUnhighlight(ad.id)}
                            disabled={!!highlightingId}
                            className="text-sm text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
                          >
                            {highlightingId === ad.id ? '...' : 'Remover Destaque'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHighlight(ad.id)}
                            disabled={!!highlightingId}
                            className="text-sm text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
                          >
                            {highlightingId === ad.id ? '...' : 'Destacar'}
                          </button>
                        )
                      )}
                      {ad.status !== 'sold' && (
                        <button
                          onClick={() => handleMarkAsSold(ad.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Vendido
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
