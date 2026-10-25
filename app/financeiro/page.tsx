'use client';
import { useState, useEffect, FormEvent } from 'react';
import { 
  DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet, 
  CheckCircle2, Clock, Users, Briefcase, Calendar, TrendingUp, Filter, Plus, X, FileText
} from 'lucide-react';

import Navbar from '../components/navbar'; 

interface LancamentoFinanceiro {
  _id: string;
  clienteNome: string;
  projetoNome: string;
  descricao: string; 
  valor: number;
  tipo: 'Entrada' | 'Saida';
  mesReferencia: string; 
  status: 'Liquidado' | 'Pendente';
}

interface DadosMesGrafico {
  mes: string;
  entradas: number;
  saidas: number;
}

export default function Financeiro() {
  const [anoSelecionado, setAnoSelecionado] = useState('2026');
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [modalAberto, setModalAberto] = useState(false); 
  
  const [descricaoManual, setDescricaoManual] = useState('');
  const [valorManual, setValorManual] = useState('');
  const [tipoManual, setTipoManual] = useState<'Entrada' | 'Saida'>('Entrada');
  const [dataManual, setDataManual] = useState('');
  const [statusManual, setStatusManual] = useState<'Liquidado' | 'Pendente'>('Pendente');

  const [totais, setTotais] = useState({ 
    entradas: 0, 
    saidas: 0, 
    caixa: 0,
    faturamentoAno: 0, 
    saidasAno: 0       
  });
  
  const [dadosGrafico, setDadosGrafico] = useState<DadosMesGrafico[]>([
    { mes: 'Jan', entradas: 0, saidas: 0 },
    { mes: 'Fev', entradas: 0, saidas: 0 },
    { mes: 'Mar', entradas: 0, saidas: 0 },
    { mes: 'Abr', entradas: 0, saidas: 0 },
    { mes: 'Mai', entradas: 0, saidas: 0 },
    { mes: 'Jun', entradas: 0, saidas: 0 },
    { mes: 'Jul', entradas: 0, saidas: 0 },
    { mes: 'Ago', entradas: 0, saidas: 0 },
    { mes: 'Set', entradas: 0, saidas: 0 },
    { mes: 'Out', entradas: 0, saidas: 0 },
    { mes: 'Nov', entradas: 0, saidas: 0 },
    { mes: 'Dez', entradas: 0, saidas: 0 },
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const carregarFinanceiro = async () => {
    try {
      let res = await fetch(`${apiUrl}/api/financeiro?ano=${anoSelecionado}`, { headers: getAuthHeaders() });
      if (!res.ok) res = await fetch(`${apiUrl}/financeiro?ano=${anoSelecionado}`, { headers: getAuthHeaders() });

      if (res.ok) {
        const dados = await res.json();
        setLancamentos(dados.lancamentos || []);
        setTotais({
          entradas: dados.totais?.entradas || 0,
          saidas: dados.totais?.saidas || 0,
          caixa: dados.totais?.caixa || 0,
          faturamentoAno: dados.totais?.faturamentoAno || 0,
          saidasAno: dados.totais?.saidasAno || 0
        });

        if (dados.grafico && dados.grafico.length > 0) {
          setDadosGrafico(dados.grafico);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados financeiros do banco:', err);
    }
  };

  useEffect(() => {
    carregarFinanceiro();
  }, [anoSelecionado]);

  const alternarStatusLiquidado = async (id: string) => {
    try {
      let res = await fetch(`${apiUrl}/api/financeiro/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        res = await fetch(`${apiUrl}/financeiro/${id}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders()
        });
      }

      if (res.ok) {
        carregarFinanceiro(); 
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleSalvarManual = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res = await fetch(`${apiUrl}/api/financeiro/manual`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          descricao: descricaoManual,
          valor: Number(valorManual),
          tipo: tipoManual,
          dataVencimento: dataManual,
          status: statusManual
        })
      });
      if (!res.ok) {
        res = await fetch(`${apiUrl}/financeiro/manual`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            descricao: descricaoManual,
            valor: Number(valorManual),
            tipo: tipoManual,
            dataVencimento: dataManual,
            status: statusManual
          })
        });
      }

      if (res.ok) {
        setModalAberto(false);
        setDescricaoManual('');
        setValorManual('');
        setDataManual('');
        setStatusManual('Pendente');
        carregarFinanceiro(); 
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
    }
  };

  return (
    <Navbar>
      <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-full mx-auto space-y-8">
          
          {/* CABEÇALHO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <DollarSign size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">Fluxo Financeiro</h1>
                <p className="text-xs text-gray-500">Controle faturamento, parcelas de clientes e histórico anual.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Filter size={14} /> Ano:
                </span>
                <select 
                  className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Lançamento Manual</span>
              </button>
            </div>
          </div>

          {/* MODAL LANÇAMENTO MANUAL */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" /> Novo Lançamento Manual
                  </h2>
                  <button type="button" onClick={() => setModalAberto(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSalvarManual} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Descrição / Cliente *</label>
                    <input 
                      type="text" required 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="Ex: Servidor, Licença, Cliente Avulso..." 
                      value={descricaoManual} onChange={e => setDescricaoManual(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Tipo *</label>
                      <select 
                        className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                        value={tipoManual} onChange={e => setTipoManual(e.target.value as 'Entrada' | 'Saida')}
                      >
                        <option value="Entrada">Entrada (+)</option>
                        <option value="Saida">Saída (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Valor (R$) *</label>
                      <input 
                        type="number" required step="0.01"
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        placeholder="0.00" 
                        value={valorManual} onChange={e => setValorManual(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Data *</label>
                      <input 
                        type="date" required 
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        value={dataManual} onChange={e => setDataManual(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status *</label>
                      <select 
                        className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                        value={statusManual} onChange={e => setStatusManual(e.target.value as 'Liquidado' | 'Pendente')}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Liquidado">Liquidado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                      Cancelar
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md cursor-pointer">
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendências Entrada</p>
                <p className="text-lg font-extrabold text-emerald-600">
                  R$ {totais.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpCircle size={18} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendências Saída</p>
                <p className="text-lg font-extrabold text-red-600">
                  R$ {totais.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowDownCircle size={18} /></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saldo Real em Caixa</p>
                <p className={`text-lg font-extrabold ${totais.caixa >= 0 ? 'text-gray-950' : 'text-red-600'}`}>
                  R$ {totais.caixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={18} /></div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturado no Ano</p>
                <p className="text-lg font-extrabold text-emerald-400">
                  R$ {totais.faturamentoAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-slate-800 text-emerald-400 rounded-lg"><ArrowUpCircle size={18} /></div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saídas no Ano</p>
                <p className="text-lg font-extrabold text-red-400">
                  R$ {totais.saidasAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-slate-800 text-red-400 rounded-lg"><ArrowDownCircle size={18} /></div>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <TrendingUp size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Histórico de Liquidações - Ano {anoSelecionado}</h2>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2 border-b border-gray-200 w-full min-w-[700px]">
                {dadosGrafico.map((mesData, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center relative border-r border-gray-100 last:border-0 pb-2">
                    <div className="flex gap-1.5 items-end h-32 w-full justify-center">
                      
                      <div className="flex flex-col items-center gap-1 w-7">
                        <div className="text-[9px] font-bold text-emerald-600 whitespace-nowrap">
                          {mesData.entradas > 0 ? `R$ ${mesData.entradas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : ''}
                        </div>
                        <div 
                          className="w-full bg-emerald-500 rounded-t-sm transition-all duration-500 shadow-xs"
                          style={{ height: `${Math.min((mesData.entradas / 10000) * 90, 90)}px`, minHeight: mesData.entradas > 0 ? '4px' : '0px' }}
                        />
                      </div>

                      <div className="flex flex-col items-center gap-1 w-7">
                        <div className="text-[9px] font-bold text-red-600 whitespace-nowrap">
                          {mesData.saidas > 0 ? `R$ ${mesData.saidas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : ''}
                        </div>
                        <div 
                          className="w-full bg-red-500 rounded-t-sm transition-all duration-500 shadow-xs"
                          style={{ height: `${Math.min((mesData.saidas / 10000) * 90, 90)}px`, minHeight: mesData.saidas > 0 ? '4px' : '0px' }}
                        />
                      </div>

                    </div>
                    <span className="text-[11px] font-bold text-gray-400 mt-2 block text-center">
                      {mesData.mes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABELA */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">Lançamentos do Ano {anoSelecionado}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] font-bold uppercase text-gray-400 bg-gray-50/50">
                    <th className="px-6 py-3">Cliente / Descrição</th>
                    <th className="px-6 py-3">Referência</th>
                    <th className="px-6 py-3">Mês Vencimento</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3 text-center">Ações / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {lancamentos.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                            <Users size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.clienteNome}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Briefcase size={12} /> {item.projetoNome}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-600">
                        {item.descricao}
                      </td>

                      <td className="px-6 py-4 text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{item.mesReferencia}</span>
                        </div>
                      </td>

                      <td className={`px-6 py-4 font-bold ${item.tipo === 'Saida' ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.tipo === 'Saida' ? '- ' : ''}R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          item.tipo === 'Entrada' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => alternarStatusLiquidado(item._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border cursor-pointer ${
                            item.status === 'Liquidado'
                              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {item.status === 'Liquidado' ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Liquidado</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {lancamentos.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs font-medium bg-white">
                Nenhum registro encontrado para o ano de {anoSelecionado}.
              </div>
            )}
          </div>

        </div>
      </div>
    </Navbar>
  );
}