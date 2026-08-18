'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Building2, ArrowRight, AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function Cadastro() {
  const [nome, setNome] = useState<string>('');
  const [nomeEmpresa, setNomeEmpresa] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleCadastro = async (e: FormEvent) => {
    e.preventDefault();
    setErro(''); // Limpa erros antigos
    setCarregando(true); // Ativa o estado de carregamento no botão

    try {
      // Lendo dinamicamente a URL da API através da variável de ambiente
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('Configuração do servidor não encontrada (.env.local ausente).');
      }

      const resposta = await fetch(`${apiUrl}/api/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, nomeEmpresa, email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        // Se o back-end devolveu erro (status 400 ou 500), exibe a mensagem na tela
        throw new Error(dados.erro || 'Erro ao tentar criar a conta.');
      }

      // =========================================================================
      // 🌟 SALVANDO O TOKEN DE SEGURANÇA E DADOS DO USUÁRIO
      // =========================================================================
      if (dados.token) {
        localStorage.setItem('token', dados.token); 
      }
      if (dados.usuario) {
        localStorage.setItem('@gtsconect:usuario', JSON.stringify(dados.usuario)); 
      }
      
      console.log('Cadastro efetuado com sucesso!');
      window.location.href = '/dashboard'; 

    } catch (err) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Não foi possível conectar ao servidor.');
      }
    } finally {
      setCarregando(false); // Desativa o carregamento
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      
      {/* COLUNA DA ESQUERDA: Formulário de Cadastro (Identico ao Login) */}
      <div className="flex flex-col justify-center w-full px-8 py-12 bg-white lg:w-5/12 sm:px-16 md:px-24 shadow-2xl z-10">
        <div className="w-full max-w-md mx-auto">
          
          {/* Logo / Identidade */}
          <div className="flex items-center gap-2 mb-8 text-blue-600">
            <ShieldCheck size={32} className="stroke-[2.5]" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">GTS <span className="text-blue-600">CONECT</span></span>
          </div>

          {/* Títulos */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-950">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-500 mb-8">
            Preencha os dados da sua empresa para começar.
          </p>

          {/* Banner de Erro dinâmico vindo da API */}
          {erro && (
            <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleCadastro} className="space-y-5">
            
            {/* Campo 1: Nome Completo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Seu Nome Completo
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-gray-900 placeholder-gray-400 disabled:opacity-60"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>

            {/* Campo 2: Nome da Empresa */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Nome da Empresa / Razão Social
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  required
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-gray-900 placeholder-gray-400 disabled:opacity-60"
                  placeholder="Nome da Empresa"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                />
              </div>
            </div>

            {/* Campo 3: E-mail Corporativo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                E-mail Corporativo
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-gray-900 placeholder-gray-400 disabled:opacity-60"
                  placeholder="E-mail Corporativo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo 4: Senha */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Senha de Acesso
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  disabled={carregando}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none text-gray-900 placeholder-gray-400 disabled:opacity-60"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            {/* Botão de Finalizar Cadastro Dinâmico */}
            <button
              type="submit"
              disabled={carregando}
              className="flex items-center justify-center w-full gap-2 py-3.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {carregando ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Criando Conta...</span>
                </>
              ) : (
                <>
                  <span>Finalizar Cadastro</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* 🌟 LINK PARA VOLTAR AO LOGIN (Usa o mesmo estilo do botão do login) */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 mt-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              <LogIn size={16} />
              <span>Já tem uma conta? Faça login aqui</span>
            </Link>
          </div>

        </div>
      </div>

      {/* COLUNA DA DIREITA: Idêntica ao seu Login */}
      <div className="hidden lg:flex flex-col justify-between w-7/12 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-16 relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-20 -right-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -bottom-20 -left-20"></div>
        <div></div>
        <div className="max-w-xl space-y-6 relative z-10">
          <span className="px-3 py-1 text-xs font-medium tracking-wide text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20">
            Controle Total do Seu Negócio
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
            Gerencie projetos, clientes e faturamento em um só lugar.
          </h1>
          <p className="text-lg text-slate-300 font-light leading-relaxed">
            Acompanhe o pipeline de desenvolvimento, controle parcelas atrasadas e veja o faturamento real do mês com clareza absoluta.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative z-10">
          <div>
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Interno e Seguro</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Faturamento</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Duplo Controle</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Pipeline</p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Estilo Kanban</p>
          </div>
        </div>
      </div>

    </div>
  );
}