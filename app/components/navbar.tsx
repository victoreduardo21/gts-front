'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  DollarSign, 
  Kanban, 
  CalendarDays,
  CreditCard,
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function SistemaLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  const menuItens = [
    { nome: 'Dashboard', rota: '/dashboard', icone: <LayoutDashboard size={20} /> },
    { nome: 'Clientes', rota: '/clientes', icone: <Users size={20} /> },
    { nome: 'Projetos', rota: '/projetos', icone: <FolderKanban size={20} /> },
    { nome: 'Pipeline', rota: '/pipeline', icone: <Kanban size={20} /> },
    { nome: 'Agendamentos', rota: '/agendamentos', icone: <CalendarDays size={20} /> },
    { nome: 'Financeiro', rota: '/financeiro', icone: <DollarSign size={20} /> },
    { nome: 'Minha Conta', rota: '/configuracao', icone: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shrink-0">
        
        <div>
          {/* Topo da Sidebar - Logo */}
          <div className="p-6 flex items-center gap-2 border-b border-slate-800">
            <ShieldCheck size={26} className="text-blue-500 stroke-[2.5]" />
            <span className="font-extrabold tracking-tight text-lg">
              GTS <span className="text-blue-500">CONECT</span>
            </span>
          </div>

          {/* Itens do Menu */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menuItens.map((item, index) => {
              const isActive = pathname === item.rota;
              return (
                <Link
                  key={index}
                  href={item.rota}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icone}
                  </span>
                  <span>{item.nome}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar - Botão de Sair com Limpeza de Sessão */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>

      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col min-w-0">
        
        {/* Barra de topo interna */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Painel Interno de Controle
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              Sistema Online
            </span>
          </div>
        </header>

        {/* Renderização das Telas Filhas */}
        <div className="flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}