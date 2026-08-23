'use client';
import { useState, useEffect, FormEvent } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, Video, Plus, X, 
  CheckCircle2, AlertCircle, Trash2, Filter, ExternalLink, CalendarDays,
  FileText, Tag
} from 'lucide-react';

import Navbar from '../components/navbar';

interface Agendamento {
  _id: string;
  titulo: string;
  contatoNome?: string;
  descricao?: string;
  tipo: 'Reunião' | 'Entrega' | 'Alinhamento' | 'Suporte' | 'Outro';
  data: string;
  horario: string;
  linkReuniao?: string;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Estados do Formulário
  const [titulo, setTitulo] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'Reunião' | 'Entrega' | 'Alinhamento' | 'Suporte' | 'Outro'>('Reunião');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [linkReuniao, setLinkReuniao] = useState('');

  // 🌐 Endereço do Back-end com fallback direto
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 🔒 Recupera cabeçalhos com token do usuário
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // 1. Carregar Agendamentos da API
  const carregarAgendamentos = async () => {
    setCarregando(true);
    try {
      // Tenta a rota /api/agendamentos e, se não responder, tenta /agendamentos
      let res = await fetch(`${apiUrl}/api/agendamentos`, { headers: getAuthHeaders() });
      
      if (!res.ok && res.status === 404) {
        res = await fetch(`${apiUrl}/agendamentos`, { headers: getAuthHeaders() });
      }

      if (res.ok) {
        const dados = await res.json();
        setAgendamentos(Array.isArray(dados) ? dados : []);
      } else {
        setAgendamentos([]);
      }
    } catch (err) {
      console.warn('Servidor offline ou rota indisponível no momento.');
      setAgendamentos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  // 2. Salvar Novo Agendamento
  const handleSalvarAgendamento = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        titulo,
        contatoNome,
        descricao,
        tipo,
        data,
        horario,
        linkReuniao
      };

      let res = await fetch(`${apiUrl}/api/agendamentos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok && res.status === 404) {
        res = await fetch(`${apiUrl}/agendamentos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setModalAberto(false);
        setTitulo('');
        setContatoNome('');
        setDescricao('');
        setTipo('Reunião');
        setData('');
        setHorario('');
        setLinkReuniao('');
        carregarAgendamentos();
      } else {
        const erro = await res.json().catch(() => ({}));
        alert(erro.erro || 'Não foi possível salvar o agendamento no servidor.');
      }
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert('Erro de conexão com o servidor Back-end.');
    }
  };

  // 3. Alterar Status (Pendente / Concluído / Cancelado)
  const handleAlterarStatus = async (id: string, novoStatus: 'Pendente' | 'Concluído' | 'Cancelado') => {
    try {
      let res = await fetch(`${apiUrl}/api/agendamentos/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: novoStatus })
      });

      if (!res.ok && res.status === 404) {
        res = await fetch(`${apiUrl}/agendamentos/${id}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: novoStatus })
        });
      }

      if (res.ok) {
        setAgendamentos(prev => prev.map(a => a._id === id ? { ...a, status: novoStatus } : a));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // 4. Excluir Agendamento
  const handleExcluirAgendamento = async (id: string, tituloItem: string) => {
    if (!confirm(`Deseja realmente remover o compromisso "${tituloItem}"?`)) return;

    try {
      let res = await fetch(`${apiUrl}/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok && res.status === 404) {
        res = await fetch(`${apiUrl}/agendamentos/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      }

      if (res.ok) {
        setAgendamentos(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
    }
  };

  // Filtro de Status
  const agendamentosFiltrados = agendamentos.filter(item => {
    if (filtroStatus === 'TODOS') return true;
    return item.status === filtroStatus;
  });

  return (
    <Navbar>
      <div className="w-full min-h-[calc(100vh-56px)] bg-slate-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-5">
          
          {/* CABEÇALHO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-2xs">
                <CalendarDays size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Cronograma de Reuniões</h1>
                <p className="text-xs text-gray-500">Acompanhe e organize seus compromissos.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <Filter size={13} className="text-gray-400" />
                <select 
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Concluído">Concluídos</option>
                  <option value="Cancelado">Cancelados</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Novo Agendamento</span>
              </button>
            </div>
          </div>

          {/* MODAL HARMONIOSO E PROPORCIONAL */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-100">
                
                {/* Topo do Modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <CalendarDays size={18} className="text-blue-600" />
                    <span>Cadastrar Novo Compromisso</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setModalAberto(false)} 
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSalvarAgendamento} className="p-6 space-y-4">
                  
                  {/* Linha 1: Contato e Título */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Contato / Lead</label>
                      <div className="relative mt-1">
                        <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          className="w-full pl-10 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium" 
                          placeholder="Ex: Roberto Silva" 
                          value={contatoNome} 
                          onChange={e => setContatoNome(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">Título da Reunião *</label>
                      <div className="relative mt-1">
                        <FileText size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          className="w-full pl-10 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium" 
                          placeholder="Ex: Alinhamento de Escopo" 
                          value={titulo} 
                          onChange={e => setTitulo(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha 2: Tipo, Data e Horário */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Tipo *</label>
                      <div className="relative mt-1">
                        <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                          className="w-full pl-10 pr-2 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium cursor-pointer"
                          value={tipo} 
                          onChange={e => setTipo(e.target.value as any)}
                        >
                          <option value="Reunião">Reunião</option>
                          <option value="Entrega">Entrega</option>
                          <option value="Alinhamento">Alinhamento</option>
                          <option value="Suporte">Suporte</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">Data *</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full mt-1 px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium" 
                        value={data} 
                        onChange={e => setData(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">Horário *</label>
                      <input 
                        type="time" 
                        required 
                        className="w-full mt-1 px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium" 
                        value={horario} 
                        onChange={e => setHorario(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Linha 3: Link Virtual */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Link da Sala Virtual (Opcional)</label>
                    <div className="relative mt-1">
                      <Video size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="url" 
                        className="w-full pl-10 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium" 
                        placeholder="https://meet.google.com/..." 
                        value={linkReuniao} 
                        onChange={e => setLinkReuniao(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Linha 4: Descrição */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Pauta / Observações</label>
                    <textarea 
                      rows={3} 
                      className="w-full mt-1 p-3 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium resize-none leading-relaxed" 
                      placeholder="Pontos importantes a alinhar..." 
                      value={descricao} 
                      onChange={e => setDescricao(e.target.value)} 
                    />
                  </div>

                  {/* Rodapé com Botões */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <button 
                      type="button" 
                      onClick={() => setModalAberto(false)} 
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                    >
                      Salvar Agendamento
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* LISTAGEM DOS AGENDAMENTOS */}
          {carregando ? (
            <div className="text-center py-12 text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">
              Carregando agendamentos...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agendamentosFiltrados.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        item.tipo === 'Reunião' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        item.tipo === 'Entrega' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        item.tipo === 'Alinhamento' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {item.tipo}
                      </span>

                      <button 
                        type="button"
                        onClick={() => handleExcluirAgendamento(item._id, item.titulo)}
                        title="Excluir"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-xs leading-snug">{item.titulo}</h3>
                      {item.contatoNome && (
                        <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                          <User size={12} className="text-blue-600" /> {item.contatoNome}
                        </p>
                      )}
                    </div>

                    {item.descricao && (
                      <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 line-clamp-2">
                        {item.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <CalendarIcon size={12} className="text-gray-400" />
                        {new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-blue-600">
                        <Clock size={12} />
                        {item.horario}
                      </span>
                    </div>

                    {item.linkReuniao && (
                      <a 
                        href={item.linkReuniao} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-0.5"
                      >
                        <Video size={12} />
                        <span>Abrir Sala Virtual</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      item.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'Cancelado' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>

                    <div className="flex items-center gap-1">
                      {item.status !== 'Concluído' && (
                        <button
                          type="button"
                          onClick={() => handleAlterarStatus(item._id, 'Concluído')}
                          title="Marcar como Concluído"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      {item.status !== 'Cancelado' && (
                        <button
                          type="button"
                          onClick={() => handleAlterarStatus(item._id, 'Cancelado')}
                          title="Marcar como Cancelado"
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <AlertCircle size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}

              {agendamentosFiltrados.length === 0 && (
                <div className="col-span-full text-center py-10 bg-white border border-gray-200 rounded-2xl text-gray-400 text-xs font-medium">
                  Nenhum compromisso encontrado para este filtro.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Navbar>
  );
}