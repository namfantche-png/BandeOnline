'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  dueDate?: string;
  payment?: {
    status: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/invoices', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error('Erro ao carregar faturas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'paid') return inv.status === 'paid' || inv.payment?.status === 'completed';
    if (filter === 'pending') return inv.status === 'pending' || inv.payment?.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-500">Carregando faturas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-primary-500 hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-dark">Minhas Faturas</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-dark hover:bg-gray-200'
              }`}
            >
              Todas ({invoices.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'paid'
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-dark hover:bg-gray-200'
              }`}
            >
              Pagas ({invoices.filter((i) => i.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'pending'
                  ? 'bg-accent-500 text-dark'
                  : 'bg-gray-100 text-dark hover:bg-gray-200'
              }`}
            >
              Pendentes ({invoices.filter((i) => i.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredInvoices.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-dark font-semibold">Número</th>
                  <th className="px-6 py-4 text-left text-dark font-semibold">Data</th>
                  <th className="px-6 py-4 text-left text-dark font-semibold">Valor</th>
                  <th className="px-6 py-4 text-left text-dark font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-dark font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-dark">{invoice.number}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-dark">
                      {invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          invoice.status === 'paid' || invoice.payment?.status === 'completed'
                            ? 'bg-success-100 text-success-500'
                            : 'bg-accent-100 text-accent-500'
                        }`}
                      >
                        {invoice.status === 'paid' || invoice.payment?.status === 'completed'
                          ? 'Paga'
                          : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-500 hover:underline font-semibold">
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">Nenhuma fatura encontrada</p>
              <Link href="/" className="text-primary-500 hover:underline">
                Voltar ao início
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
