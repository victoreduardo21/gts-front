'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metricas {
  clientesTotais: number;
  projetosRodando: number;
  projetosEntregues: number;
  projetosPertoPrazo: number;
  projetosAtrasados: number;
  faturamentoProjetosMes: number;
  faturamentoRealCaixa: number;
}

interface ItemGrafico {
  name: string;
  Contratos: number;
  Caixa: number;
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<ItemGrafico[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔑 Função auxiliar para recuperar os headers com Token JWT
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const carregarDadosDashboard = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(`${apiUrl}/api/dashboard`, {
        headers: getAuthHeaders()
      });
      
      if (resposta.ok) {
        const dados = await resposta.json();
        setMetricas(dados.metricas || null);
        setDadosGrafico(dados.grafico || []);
      } else if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/';
      }
    } catch (erro) {
      console.error("Erro ao buscar dados do faturamento:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  if (carregando || !metricas) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-3 text-gray-500">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm font-medium">Sincronizando com o banco de dados...</p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="space-y-8 p-4 md:p-6 bg-gray-50/50 min-h-screen">
        
        {/* CABEÇALHO DA TELA */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-950">Visão Geral</h2>
          <p className="text-sm text-gray-500">Acompanhe a saúde, prazos e faturamento do seu negócio ao longo do ano.</p>
        </div>

        {/* --- SEÇÃO 1: CONTADORES E MÉTRICAS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl"><Users size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clientes</p>
              <p className="text-xl font-extrabold text-gray-900">{metricas.clientesTotais}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Em Andamento</p>
              <p className="text-xl font-extrabold text-gray-900">{metricas.projetosRodando}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entregues</p>
              <p className="text-xl font-extrabold text-gray-900">{metricas.projetosEntregues}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perto do Prazo</p>
              <p className="text-xl font-extrabold text-gray-900">{metricas.projetosPertoPrazo}</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${
            metricas.projetosAtrasados > 0 ? 'border-red-200 bg-red-50/50' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-3 rounded-xl ${metricas.projetosAtrasados > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atrasados</p>
              <p className={`text-xl font-extrabold ${metricas.projetosAtrasados > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {metricas.projetosAtrasados}
              </p>
            </div>
          </div>
        </div>

        {/* --- SEÇÃO 2: ALERTA OPERACIONAL --- */}
        {metricas.projetosAtrasados > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm shadow-sm animate-pulse">
            <AlertTriangle size={20} className="shrink-0 text-amber-600" />
            <div>
              <span className="font-bold">Atenção Gerencial:</span> Você possui <strong>{metricas.projetosAtrasados} projeto(s) com o prazo de entrega estourado</strong>. Entre em contato com a equipe operacional para verificar o status de entrega.
            </div>
          </div>
        )}

        {/* --- SEÇÃO 3: SEPARAÇÃO DE FATURAMENTO DUPLO (CARDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Faturamento de Projetos (Mês)
              </span>
              <p className="text-3xl font-extrabold text-blue-600">
                {metricas.faturamentoProjetosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-gray-500">Previsão e somatório de novos contratos vinculados a este mês.</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FolderKanban size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Faturamento Real / Caixa (Mês)
              </span>
              <p className="text-3xl font-extrabold text-emerald-600">
                {metricas.faturamentoRealCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-gray-500">Total acumulado líquido de parcelas marcadas como <strong>Liquidado</strong>.</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* --- SEÇÃO 4: GRÁFICO COMPARATIVO ANUAL --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Comparativo Histórico de Faturamento</h3>
            <p className="text-xs text-gray-500">Visão integrada anual: Total contratado vs. Fluxo de caixa efetivado por mês.</p>
          </div>
          
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} fontWeight="bold" />
                <YAxis tickFormatter={(val) => `R$ ${val}`} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="Contratos" fill="#2563eb" radius={[4, 4, 0, 0]} name="Faturamento Planejado" />
                <Bar dataKey="Caixa" fill="#10b981" radius={[4, 4, 0, 0]} name="Faturamento Real / Caixa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Navbar>
  );
}