'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Loading } from '@/components/Loading';
import { Toast } from '@/components/Toast';
import { toastManager } from '@/lib/toast';

// Componente de Tab de Usuários
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal de mudança de plano
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planReason, setPlanReason] = useState('');
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [page, search, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const response = await api.get('/admin/users', { params });
      console.log('Users response:', response.data);
      
      // Validar e extrair dados corretamente
      // A resposta vem em { data: [...], pagination: {...} }
      const usersData = response.data?.data || [];
      const totalPagesData = response.data?.pagination?.pages || 1;
      
      setUsers(usersData);
      setTotalPages(totalPagesData);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setUsers([]);
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data?.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar planos:', err);
    }
  };

  const handleOpenPlanModal = (user: any) => {
    setSelectedUser(user);
    setSelectedPlan(user.currentPlan?.id || '');
    setPlanReason('');
    setShowPlanModal(true);
  };

  const handleChangePlan = async () => {
    if (!selectedUser || !selectedPlan) {
      toastManager.error('Erro', 'Selecione um plano');
      return;
    }

    setChangingPlan(true);
    try {
      await api.post(`/admin/users/${selectedUser.id}/change-plan`, {
        planId: selectedPlan,
        reason: planReason,
      });
      toastManager.success('Sucesso', 'Plano alterado com sucesso');
      setShowPlanModal(false);
      fetchUsers();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao alterar plano');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja bloquear este usuário?')) return;
    try {
      await api.post(`/admin/users/block`, { userId });
      toastManager.success('Sucesso', 'Usuário bloqueado com sucesso');
      fetchUsers();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao bloquear usuário');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja desbloquear este usuário?')) return;
    try {
      await api.post(`/admin/users/${userId}/unblock`);
      toastManager.success('Sucesso', 'Usuário desbloqueado com sucesso');
      fetchUsers();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao desbloquear usuário');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja verificar este usuário?')) return;
    try {
      await api.post(`/admin/users/${userId}/verify`);
      toastManager.success('Sucesso', 'Usuário verificado com sucesso');
      fetchUsers();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao verificar usuário');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Gerenciamento de Usuários</h2>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Procurar por email ou nome..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Usuários</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plano</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Anúncios</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users && Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.profile?.firstName} {user.profile?.lastName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.currentPlan?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.adsCount || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenPlanModal(user)}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                        title="Alterar plano do usuário"
                      >
                        Mudar Plano
                      </button>
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Bloquear
                        </button>
                      )}
                      {!user.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          Verificar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">Página {page} de {totalPages}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Modal de Mudança de Plano */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Mudar Plano - {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Plano
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um plano</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.maxAds} anúncios
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={planReason}
                  onChange={(e) => setPlanReason(e.target.value)}
                  placeholder="Ex: Upgrade promocional, Suporte ao cliente, etc..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Plano Atual:</strong> {selectedUser.currentPlan?.name || 'Nenhum'} ({selectedUser.currentPlan?.maxAds || 0} anúncios)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPlanModal(false)}
                disabled={changingPlan}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePlan}
                disabled={changingPlan || !selectedPlan}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPlan ? 'Atualizando...' : 'Mudar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Tab de Anúncios
