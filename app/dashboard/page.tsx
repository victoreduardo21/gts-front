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

// Definição dos tipos para segurança do TypeScript
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
  // 1. ESTADOS: Armazenam os dados vindos do Back-end
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<ItemGrafico[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  // 2. EFEITO: Dispara a busca de dados assim que entra na página
  useEffect(() => {
    async function buscarDadosDoBackend() {
      try {
        setCarregando(true);
        
        // Quando seu Back-end em Node estiver rodando, mude para a URL dele
        // Exemplo: const resposta = await fetch('http://localhost:5000/api/dashboard');
        // const dados = await resposta.json();
        
        // Inicializadores de segurança enquanto o back-end está sendo desenvolvido
        const metricasVazias: Metricas = {
          clientesTotais: 0,
          projetosRodando: 0,
          projetosEntregues: 0,
          projetosPertoPrazo: 0,
          projetosAtrasados: 0,
          faturamentoProjetosMes: 0,
          faturamentoRealCaixa: 0
        };

        const mesesVazios: ItemGrafico[] = [
          { name: 'Jan', Contratos: 0, Caixa: 0 },
          { name: 'Fev', Contratos: 0, Caixa: 0 },
          { name: 'Mar', Contratos: 0, Caixa: 0 },
          { name: 'Abr', Contratos: 0, Caixa: 0 },
          { name: 'Mai', Contratos: 0, Caixa: 0 },
          { name: 'Jun', Contratos: 0, Caixa: 0 },
          { name: 'Jul', Contratos: 0, Caixa: 0 },
          { name: 'Ago', Contratos: 0, Caixa: 0 },
          { name: 'Set', Contratos: 0, Caixa: 0 },
          { name: 'Out', Contratos: 0, Caixa: 0 },
          { name: 'Nov', Contratos: 0, Caixa: 0 },
          { name: 'Dez', Contratos: 0, Caixa: 0 },
        ];

        setMetricas(metricasVazias);
        setDadosGrafico(mesesVazios);
      } catch (erro) {
        console.error("Erro ao buscar dados do faturamento:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarDadosDoBackend();
  }, []);

  // Tela de carregamento charmosa enquanto os dados trafegam pela rede
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
      <div className="space-y-8">
        
        {/* CABEÇALHO DA TELA */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-950">Visão Geral</h2>
          <p className="text-sm text-gray-500">Acompanhe a saúde, prazos e faturamento do seu negócio ao longo do ano.</p>
        </div>

        {/* --- SEÇÃO 1: CONTADORES E MÉTRICAS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg"><Users size={20} /></div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Clientes</p>
              <p className="text-xl font-bold text-gray-900">{metricas.clientesTotais}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp size={20} /></div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Em Andamento</p>
              <p className="text-xl font-bold text-gray-900">{metricas.projetosRodando}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Entregues</p>
              <p className="text-xl font-bold text-gray-900">{metricas.projetosEntregues}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Perto do Prazo</p>
              <p className="text-xl font-bold text-gray-900">{metricas.projetosPertoPrazo}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/20 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Atrasados</p>
              <p className="text-xl font-bold text-red-600">{metricas.projetosAtrasados}</p>
            </div>
          </div>
        </div>

        {/* --- SEÇÃO 2: ALERTA OPERACIONAL --- */}
        {metricas.projetosAtrasados > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
            <AlertTriangle size={20} className="shrink-0 text-amber-600" />
            <div>
              <span className="font-semibold">Atenção Gerencial:</span> Existe <strong>{metricas.projetosAtrasados} projeto com prazo estourado</strong>. Verifique as pendências para realizar as cobranças necessárias.
            </div>
          </div>
        )}

        {/* --- SEÇÃO 3: SEPARAÇÃO DE FATURAMENTO DUPLO (CARDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Faturamento de Projetos (Mês)
              </span>
              <p className="text-3xl font-extrabold text-blue-600">
                {metricas.faturamentoProjetosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-gray-500">Soma total do valor de novos projetos fechados neste mês.</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FolderKanban size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Faturamento Normal / Caixa (Mês)
              </span>
              <p className="text-3xl font-extrabold text-emerald-600">
                {metricas.faturamentoRealCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-gray-500">Soma de todas as entradas e parcelas marcadas como **PAGO**.</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* --- SEÇÃO 4: GRÁFICO COMPARATIVO ANUAL --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Comparativo Histórico de Faturamento</h3>
            <p className="text-xs text-gray-500">Visão lado a lado: Contratos fechados vs. Valores efetivamente recebidos por mês.</p>
          </div>
          
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis tickFormatter={(val) => `R$ ${val / 1000}k`} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="Contratos" fill="#2563eb" radius={[4, 4, 0, 0]} name="Faturamento Projetos" />
                <Bar dataKey="Caixa" fill="#10b981" radius={[4, 4, 0, 0]} name="Faturamento Real / Caixa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Navbar>
  );
}