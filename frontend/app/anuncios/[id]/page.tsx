'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adsApi, messagesApi, reviewsApi, reportsApi } from '@/lib/api';
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
  city: string;
  country: string;
  location: string;
  images: string[];
  condition: string;
  status: string;
  views: number;
  contactPhone?: string;
  contactWhatsapp?: string;
  createdAt: string;
  category: { id: string; name: string };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [message, setMessage] = useState('');
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (params.id) {
      loadAd();
    }
  }, [params.id]);

  const loadAd = async () => {
    setIsLoading(true);
    try {
      const response = await adsApi.getById(params.id as string);
      setAd(response.data);

      // Carrega estatísticas de avaliação do vendedor
      const statsResponse = await reviewsApi.getStats(response.data.user.id);
      setReviewStats(statsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar anúncio:', error);
      router.push('/anuncios');
    } finally {
      setIsLoading(false);
    }
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
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!message.trim()) return;

    try {
      await messagesApi.send({
        receiverId: ad!.user.id,
        content: message,
        adId: ad!.id,
      });
      setMessage('');
      setShowContactModal(false);
      alert('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!reportReason.trim()) return;

    try {
      await reportsApi.create({
        reason: reportReason,
        reportedAdId: ad!.id,
      });
      setReportReason('');
      setShowReportModal(false);
      alert('Denúncia enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      alert('Erro ao enviar denúncia');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Início
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/anuncios" className="text-gray-500 hover:text-gray-700">
            Anúncios
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{ad.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2">
            {/* Galeria de imagens */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative h-96">
                {ad.images && ad.images.length > 0 ? (
                  <AdImage
                    src={ad.images[selectedImage]}
                    alt={ad.title}
                    className="w-full h-full object-contain bg-gray-100"
                    objectFit="contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {ad.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <AdImage src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalhes do anúncio */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                    {ad.category?.name}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{ad.title}</h1>
                </div>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-gray-400 hover:text-red-500"
                  title="Denunciar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(ad.price, ad.currency)}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {ad.city}, {ad.country}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {ad.views ?? 0} visualizações
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(ad.createdAt)}
                </span>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h2>
                <p className="text-gray-600 whitespace-pre-line">{ad.description}</p>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Condição</span>
                    <p className="font-medium">
                      {ad.condition === 'new' ? 'Novo' : ad.condition === 'used' ? 'Usado' : 'Recondicionado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Localização</span>
                    <p className="font-medium">{ad.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Card do vendedor */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-24">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  {ad.user.avatar ? (
                    <AdImage
                      src={ad.user.avatar}
                      alt={ad.user.firstName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {ad.user.firstName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900">
                      {ad.user.firstName} {ad.user.lastName}
                    </h3>
                    {ad.user.isVerified && (
                      <svg
                        className="w-5 h-5 text-blue-500 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {reviewStats && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-400 mr-1">★</span>
                      {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} avaliações)
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Membro desde {formatDate(ad.user.createdAt)}
                  </p>
                </div>
              </div>

              <Link
                href={`/perfil/${ad.user.id}`}
                className="block text-center text-blue-600 hover:text-blue-700 text-sm mb-4"
              >
                Ver perfil do vendedor
              </Link>

              <div className="space-y-3">
                {/* Mostrar botões de editar/deletar apenas para o dono */}
                {isAuthenticated && user?.id === ad.user.id ? (
                  <>
                    <Link
                      href={`/anuncios/${ad.id}/editar`}
                      className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja deletar este anúncio?')) {
                          adsApi.delete(ad.id)
                            .then(() => {
                              alert('Anúncio deletado com sucesso');
                              router.push('/');
                            })
                            .catch((error) => {
                              alert(error.response?.data?.message || 'Erro ao deletar anúncio');
                            });
                        }
                      }}
                      className="w-full flex items-center justify-center bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Deletar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Enviar Mensagem
                    </button>

                    {ad.contactPhone && (
                      <a
                        href={`tel:${ad.contactPhone}`}
                        className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        Ligar
                      </a>
                    )}

                    {ad.contactWhatsapp && (
                      <a
                        href={`https://wa.me/${ad.contactWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de contato */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Enviar mensagem</h3>
            <p className="text-sm text-gray-500 mb-4">
              Sobre: {ad.title}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de denúncia */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Denunciar anúncio</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o motivo</option>
              <option value="spam">Spam ou publicidade</option>
              <option value="fraud">Fraude ou golpe</option>
              <option value="inappropriate">Conteúdo impróprio</option>
              <option value="duplicate">Anúncio duplicado</option>
              <option value="other">Outro</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Denunciar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
