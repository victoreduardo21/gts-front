'use client';
import { useState, useEffect, FormEvent } from 'react';
import { User, Building2, Phone, Mail, FileText, Plus, Users, ShieldAlert, CheckCircle, X, Pencil, Trash2 } from 'lucide-react';

// Importando a barra lateral que controla o abrir e fechar
import Navbar from '../components/navbar'; 

interface Cliente {
  _id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  nomeEmpresa?: string | null;
  cnpj?: string | null;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSendoEditado, setClienteSendoEditado] = useState<string | null>(null);

  // Estados do Formulario
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const carregarClientes = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/clientes`);
      if (res.ok) {
        const dados = await res.json();
        setClientes(dados);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const abrirModalEdicao = (cliente: Cliente) => {
    setClienteSendoEditado(cliente._id);
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setEmail(cliente.email);
    setCpf(cliente.cpf);
    setNomeEmpresa(cliente.nomeEmpresa || '');
    setCnpj(cliente.cnpj || '');
    setModalAberto(true);
  };

  const abrirModalCadastro = () => {
    setClienteSendoEditado(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setCpf('');
    setNomeEmpresa('');
    setCnpj('');
    setModalAberto(true);
  };

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const ehEdicao = !!clienteSendoEditado;
    const urlFinal = ehEdicao ? `${apiUrl}/api/clientes/${clienteSendoEditado}` : `${apiUrl}/api/clientes`;
    const metodo = ehEdicao ? 'PUT' : 'POST';

    try {
      const res = await fetch(urlFinal, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          email,
          cpf,
          nomeEmpresa: nomeEmpresa || null,
          cnpj: cnpj || null
        })
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'Falha ao salvar dados do cliente.');
      }

      setSucesso(ehEdicao ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      
      setNome('');
      setTelefone('');
      setEmail('');
      setCpf('');
      setNomeEmpresa('');
      setCnpj('');
      
      setTimeout(() => {
        setModalAberto(false);
        setSucesso('');
        setClienteSendoEditado(null);
      }, 1200);

      carregarClientes();
    } catch (err: any) {
      setErro(err.message || 'Erro de conexao com o servidor.');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza absoluta que deseja remover este cliente do sistema?')) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/clientes/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const dados = await res.json();
        throw new Error(dados.erro || 'Nao foi possivel excluir o cliente.');
      }

      carregarClientes();
    } catch (err: any) {
      alert(err.message || 'Erro ao tentar deletar o cliente.');
    }
  };

  return (
    // 🛠️ INSTRUÇÃO APLICADA: Todo o conteudo do gerenciamento agora vai DENTRO do componente Navbar
    <Navbar>
      <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-full mx-auto space-y-8">
          
          {/* Cabecalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">Gerenciamento de Clientes</h1>
                <p className="text-xs text-gray-500">Cadastre e gerencie a carteira de clientes da GTS Conect.</p>
              </div>
            </div>

            <button 
              onClick={abrirModalCadastro}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              <Plus size={18} />
              <span>Criar Novo Cliente</span>
            </button>
          </div>

          {/* CARD MODAL FLUTUANTE (Cadastro / Edicao) */}
          {modalAberto && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
                    <Plus size={16} className="text-blue-600" /> {clienteSendoEditado ? 'Editar Cadastro do Cliente' : 'Cadastrar Novo Cliente'}
                  </h2>
                  <button 
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">Dados do Responsável</h3>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Nome Completo *</label>
                        <div className="relative mt-1"><User size={14} className="absolute left-3 top-3.5 text-gray-400" />
                          <input type="text" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Telefone *</label>
                          <div className="relative mt-1"><Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">CPF *</label>
                          <div className="relative mt-1"><FileText size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">E-mail de Contato *</label>
                        <div className="relative mt-1"><Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                          <input type="email" required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="joao@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">Dados da Empresa (Opcionais)</h3>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Razão Social / Nome Fantasia</label>
                        <div className="relative mt-1"><Building2 size={14} className="absolute left-3 top-3 text-gray-400" />
                          <input type="text" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: GTS Conect LTDA" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">CNPJ</label>
                        <div className="relative mt-1"><FileText size={14} className="absolute left-3 top-3 text-gray-400" />
                          <input type="text" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10">
                      {clienteSendoEditado ? 'Salvar Alteraçoes' : 'Salvar Cliente'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Listagem de Clientes em Cards */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-950">Clientes Cadastrados ({clientes.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clientes.map((cliente) => (
                <div key={cliente._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-blue-500 transition-all hover:shadow-md flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-950 text-sm">{cliente.nome}</h3>
                        <span className="text-[11px] text-gray-400 font-medium">CPF: {cliente.cpf}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => abrirModalEdicao(cliente)}
                          title="Editar cliente"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(cliente._id)}
                          title="Excluir cliente"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 border-t border-b border-gray-100 py-3">
                      <div className="flex items-center gap-2"><Mail size={12} className="text-gray-400" /> {cliente.email}</div>
                      <div className="flex items-center gap-2"><Phone size={12} className="text-gray-400" /> {cliente.telefone}</div>
                    </div>
                  </div>

                  <div className="pt-3">
                    {cliente.nomeEmpresa ? (
                      <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-xs font-bold text-purple-950 flex items-center gap-1">
                          <Building2 size={12} /> {cliente.nomeEmpresa}
                        </p>
                        {cliente.cnpj && <p className="text-[10px] text-purple-600 mt-0.5">CNPJ: {cliente.cnpj}</p>}
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full">
                        Pessoa Física / Sem Empresa
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {clientes.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white border border-gray-200 rounded-2xl text-gray-400 text-xs font-medium">
                  Nenhum cliente cadastrado até o momento. Clique em "Criar Novo Cliente" para começar!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Navbar>
  );
}