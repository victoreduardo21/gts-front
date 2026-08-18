'use client';
import { useState, useEffect, FormEvent } from 'react';
import { 
  FolderPlus, Briefcase, User, FileText, Layers, 
  DollarSign, Calendar, Clock, Plus, X, Pencil, Trash2, ShieldAlert, CheckCircle 
} from 'lucide-react';

import Navbar from '../components/navbar'; 

interface Cliente {
  _id: string;
  nome: string;
  nomeEmpresa?: string | null;
}

interface Projeto {
  _id: string;
  clienteId: string;
  clienteNome: string;
  nomeProjeto: string;
  descricao: string;
  categoria: 'Site' | 'App' | 'Sistema' | 'Assessoria' | 'Outros';
  observacao?: string;
  valorTotal: number;
  valorEntrada?: number;
  parcelas?: number;
  dataInicio: string;
  dataFim: string;
  status: 'Planejamento' | 'Em Desenvolvimento' | 'Testes' | 'Entregue' | 'Pausado';
}

export default function Projetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  const [modalAberto, setModalAberto] = useState(false);
  const [projetoSendoEditado, setProjetoSendoEditado] = useState<string | null>(null);

  // Estados do Formulário
  const [clienteId, setClienteId] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'Site' | 'App' | 'Sistema' | 'Assessoria' | 'Outros'>('Site');
  const [observacao, setObservacao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [valorEntrada, setValorEntrada] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState<'Planejamento' | 'Em Desenvolvimento' | 'Testes' | 'Entregue' | 'Pausado'>('Planejamento');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔑 Função auxiliar para recuperar os headers com Token JWT
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Busca os clientes do banco para listar no <select>
  const carregarClientes = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/clientes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const dados = await res.json();
        setClientes(dados || []);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes para o select:', err);
    }
  };

  // Busca os projetos cadastrados no banco
  const carregarProjetos = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/projetos`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const dados = await res.json();
        setProjetos(dados || []);
      }
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
    }
  };

  useEffect(() => {
    carregarClientes();
    carregarProjetos();
  }, []);

  const abrirModalCadastro = () => {
    setProjetoSendoEditado(null);
    setClienteId('');
    setNomeProjeto('');
    setDescricao('');
    setCategoria('Site');
    setObservacao('');
    setValorTotal('');
    setValorEntrada('');
    setParcelas('1');
    setDataInicio('');
    setDataFim('');
    setStatus('Planejamento');
    setErro('');
    setSucesso('');
    setModalAberto(true);
  };

  const abrirModalEdicao = (projeto: Projeto) => {
    setProjetoSendoEditado(projeto._id);
    setClienteId(projeto.clienteId);
    setNomeProjeto(projeto.nomeProjeto);
    setDescricao(projeto.descricao);
    setCategoria(projeto.categoria);
    setObservacao(projeto.observacao || '');
    setValorTotal(String(projeto.valorTotal));
    setValorEntrada(projeto.valorEntrada ? String(projeto.valorEntrada) : '');
    setParcelas(projeto.parcelas ? String(projeto.parcelas) : '1');
    setDataInicio(projeto.dataInicio ? projeto.dataInicio.split('T')[0] : '');
    setDataFim(projeto.dataFim ? projeto.dataFim.split('T')[0] : '');
    setStatus(projeto.status);
    setErro('');
    setSucesso('');
    setModalAberto(true);
  };

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!clienteId) {
      setErro('Por favor, selecione um cliente cadastrado.');
      return;
    }

    const ehEdicao = !!projetoSendoEditado;
    const urlFinal = ehEdicao ? `${apiUrl}/api/projetos/${projetoSendoEditado}` : `${apiUrl}/api/projetos`;
    const metodo = ehEdicao ? 'PUT' : 'POST';

    try {
      const res = await fetch(urlFinal, {
        method: metodo,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          clienteId,
          nomeProjeto,
          descricao,
          categoria,
          observacao: observacao || null,
          valorTotal: Number(valorTotal),
          valorEntrada: valorEntrada ? Number(valorEntrada) : null,
          parcelas: parcelas ? Number(parcelas) : null,
          dataInicio,
          dataFim,
          status
        })
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'Falha ao salvar dados do projeto.');
      }

      setSucesso(ehEdicao ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
      
      setTimeout(() => {
        setModalAberto(false);
        setSucesso('');
        setProjetoSendoEditado(null);
      }, 1200);

      carregarProjetos();
    } catch (err: any) {
      setErro(err.message || 'Erro de conexão com o servidor.');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este projeto permanentemente?')) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/projetos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const dados = await res.json();
        throw new Error(dados.erro || 'Não foi possível excluir o projeto.');
      }

      carregarProjetos();
    } catch (err: any) {
      alert(err.message || 'Erro ao tentar deletar o projeto.');
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
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">Gerenciamento de Projetos</h1>
                <p className="text-xs text-gray-500">Controle escopos, categorias, prazos e o financeiro dos projetos.</p>
              </div>
            </div>

            <button 
              onClick={abrirModalCadastro}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>Criar Novo Projeto</span>
            </button>
          </div>

          {/* CARD MODAL FLUTUANTE */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white w-full max-w-4xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden my-8">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
                    <FolderPlus size={16} className="text-blue-600" /> {projetoSendoEditado ? 'Editar Cadastro do Projeto' : 'Cadastrar Novo Projeto'}
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => setModalAberto(false)} 
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSalvar} className="p-6 space-y-6">
                  {erro && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{erro}</span>
                    </div>
                  )}
                  {sucesso && (
                    <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle size={16} className="shrink-0" />
                      <span>{sucesso}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">Escopo & Responsável</h3>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-600">Selecionar Cliente *</label>
                        <div className="relative mt-1"><User size={14} className="absolute left-3 top-3.5 text-gray-400" />
                          <select required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm appearance-none" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                            <option value="">Selecione o dono do projeto...</option>
                            {clientes.map(c => (
                              <option key={c._id} value={c._id}>{c.nome} {c.nomeEmpresa ? `(${c.nomeEmpresa})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600">Nome do Projeto *</label>
                        <div className="relative mt-1"><FileText size={14} className="absolute left-3 top-3.5 text-gray-400" />
                          <input type="text" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: App Delivery GTS" value={nomeProjeto} onChange={e => setNomeProjeto(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600">O que é o projeto (Descrição) *</label>
                        <textarea required rows={3} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Detalhes sobre as funcionalidades..." value={descricao} onChange={e => setDescricao(e.target.value)} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Categoria *</label>
                          <div className="relative mt-1"><Layers size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            <select className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm appearance-none" value={categoria} onChange={e => setCategoria(e.target.value as any)}>
                              <option value="Site">Site</option>
                              <option value="App">App</option>
                              <option value="Sistema">Sistema</option>
                              <option value="Assessoria">Assessoria</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Andamento (Status) *</label>
                          <div className="relative mt-1"><Clock size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            <select className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm appearance-none" value={status} onChange={e => setStatus(e.target.value as any)}>
                              <option value="Planejamento">Planejamento</option>
                              <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                              <option value="Testes">Testes</option>
                              <option value="Entregue">Entregue</option>
                              <option value="Pausado">Pausado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">Prazos & Valores</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Data de Início *</label>
                          <div className="relative mt-1"><Calendar size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="date" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Previsão de Entrega *</label>
                          <div className="relative mt-1"><Calendar size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="date" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600">Valor Total do Projeto *</label>
                        <div className="relative mt-1"><DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                          <input type="number" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 5000" value={valorTotal} onChange={e => setValorTotal(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Valor de Entrada</label>
                          <div className="relative mt-1"><DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="number" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 1500" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Nº Parcelas</label>
                          <input type="number" min="1" className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 3" value={parcelas} onChange={e => setParcelas(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600">Observações (OBS)</label>
                        <textarea rows={2} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Notas importantes..." value={observacao} onChange={e => setObservacao(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="button" 
                      onClick={() => setModalAberto(false)} 
                      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {projetoSendoEditado ? 'Salvar Alterações' : 'Salvar Projeto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* LISTAGEM EM CARDS */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-950">Projetos Ativos ({projetos.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projetos.map((proj) => (
                <div key={proj._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-blue-500 transition-all hover:shadow-md flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-md border border-blue-100">
                          {proj.categoria}
                        </span>
                        <h3 className="font-bold text-gray-950 text-base mt-1.5">{proj.nomeProjeto}</h3>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <User size={12} /> {proj.clienteNome}
                        </p>
                      </div>

                      {/* BOTÕES DE EDITAR E EXCLUIR */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button 
                          onClick={() => abrirModalEdicao(proj)} 
                          title="Editar Projeto" 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(proj._id)} 
                          title="Excluir Projeto" 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {proj.descricao}
                    </p>

                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Início</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">
                          {proj.dataInicio ? new Date(proj.dataInicio).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                      <div className="border-l border-gray-200">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Entrega</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">
                          {proj.dataFim ? new Date(proj.dataFim).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>

                    {proj.observacao && (
                      <div className="text-[11px] bg-slate-50 border border-slate-100 text-slate-600 p-2 rounded-lg">
                        <strong>OBS:</strong> {proj.observacao}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Valor Total</p>
                      <p className="text-sm font-extrabold text-gray-950">R$ {proj.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {proj.status}
                    </span>
                  </div>

                </div>
              ))}

              {projetos.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white border border-gray-200 rounded-2xl text-gray-400 text-xs font-medium">
                  Nenhum projeto cadastrado no momento. Clique em "Criar Novo Projeto" para começar!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Navbar>
  );
}