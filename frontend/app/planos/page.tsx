'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { plansApi, paymentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

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

export default function PlansPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('orange_money');

  useEffect(() => {
    loadPlans();
    if (isAuthenticated) {
      loadCurrentPlan();
    }
  }, [isAuthenticated]);

  const loadPlans = async () => {
    try {
      const response = await plansApi.getAll();
      setPlans(response.data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const response = await plansApi.getActive();
      setCurrentPlan(response.data?.plan?.name || 'FREE');
    } catch (error) {
      console.error('Erro ao carregar plano atual:', error);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (plan.name === 'FREE') {
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      const response = await paymentsApi.initiate({
        planId: selectedPlan.id,
        method: paymentMethod,
      });

      // Em produção, redirecionar para gateway de pagamento
      alert(`Pagamento iniciado! ID: ${response.data.paymentId}\n\nEm produção, você seria redirecionado para ${paymentMethod === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money'}.`);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Erro ao iniciar pagamento:', error);
      alert('Erro ao iniciar pagamento');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Grátis';
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlanColor = (name: string) => {
    switch (name) {
      case 'FREE':
        return 'border-gray-200';
      case 'PRO':
        return 'border-blue-500 ring-2 ring-blue-500';
      case 'PREMIUM':
        return 'border-yellow-500 ring-2 ring-yellow-500';
      default:
        return 'border-gray-200';
    }
  };

  const getPlanBadge = (name: string) => {
    if (name === 'PRO') {
      return (
        <span className="absolute top-0 right-0 -translate-y-1/2 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          Popular
        </span>
      );
    }
    if (name === 'PREMIUM') {
      return (
        <span className="absolute top-0 right-0 -translate-y-1/2 bg-yellow-500 text-yellow-900 text-xs font-medium px-3 py-1 rounded-full">
          Melhor valor
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para você
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aumente suas vendas com mais anúncios, destaques e recursos exclusivos.
            Comece grátis e faça upgrade quando quiser.
          </p>
        </div>

        {/* Planos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-sm p-6 border-2 ${getPlanColor(plan.name)}`}
              >
                {getPlanBadge(plan.name)}

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency)}
                  </p>
                  {plan.price > 0 && (
                    <p className="text-gray-500 text-sm">por mês</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={currentPlan === plan.name}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    currentPlan === plan.name
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.name === 'FREE'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : plan.name === 'PRO'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600'
                  }`}
                >
                  {currentPlan === plan.name
                    ? 'Plano atual'
                    : plan.name === 'FREE'
                    ? 'Começar grátis'
                    : 'Fazer upgrade'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Perguntas frequentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white rounded-lg shadow-sm p-4">
              <summary className="font-medium cursor-pointer">
                Posso cancelar meu plano a qualquer momento?
              </summary>
              <p className="mt-2 text-gray-600">
                Sim, você pode cancelar seu plano a qualquer momento. Seu plano continuará ativo até o final do período pago.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-sm p-4">
              <summary className="font-medium cursor-pointer">
                Quais métodos de pagamento são aceitos?
              </summary>
              <p className="mt-2 text-gray-600">
                Aceitamos Orange Money e MTN Mobile Money. Em breve, também aceitaremos cartões de crédito.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-sm p-4">
              <summary className="font-medium cursor-pointer">
                O que acontece quando meu plano expira?
              </summary>
              <p className="mt-2 text-gray-600">
                Seus anúncios continuarão ativos, mas você voltará para o plano FREE com limite de 3 anúncios.
              </p>
            </details>
          </div>
        </div>
      </main>

      {/* Modal de pagamento */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Assinar plano {selectedPlan.name}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              {formatPrice(selectedPlan.price, selectedPlan.currency)}/mês
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="orange_money"
                  checked={paymentMethod === 'orange_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Orange Money</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="mtn_money"
                  checked={paymentMethod === 'mtn_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">MTN Mobile Money</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Pagar agora
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
