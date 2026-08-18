'use client';
import { useState, useEffect, FormEvent } from 'react';
import { User, Mail, Lock, ShieldCheck, KeyRound, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/navbar';

export default function MinhaConta() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [buscandoDados, setBuscandoDados] = useState(true);
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Fallback caso a variável de ambiente não esteja configurada no Next.js
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const carregarPerfilDoUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setBuscandoDados(false);
          return;
        }

        // Tenta buscar diretamente do banco de dados (Primeira Opção)
        const res = await fetch(`${apiUrl}/api/usuario/perfil`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const dados = await res.json();
          setNome(dados.nome || '');
          setEmail(dados.email || '');
        } else {
          // SE FALHAR A ROTA: Tenta ler o plano B do localStorage (Segunda Opção)
          const usuarioSalvo = localStorage.getItem('user');
          if (usuarioSalvo) {
            const dadosLocais = JSON.parse(usuarioSalvo);
            setNome(dadosLocais.nome || dadosLocais.usuario?.nome || '');
            setEmail(dadosLocais.email || dadosLocais.usuario?.email || '');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados do perfil:', err);
        // PLANO B EM CASO DE ERRO DE CONEXÃO
        const usuarioSalvo = localStorage.getItem('user');
        if (usuarioSalvo) {
          const dadosLocais = JSON.parse(usuarioSalvo);
          setNome(dadosLocais.nome || dadosLocais.usuario?.nome || '');
          setEmail(dadosLocais.email || dadosLocais.usuario?.email || '');
        }
      } finally {
        setBuscandoDados(false);
      }
    };

    carregarPerfilDoUsuario();
  }, [apiUrl]);

  const handleAlterarSenha = async (e: FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'A nova senha e a confirmação não coincidem!' });
      return;
    }

    try {
      setCarregando(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/usuario/alterar-senha`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });

      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      } else {
        const dadosErro = await res.json();
        setMensagem({ tipo: 'erro', texto: dadosErro.erro || 'Erro ao atualizar a senha.' });
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Navbar>
      <div className="w-full min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* CABEÇALHO */}
          <div className="border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-950">Minha Conta</h1>
                <p className="text-xs text-gray-500">Gerencie as informações do seu perfil de acesso na GTS Conect.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD ESQUERDO: PERFIL COM EXIBIÇÃO TEXTUAL CORRIGIDA */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 h-fit">
              <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-extrabold text-xl border border-blue-100">
                  {nome ? nome.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-3">
                  {buscandoDados ? 'Carregando...' : nome || 'Usuário'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 uppercase border border-emerald-100">
                  Administrador
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Campo Nome Completo */}
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5"><User size={13} /> Nome Completo</span>
                  <input
                    type="text"
                    disabled
                    className="w-full font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 min-h-[38px] outline-none"
                    value={buscandoDados ? 'Carregando...' : nome}
                  />
                </div>

                {/* Campo E-mail */}
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5"><Mail size={13} /> E-mail de Acesso</span>
                  <input
                    type="text"
                    disabled
                    className="w-full font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 min-h-[38px] outline-none truncate"
                    value={buscandoDados ? 'Carregando...' : email}
                  />
                </div>
              </div>
            </div>

            {/* CARD DIREITO: FORMULÁRIO */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <KeyRound size={18} className="text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Segurança e Alteração de Senha</h2>
              </div>

              {mensagem && (
                <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <ShieldCheck size={16} />
                  <span>{mensagem.texto}</span>
                </div>
              )}

              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Lock size={12} /> Senha Atual *</label>
                  <div className="relative mt-1">
                    <input 
                      type={mostrarSenhas ? 'text' : 'password'} required 
                      className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="••••••••" 
                      value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
                    />
                    <button 
                      type="button" onClick={() => setMostrarSenhas(!mostrarSenhas)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenhas ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Lock size={12} /> Nova Senha *</label>
                    <input 
                      type={mostrarSenhas ? 'text' : 'password'} required 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="Mínimo 6 caracteres" 
                      value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Lock size={12} /> Confirmar Nova Senha *</label>
                    <input 
                      type={mostrarSenhas ? 'text' : 'password'} required 
                      className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      placeholder="Repita a nova senha" 
                      value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    type="submit" disabled={carregando}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md active:scale-95"
                  >
                    {carregando ? <RefreshCw size={16} className="animate-spin" /> : null}
                    <span>Atualizar Credenciais</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </Navbar>
  );
}