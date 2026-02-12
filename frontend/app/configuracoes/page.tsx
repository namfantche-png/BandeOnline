'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  maxAds: number;
  maxHighlights: number;
  maxImages: number;
  hasStore: boolean;
  adDuration: number;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  plan: Plan;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.profile?.location || '',
            bio: data.profile?.bio || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'planos') {
      loadPlans();
    }
  }, [activeTab]);

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const token = localStorage.getItem('token');

      const plansResponse = await fetch('http://localhost:3000/api/plans');
      const plansData = await plansResponse.json();
      setPlans(Array.isArray(plansData) ? plansData : []);

      const currentResponse = await fetch('http://localhost:3000/api/subscriptions/active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentPlan(currentData);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        alert('Plano atualizado com sucesso!');
        loadPlans();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message || 'Não foi possível fazer o upgrade'}`);
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      alert('Erro ao fazer upgrade');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition ${
                activeTab === 'perfil'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('seguranca')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition ${
                activeTab === 'seguranca'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Segurança
            </button>
            <button
              onClick={() => setActiveTab('planos')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition ${
                activeTab === 'planos'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Plano
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'perfil' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Primeiro Nome</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Último Nome</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Localização</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </form>
            )}

            {activeTab === 'seguranca' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Aqui você pode gerenciar a segurança da sua conta.</p>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Alterar Senha</h3>
                  <p className="text-gray-600 text-sm mb-4">Para sua segurança, você será redirecionado para uma página segura.</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Alterar Senha
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'planos' && (
              <div className="space-y-6">
                {plansLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Carregando planos...</p>
                  </div>
                ) : currentPlan && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Plano Atual</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Plano</p>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan.plan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Anúncios</p>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan.plan.maxAds}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Imagens/Anúncio</p>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan.plan.maxImages}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Destaques</p>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan.plan.maxHighlights}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Ativo desde {new Date(currentPlan.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Outros Planos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`border-2 rounded-lg p-6 transition ${
                          currentPlan?.plan.id === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                          {plan.price > 0 && (
                            <span className="text-xl font-bold text-gray-900">
                              {plan.price.toLocaleString('pt-GW')} {plan.currency}
                            </span>
                          )}
                        </div>

                        {plan.price === 0 && (
                          <p className="text-xl font-bold text-green-600 mb-4">Grátis</p>
                        )}

                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {plan.maxAds} anúncios
                          </li>
                          <li className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {plan.maxImages} imagens/anúncio
                          </li>
                          <li className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {plan.maxHighlights > 0 ? `${plan.maxHighlights} destaques` : 'Sem destaques'}
                          </li>
                          {plan.hasStore && (
                            <li className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Loja virtual
                            </li>
                          )}
                        </ul>

                        {currentPlan?.plan.id === plan.id ? (
                          <button
                            disabled
                            className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold cursor-not-allowed opacity-60"
                          >
                            Plano Atual
                          </button>
                        ) : plan.price <= (currentPlan?.plan.price || 0) ? (
                          <button
                            disabled
                            className="w-full py-2 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                          >
                            Plano Inferior
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpgradePlan(plan.id)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Fazer Upgrade
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

