'use client';
import { useState, useEffect, FormEvent } from 'react';
import { 
  CreditCard, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Building2, Calendar, DollarSign, X, FolderKanban, Tag, FileText
} from 'lucide-react';
import SistemaLayout from '../components/navbar';

interface Projeto {
  _id: string;
  nome?: string;
  titulo?: string;
  clienteNome?: string;
  cliente?: string;
}

interface Mensalidade {
  _id: string;
  projetoNome: string;
  clienteNome: string;
  valor: number;
  diaVencimento: number;
  mesReferencia: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  observacao?: string;
}

export default function MensalidadesPage() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState('');
  const [projetoNome, setProjetoNome] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [valor, setValor] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('10');
  const [mesReferencia, setMesReferencia] = useState('');
  const [observacao, setObservacao] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  });

  const carregarDados = async () => {
    setCarregando(true);
    try {
      let resM = await fetch(`${apiUrl}/api/mensalidades`, { headers: getHeaders() });
      if (!resM.ok) resM = await fetch(`${apiUrl}/mensalidades`, { headers: getHeaders() });
      if (resM.ok) setMensalidades(await resM.json());

      let resP = await fetch(`${apiUrl}/api/projetos`, { headers: getHeaders() });
      if (!resP.ok) resP = await fetch(`${apiUrl}/projetos`, { headers: getHeaders() });
      if (resP.ok) {
        const dadosP = await resP.json();
        setProjetos(Array.isArray(dadosP) ? dadosP : []);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    setMesReferencia(`${mes}/${hoje.getFullYear()}`);
  }, []);

  const handleSelecionarProjeto = (id: string) => {
    setProjetoSelecionadoId(id);
    const p = projetos.find(item => item._id === id);
    if (p) {
      setProjetoNome(p.nome || p.titulo || 'Projeto Sem Nome');
      setClienteNome(p.clienteNome || p.cliente || 'Não informado');
    }
  };

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        projetoId: projetoSelecionadoId,
        projetoNome,
        clienteNome,
        valor: parseFloat(valor),
        diaVencimento: parseInt(diaVencimento),
        mesReferencia,
        observacao
      };

      let res = await fetch(`${apiUrl}/api/mensalidades`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        res = await fetch(`${apiUrl}/mensalidades`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setModalAberto(false);
        setProjetoSelecionadoId('');
        setProjetoNome('');
        setClienteNome('');
        setValor('');
        setObservacao('');
        carregarDados();
      } else {
        alert('Erro ao salvar mensalidade.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleStatus = async (id: string, novoStatus: 'Pendente' | 'Pago' | 'Atrasado') => {
    try {
      let res = await fetch(`${apiUrl}/api/mensalidades/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: novoStatus })
      });
      if (!res.ok) {
        res = await fetch(`${apiUrl}/mensalidades/${id}/status`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status: novoStatus })
        });
      }
      if (res.ok) {
        setMensalidades(prev => prev.map(m => m._id === id ? { ...m, status: novoStatus } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja remover esta mensalidade?')) return;
    try {
      let res = await fetch(`${apiUrl}/api/mensalidades/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) res = await fetch(`${apiUrl}/mensalidades/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) setMensalidades(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SistemaLayout>
      <div className="w-full min-h-[calc(100vh-56px)] bg-slate-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-5">
          
          {/* CABEÇALHO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-2xs">
                <CreditCard size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Mensalidades de Projetos</h1>
                <p className="text-xs text-gray-500">Controle a cobrança recorrente dos seus projetos e clientes.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span>Nova Mensalidade</span>
            </button>
          </div>

          {/* MODAL COMPACTO E REDUZIDO (max-w-md / 448px de largura máxima) */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                
                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                    <Plus size={16} className="text-blue-600" />
                    <span>Cadastrar Mensalidade</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setModalAberto(false)} 
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSalvar} className="p-5 space-y-3">
                  
                  {/* Seleção do Projeto */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Selecione o Projeto *</label>
                    <div className="relative mt-1">
                      <FolderKanban size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        required
                        className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={projetoSelecionadoId}
                        onChange={e => handleSelecionarProjeto(e.target.value)}
                      >
                        <option value="">Selecione um projeto...</option>
                        {projetos.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.nome || p.titulo} {p.clienteNome || p.cliente ? `(${p.clienteNome || p.cliente})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cliente e Valor */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Cliente Puxado</label>
                      <div className="relative mt-1">
                        <Building2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          disabled
                          className="w-full pl-9 pr-2 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 cursor-not-allowed truncate"
                          value={clienteNome}
                          placeholder="Cliente"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Valor (R$) *</label>
                      <div className="relative mt-1">
                        <DollarSign size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 500.00"
                          value={valor}
                          onChange={e => setValor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dia Vencimento e Mês Referência */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Dia Vencimento *</label>
                      <div className="relative mt-1">
                        <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          max="31"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 10"
                          value={diaVencimento}
                          onChange={e => setDiaVencimento(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700">Mês Referência *</label>
                      <div className="relative mt-1">
                        <Tag size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 10/2026"
                          value={mesReferencia}
                          onChange={e => setMesReferencia(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observação */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Observação</label>
                    <div className="relative mt-1">
                      <FileText size={14} className="pointer-events-none absolute left-3 top-2.5 text-gray-400" />
                      <textarea
                        rows={2}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Ex: Manutenção mensal do sistema..."
                        value={observacao}
                        onChange={e => setObservacao(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rodapé com Botões */}
                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalAberto(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      Salvar Mensalidade
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* LISTAGEM DAS MENSALIDADES */}
          {carregando ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 text-xs text-gray-400">
              Carregando mensalidades...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mensalidades.map(m => (
                <div key={m._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {m.mesReferencia}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExcluir(m._id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-xs">{m.projetoNome}</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} className="text-gray-400" /> {m.clienteNome}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <DollarSign size={13} /> R$ {m.valor.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar size={12} /> Vence dia {m.diaVencimento}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      m.status === 'Pago' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      m.status === 'Atrasado' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {m.status}
                    </span>

                    <div className="flex items-center gap-1">
                      {m.status !== 'Pago' && (
                        <button
                          type="button"
                          onClick={() => handleStatus(m._id, 'Pago')}
                          title="Marcar como Pago"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      {m.status !== 'Atrasado' && (
                        <button
                          type="button"
                          onClick={() => handleStatus(m._id, 'Atrasado')}
                          title="Marcar como Atrasado"
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <AlertTriangle size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {mensalidades.length === 0 && (
                <div className="col-span-full text-center py-10 bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                  Nenhuma mensalidade cadastrada.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </SistemaLayout>
  );
}