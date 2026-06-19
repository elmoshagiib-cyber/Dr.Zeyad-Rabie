import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  CreditCard,
  Key,
  BarChart3,
  Wallet,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'students', label: 'الطلاب', icon: <Users size={20} />, path: '/students' },
  { id: 'courses', label: 'الدورات', icon: <BookOpen size={20} />, path: '/courses' },
  { id: 'lessons', label: 'الدروس', icon: <FileText size={20} />, path: '/lessons' },
  { id: 'exams', label: 'الاختبارات', icon: <GraduationCap size={20} />, path: '/exams' },
  { id: 'subscriptions', label: 'الاشتراكات', icon: <CreditCard size={20} />, path: '/subscriptions' },
  { id: 'access-codes', label: 'أكواد الوصول', icon: <Key size={20} />, path: '/access-codes' },
  { id: 'financial', label: 'التقارير المالية', icon: <BarChart3 size={20} />, path: '/financial' },
  { id: 'payments', label: 'المدفوعات', icon: <Wallet size={20} />, path: '/payments' },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell size={20} />, path: '/notifications', badge: 3 },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} />, path: '/settings' },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: 0 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        'fixed right-0 top-0 h-screen bg-white border-l border-border z-50',
        'flex flex-col transition-all duration-300'
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">EduAdmin</h1>
                <p className="text-xs text-gray-500">لوحة التحكم</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors btn-micro"
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all btn-micro',
                  currentPage === item.path
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <span className={cn('flex-shrink-0', currentPage === item.path ? 'text-primary' : 'text-gray-500')}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-right whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all btn-micro">
          <HelpCircle size={20} className="text-gray-500" />
          {!collapsed && <span className="text-right">المساعدة</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all btn-micro">
          <LogOut size={20} />
          {!collapsed && <span className="text-right">تسجيل الخروج</span>}
        </button>
      </div>
    </motion.aside>
  );
}
