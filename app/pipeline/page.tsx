'use client';
import { useState, useEffect, FormEvent } from 'react';
import { 
  Kanban, Users, Building2, Phone, Mail, DollarSign, 
  ArrowRight, ArrowLeft, RefreshCw, ThumbsDown, Plus, X, UserPlus,
  Pencil, Trash2, Edit3
} from 'lucide-react';

import Navbar from '../components/navbar';

interface ClientePipeline {
  _id: string;
  nome: string;
  nomeEmpresa?: string;
  telefone?: string;
  email?: string;
  valorEstimadoNegocio: number;
  statusPipeline: 'Lead' | 'Negociacao' | 'Proposta' | 'Fechado' | 'Perdido';
}

export default function PipelineClientes() {
  const [clientes, setClientes] = useState<ClientePipeline[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Modal de Criação de Novo Lead
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');

  // Modal de Edição de Lead Existente
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [leadEditandoId, setLeadEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editNomeEmpresa, setEditNomeEmpresa] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editValorEstimado, setEditValorEstimado] = useState('');
  const [editStatus, setEditStatus] = useState<ClientePipeline['statusPipeline']>('Lead');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Função auxiliar para obter o cabeçalho com Token JWT
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const colunas: { id: ClientePipeline['statusPipeline']; titulo: string; corBg: string; corTexto: string }[] = [
    { id: 'Lead', titulo: 'Contato Inicial / Lead', corBg: 'bg-slate-50 border-slate-200', corTexto: 'text-slate-800' },
    { id: 'Negociacao', titulo: 'Em Negociação', corBg: 'bg-blue-50 border-blue-200', corTexto: 'text-blue-800' },
    { id: 'Proposta', titulo: 'Proposta Enviada', corBg: 'bg-amber-50 border-amber-200', corTexto: 'text-amber-800' },
    { id: 'Fechado', titulo: 'Contrato Fechado', corBg: 'bg-emerald-50 border-emerald-200', corTexto: 'text-emerald-800' },
    { id: 'Perdido', titulo: 'Contrato Perdido', corBg: 'bg-rose-50 border-rose-200', corTexto: 'text-rose-800' }
  ];

  // 1. Busca os dados do funil do Back-end com Token
  const carregarClientesPipeline = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`${apiUrl}/api/clientes/pipeline`, {
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        const dados = await res.json();
        setClientes(dados || []);
      } else if (res.status === 401 || res.status === 403) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Erro ao buscar clientes para o pipeline:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientesPipeline();
  }, []);

  // 2. Altera o estágio do cliente movendo-o entre as colunas (PATCH)
  const moverEstagioCliente = async (id: string, novoEstagio: ClientePipeline['statusPipeline']) => {
    try {
      const res = await fetch(`${apiUrl}/api/clientes/${id}/pipeline`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ statusPipeline: novoEstagio })
      });

      if (res.ok) {
        setClientes(prev => prev.map(c => c._id === id ? { ...c, statusPipeline: novoEstagio } : c));
      } else {
        const erro = await res.json();
        alert(erro.erro || 'Erro ao movimentar o card.');
      }
    } catch (err) {
      console.error('Erro ao atualizar estágio do cliente:', err);
    }
  };

  // 3. Cadastra novo lead (POST)
  const handleSalvarCliente = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/clientes/pipeline`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome,
          nomeEmpresa,
          telefone,
          email,
          valorEstimadoNegocio: Number(valorEstimado) || 0,
          statusPipeline: 'Lead'
        })
      });

      if (res.ok) {
        setModalAberto(false);
        setNome('');
        setNomeEmpresa('');
        setTelefone('');
        setEmail('');
        setValorEstimado('');
        carregarClientesPipeline();
      } else {
        const erro = await res.json();
        alert(erro.erro || 'Erro ao salvar o novo lead no pipeline.');
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
    }
  };

  // 4. Abre o modal com os dados do lead carregados para edição
  const abrirModalEditar = (item: ClientePipeline) => {
    setLeadEditandoId(item._id);
    setEditNome(item.nome);
    setEditNomeEmpresa(item.nomeEmpresa || '');
    setEditTelefone(item.telefone || '');
    setEditEmail(item.email || '');
    setEditValorEstimado(item.valorEstimadoNegocio ? item.valorEstimadoNegocio.toString() : '');
    setEditStatus(item.statusPipeline);
    setModalEdicaoAberto(true);
  };

  // 5. Envia as alterações do lead para o Back-end (PUT)
  const handleAtualizarCliente = async (e: FormEvent) => {
    e.preventDefault();
    if (!leadEditandoId) return;

    try {
      const res = await fetch(`${apiUrl}/api/clientes/pipeline/${leadEditandoId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: editNome,
          nomeEmpresa: editNomeEmpresa,
          telefone: editTelefone,
          email: editEmail,
          valorEstimadoNegocio: Number(editValorEstimado) || 0,
          statusPipeline: editStatus
        })
      });

      if (res.ok) {
        setModalEdicaoAberto(false);
        setLeadEditandoId(null);
        carregarClientesPipeline();
      } else {
        const erro = await res.json();
        alert(erro.erro || 'Erro ao atualizar dados do lead.');
      }
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
    }
  };

  // 6. Exclui um lead do funil (DELETE)
  const handleExcluirCliente = async (id: string, nomeCliente: string) => {
    if (!confirm(`Tem certeza que deseja excluir o lead "${nomeCliente}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/clientes/pipeline/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setClientes(prev => prev.filter(c => c._id !== id));
      } else {
        const erro = await res.json();
        alert(erro.erro || 'Erro ao excluir lead do pipeline.');
      }
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
    }
  };

  return (
    <Navbar>
      <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-full mx-auto space-y-8">
          
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10">
                <Kanban size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">Pipeline de Clientes</h1>
                <p className="text-xs text-gray-500">Gerencie potenciais parcerias e acompanhe o funil de prospecção da GTS Conect.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                onClick={carregarClientesPipeline}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                title="Atualizar Funil"
              >
                <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Novo Lead / Cliente</span>
              </button>
            </div>
          </div>

          {/* MODAL 1: CADASTRO DE NOVO LEAD */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-600" /> Adicionar Novo Potencial Cliente
                  </h2>
                  <button type="button" onClick={() => setModalAberto(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSalvarCliente} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome do Contato *</label>
                    <input 
                      type="text" required 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="Ex: Roberto Silva" 
                      value={nome} onChange={e => setNome(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome da Empresa (Opcional)</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="Ex: GTS Conect LTDA" 
                      value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Telefone</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        placeholder="(00) 00000-0000" 
                        value={telefone} onChange={e => setTelefone(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Negócio Estimado (R$)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        placeholder="0.00" 
                        value={valorEstimado} onChange={e => setValorEstimado(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">E-mail</label>
                    <input 
                      type="email" 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="exemplo@empresa.com" 
                      value={email} onChange={e => setEmail(e.target.value)} 
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                      Cancelar
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer">
                      Adicionar ao Funil
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: EDIÇÃO DE LEAD EXISTENTE */}
          {modalEdicaoAberto && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                    <Edit3 size={16} className="text-blue-600" /> Editar Lead / Cliente
                  </h2>
                  <button type="button" onClick={() => setModalEdicaoAberto(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAtualizarCliente} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome do Contato *</label>
                    <input 
                      type="text" required 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      value={editNome} onChange={e => setEditNome(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Nome da Empresa</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      value={editNomeEmpresa} onChange={e => setEditNomeEmpresa(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Telefone</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        value={editTelefone} onChange={e => setEditTelefone(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Negócio Estimado (R$)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                        value={editValorEstimado} onChange={e => setEditValorEstimado(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">E-mail</label>
                    <input 
                      type="email" 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      value={editEmail} onChange={e => setEditEmail(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Etapa no Funil</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as ClientePipeline['statusPipeline'])}
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Lead">Contato Inicial / Lead</option>
                      <option value="Negociacao">Em Negociação</option>
                      <option value="Proposta">Proposta Enviada</option>
                      <option value="Fechado">Contrato Fechado</option>
                      <option value="Perdido">Contrato Perdido</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setModalEdicaoAberto(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                      Cancelar
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Kanban Layout */}
          {carregando ? (
            <div className="text-center py-12 text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">
              Buscando leads e clientes no banco de dados...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
              {colunas.map((coluna) => {
                const clientesDaColuna = clientes.filter(c => c.statusPipeline === coluna.id);

                return (
                  <div key={coluna.id} className="bg-gray-100/70 border border-gray-200 rounded-2xl p-4 flex flex-col space-y-4 min-h-[550px]">
                    
                    {/* Cabeçalho da Coluna */}
                    <div className={`px-3 py-2 border rounded-xl flex items-center justify-between ${coluna.corBg}`}>
                      <span className={`text-xs font-bold uppercase tracking-wider ${coluna.corTexto}`}>
                        {coluna.titulo}
                      </span>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border shadow-sm ${coluna.corTexto}`}>
                        {clientesDaColuna.length}
                      </span>
                    </div>

                    {/* Lista de Cards da Coluna */}
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                      {clientesDaColuna.map((item) => (
                        <div 
                          key={item._id} 
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                <Users size={14} className="text-blue-600 shrink-0" />
                                {item.nome}
                              </h3>
                              {item.nomeEmpresa && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium">
                                  <Building2 size={12} /> {item.nomeEmpresa}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => abrirModalEditar(item)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Editar Lead"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleExcluirCliente(item._id, item.nome)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Lead"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {(item.telefone || item.email) && (
                            <div className="space-y-1 text-[11px] text-gray-500 border-t border-b border-gray-100 py-2">
                              {item.telefone && (
                                <p className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /> {item.telefone}</p>
                              )}
                              {item.email && (
                                <p className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400 truncate" /> <span className="truncate">{item.email}</span></p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center text-xs font-bold text-gray-900">
                              <DollarSign size={14} className="text-emerald-600" />
                              <span>{item.valorEstimadoNegocio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {coluna.id !== 'Lead' && (
                                <button
                                  onClick={() => {
                                    const indexAtual = colunas.findIndex(c => c.id === coluna.id);
                                    moverEstagioCliente(item._id, colunas[indexAtual - 1].id);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                  title="Voltar Etapa"
                                >
                                  <ArrowLeft size={14} />
                                </button>
                              )}
                              
                              {coluna.id !== 'Perdido' && (
                                <button
                                  onClick={() => {
                                    const indexAtual = colunas.findIndex(c => c.id === coluna.id);
                                    moverEstagioCliente(item._id, colunas[indexAtual + 1].id);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                  title="Avançar Etapa"
                                >
                                  <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}

                      {clientesDaColuna.length === 0 && (
                        <div className="text-center py-8 text-[11px] font-medium text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center gap-1">
                          {coluna.id === 'Perdido' ? <ThumbsDown size={14} className="text-gray-300" /> : null}
                          <span>Nenhum cliente nesta etapa</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </Navbar>
  );
}