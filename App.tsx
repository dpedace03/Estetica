/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  UsersRound, 
  BarChart3, 
  Bell, 
  Search, 
  LogOut,
  RotateCcw,
  Plus,
  Scissors,
  Sparkles
} from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Button, Card, Input } from './components/ui/Base';
import { motion, AnimatePresence } from 'motion/react';
import { Inventory } from './components/modules/Inventory';
import { Appointments } from './components/modules/Appointments';
import { Sales } from './components/modules/Sales';
import { Clients } from './components/modules/Clients';
import { Employees } from './components/modules/Employees';
import { Expenses } from './components/modules/Expenses';
import { Reports } from './components/modules/Reports';
import { Returns } from './components/modules/Returns';
import { Notifications } from './components/modules/Notifications';
import { Treatments } from './components/modules/Treatments';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { formatCurrency, cn } from './lib/utils';

// Modules (simplified placeholders for now, will expand)
const Dashboard = () => {
  const [stats, setStats] = useState({ sales: 0, appointments: 0, clients: 0, stock: 0 });

  useEffect(() => {
    const unsubSales = onSnapshot(collection(db, 'sales'), (snap) => {
      const today = new Date().toDateString();
      const todaySales = snap.docs
        .filter(d => (d.data() as any).createdAt?.toDate().toDateString() === today)
        .reduce((acc, d) => acc + (d.data() as any).total, 0);
      setStats(prev => ({ ...prev, sales: todaySales }));
    });

    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      const today = new Date().toDateString();
      const todayAppts = snap.docs.filter(d => (d.data() as any).date === new Date().toISOString().split('T')[0]).length;
      setStats(prev => ({ ...prev, appointments: todayAppts }));
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setStats(prev => ({ ...prev, clients: snap.size }));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const lowStock = snap.docs.filter(d => (d.data() as any).stock < 5).length;
      setStats(prev => ({ ...prev, stock: lowStock }));
    });

    return () => { unsubSales(); unsubAppts(); unsubClients(); unsubProducts(); };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-light">Resumen del Día</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Ventas Hoy</span>
          <span className="text-2xl font-mono">{formatCurrency(stats.sales)}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Citas Hoy</span>
          <span className="text-2xl font-mono">{stats.appointments}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Total Clientes</span>
          <span className="text-2xl font-mono">{stats.clients}</span>
        </Card>
        <Card className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Alertas Stock</span>
          <span className={cn("text-2xl font-mono", stats.stock > 0 ? "text-red-500" : "text-gray-400")}>
            {stats.stock}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-8 flex flex-col items-center justify-center text-center">
            <Sparkles size={48} strokeWidth={1} className="text-gray-200 mb-4" />
            <h3 className="font-serif italic text-xl">Bienvenue a Aesthetix Pro</h3>
            <p className="text-sm text-gray-400 max-w-xs mt-2">Usa el menú lateral para gestionar citas, inventario y ventas de tu centro de estética con total precisión.</p>
        </Card>
        <div className="space-y-4">
           <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Acciones Directas</h4>
           <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex flex-col gap-2"><Calendar size={20}/> Agenda</Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2"><ShoppingCart size={20}/> Nueva Venta</Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2"><Users size={20}/> Nuevo Cliente</Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2"><RotateCcw size={20}/> Devolución</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

type Module = 'dashboard' | 'appointments' | 'inventory' | 'sales' | 'clients' | 'expenses' | 'employees' | 'reports' | 'returns' | 'notifications' | 'treatments';

function MainApp() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const menuItems = [
    { id: 'dashboard' as Module, label: 'Inicio', icon: LayoutDashboard },
    { id: 'appointments' as Module, label: 'Citas', icon: Calendar },
    { id: 'treatments' as Module, label: 'Servicios', icon: Scissors },
    { id: 'inventory' as Module, label: 'Inventario', icon: Package },
    { id: 'sales' as Module, label: 'Caja', icon: ShoppingCart },
    { id: 'clients' as Module, label: 'Clientes', icon: Users },
    { id: 'expenses' as Module, label: 'Gastos', icon: DollarSign },
    { id: 'employees' as Module, label: 'Empleados', icon: UsersRound },
    { id: 'reports' as Module, label: 'Reportes', icon: BarChart3 },
    { id: 'returns' as Module, label: 'Devoluciones', icon: RotateCcw },
    { id: 'notifications' as Module, label: 'Notificaciones', icon: Bell },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'appointments': return <Appointments />;
      case 'sales': return <Sales />;
      case 'clients': return <Clients />;
      case 'employees': return <Employees />;
      case 'expenses': return <Expenses />;
      case 'reports': return <Reports />;
      case 'returns': return <Returns />;
      case 'notifications': return <Notifications />;
      case 'treatments': return <Treatments />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] flex text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e5e5e5] flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif font-light tracking-tighter italic">Aesthetix Pro</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">Management Suite</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all group",
                activeModule === item.id 
                  ? "bg-[#1a1a1a] text-white" 
                  : "hover:bg-[#f5f2ed] text-gray-600"
              )}
            >
              <item.icon size={18} className={cn(activeModule === item.id ? "text-white" : "text-gray-400 group-hover:text-[#1a1a1a]")} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e5e5e5] space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold ring-1 ring-white">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.displayName}</p>
              <p className="text-[10px] text-gray-400 truncate tracking-tight">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-red-500 hover:bg-red-50" onClick={logout}>
            <LogOut size={14} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-sm border border-[#e5e5e5] w-96">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscador avanzado (productos, clientes, citas)..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Nueva Cita
            </Button>
            <Button size="sm" className="gap-2 bg-[#1a1a1a]">
              <ShoppingCart size={16} />
              Venta Rápida
            </Button>
          </div>
        </header>

        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderModule()}
        </motion.div>
      </main>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-10 space-y-8 flex flex-col items-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-light italic tracking-tighter">Aesthetix Pro</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-2">Acceso Administrativo</p>
        </div>
        <div className="w-full space-y-4">
          <Button className="w-full gap-3 py-6" onClick={login}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar con Google
          </Button>
          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest px-8">
            Uso exclusivo para personal autorizado y administración del centro.
          </p>
        </div>
      </Card>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return user ? <MainApp /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