function AdsTab() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchAds();
  }, [statusFilter]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/ads', { params: { status: statusFilter } });
      console.log('Ads response:', response.data);
      
      // Validar resposta - dados vêm em response.data.data
      const adsData = response.data?.data || [];
      setAds(adsData);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar anúncios:', err);
      setAds([]);
      setError(err.response?.data?.message || 'Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateAd = async (adId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await api.post(`/admin/ads/moderate`, {
        adId,
        action,
        ...(reason && { rejectionReason: reason }),
      });
      toastManager.success('Sucesso', `Anúncio ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`);
      fetchAds();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao moderar anúncio');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Tem certeza que deseja remover este anúncio?')) return;
    try {
      await api.delete(`/admin/ads/${adId}`);
      toastManager.success('Sucesso', 'Anúncio removido com sucesso');
      fetchAds();
    } catch (err: any) {
      toastManager.error('Erro', err.response?.data?.message || 'Erro ao remover anúncio');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Moderação de Anúncios</h2>

      {/* Filtro de Status */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pendentes</option>
          <option value="active">Ativos</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Grid de Anúncios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads && Array.isArray(ads) && ads.length > 0 ? (
          ads.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              {ad.images && ad.images.length > 0 && (
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{ad.description?.substring(0, 100)}...</p>
              <p className="text-lg font-bold text-blue-600 mb-4">${ad.price}</p>

              <p className="text-sm text-gray-500 mb-3">
                <strong>Vendedor:</strong> {ad.seller?.email}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <strong>Status:</strong>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    ad.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : ad.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ad.status}
                </span>
              </p>

            {statusFilter === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleModerateAd(ad.id, 'approve')}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Motivo da rejeição:');
                    if (reason) handleModerateAd(ad.id, 'reject', reason);
                  }}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Rejeitar
                </button>
              </div>
            )}

            {statusFilter !== 'pending' && (
              <button
                onClick={() => handleDeleteAd(ad.id)}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remover
              </button>
            )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-600">
            Nenhum anúncio encontrado com este status.
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Tab de Denúncias
function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports', { params: { status: statusFilter } });
      console.log('Reports response:', response.data);
      
      // Validar resposta - dados vêm em response.data.data
      const reportsData = response.data?.data || [];
      setReports(reportsData);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar denúncias:', err);
      setReports([]);
      setError(err.response?.data?.message || 'Erro ao carregar denúncias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Denúncias e Reportes</h2>

      {/* Filtro de Status */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pendentes</option>
          <option value="resolved">Resolvidas</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabela de Denúncias */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reportado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Motivo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reportado por</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports && Array.isArray(reports) && reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{report.reportedAdId || report.reportedUserId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.reporter?.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {report.status === 'pending' ? 'Pendente' : 'Resolvido'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Nenhuma denúncia encontrada com este status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente de Tab de Pagamentos
function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payments');
      console.log('Payments response:', response.data);
      
      // Validar resposta - dados vêm em response.data.data
      const paymentsData = response.data?.data || [];
      setPayments(paymentsData);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar pagamentos:', err);
      setPayments([]);
      setError(err.response?.data?.message || 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Histórico de Pagamentos</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabela de Pagamentos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID Transação</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
            </tr>
          </thead>
          <tbody>
            {payments && Array.isArray(payments) && payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.transactionId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.user?.email}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">${payment.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status === 'completed'
                        ? 'Completo'
                        : payment.status === 'pending'
                        ? 'Pendente'
                        : 'Falhou'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Dashboard do Administrador
 * Apenas usuários com role='admin' podem acessar
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar permissão de admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Carregar estatísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
        setError('');
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        const errorMsg = err.response?.data?.message || 'Erro ao carregar dashboard';
        setError(errorMsg);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      setLoading(true);
      fetchStats();
    } else if (!authLoading && user) {
      // Usuário autenticado mas não é admin
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <Loading fullscreen message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-500">Possíveis causas:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>Você não tem permissão de administrador</li>
              <li>Servidor não está respondendo</li>
              <li>Token expirou - faça login novamente</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setError('');
              router.push('/login');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel de Administração
          </h1>
          <p className="text-gray-500">Bem-vindo, {user?.firstName || 'Admin'}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Usuários
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📢 Anúncios
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🚨 Denúncias
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            💳 Pagamentos
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.activeUsers || 0}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            {/* Total Ads */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total de Anúncios</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats?.totalAds || 0}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <span className="text-2xl">📢</span>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Receita Total</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats?.totalRevenue?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'XOF',
                    }) || '0 XOF'}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab />}

        {/* Ads Tab */}
        {activeTab === 'ads' && <AdsTab />}

        {/* Reports Tab */}
        {activeTab === 'reports' && <ReportsTab />}

        {/* Payments Tab */}
        {activeTab === 'payments' && <PaymentsTab />}
      </main>
    </div>
  );
}
