'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usersApi, adsApi, reviewsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdImage } from '@/components/AdImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Ad {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  images: string[];
  createdAt: string;
  category: {
    name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('anuncios');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Carrega dados do usuário
        const userResponse = await usersApi.getProfile(userId);
        setUserProfile(userResponse.data);

        // Carrega anúncios do usuário
        const adsResponse = await adsApi.listByUser(userId);
        setUserAds(adsResponse.data || []);

        // Carrega avaliações
        const reviewsResponse = await reviewsApi.getForUser(userId);
        setReviews(reviewsResponse.data || []);
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        setError(err.response?.data?.message || 'Erro ao carregar perfil do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">Carregando perfil...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !userProfile) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error || 'Usuário não encontrado'}
            </div>
            <Link href="/anuncios" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Voltar aos anúncios
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const adsCount = userAds.length;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <BackButton />
          {/* Cabeçalho do perfil */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start gap-6">
              {userProfile.avatar ? (
                <AdImage
                  src={userProfile.avatar}
                  alt={userProfile.firstName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl text-gray-600">
                    {userProfile.firstName[0]}{userProfile.lastName[0]}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  {userProfile.isVerified && (
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.03A3.066 3.066 0 006.267 3.455zm9.8 9.8a3.066 3.066 0 01-2.77 1.745 3.066 3.066 0 003.03 3.58 3.066 3.066 0 001.745-3.066zm-7.34 7.34a3.066 3.066 0 01-1.745 2.77 3.066 3.066 0 013.58-3.03 3.066 3.066 0 01-1.835.26zm7.34-7.34a3.066 3.066 0 012.77-1.745 3.066 3.066 0 00-3.03-3.58 3.066 3.066 0 00-1.745 3.066z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  {userProfile.city && userProfile.country && (
                    <p>📍 {userProfile.city}, {userProfile.country}</p>
                  )}
                  {userProfile.bio && <p className="mt-2">{userProfile.bio}</p>}
                </div>

                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold">{adsCount}</p>
                    <p className="text-sm text-gray-600">Anúncios</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                    <p className="text-sm text-gray-600">Avaliações</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{averageRating}</p>
                    <p className="text-sm text-gray-600">Classificação</p>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/mensagens?userId=${userId}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Enviar Mensagem
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Abas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('anuncios')}
                className={`flex-1 py-4 px-6 text-center font-medium transition ${
                  activeTab === 'anuncios'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anúncios ({adsCount})
              </button>
              <button
                onClick={() => setActiveTab('avaliacoes')}
                className={`flex-1 py-4 px-6 text-center font-medium transition ${
                  activeTab === 'avaliacoes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Avaliações ({reviews.length})
              </button>
            </div>

            <div className="p-6">
              {/* Anúncios */}
              {activeTab === 'anuncios' && (
                <div>
                  {userAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userAds.map((ad) => (
                        <Link
                          key={ad.id}
                          href={`/anuncios/${ad.id}`}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                        >
                          {ad.images[0] ? (
                            <AdImage
                              src={ad.images[0]}
                              alt={ad.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">Sem imagem</span>
                            </div>
                          )}
                          <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">{ad.category.name}</p>
                            <h3 className="font-semibold line-clamp-2 mb-2">{ad.title}</h3>
                            <p className="text-lg font-bold text-blue-600">
                              {ad.price.toLocaleString('pt-GW')} {ad.currency}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(ad.createdAt).toLocaleDateString('pt-GW')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Este usuário não tem anúncios</p>
                  )}
                </div>
              )}

              {/* Avaliações */}
              {activeTab === 'avaliacoes' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {review.reviewer.avatar ? (
                            <AdImage
                              src={review.reviewer.avatar}
                              alt={review.reviewer.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm text-gray-600">
                                {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">
                              {review.reviewer.firstName} {review.reviewer.lastName}
                            </p>
                            <div className="flex gap-1 my-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('pt-GW')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Este usuário não tem avaliações</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
