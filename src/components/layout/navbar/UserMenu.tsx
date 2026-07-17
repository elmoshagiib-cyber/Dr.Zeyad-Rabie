import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleHintClose = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('students')
        .update({ has_seen_user_menu_hint: true })
        .eq('auth_id', user.id);
      
      setShowHint(false);
    } catch (error) {
      console.error('Error updating hint status:', error);
      setShowHint(false);
    }
  };

  useEffect(() => {
    const checkHintStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('has_seen_user_menu_hint')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching hint status:', error);
          return;
        }

        if (data && !data.has_seen_user_menu_hint) {
          const timer = setTimeout(() => {
            setShowHint(true);
          }, 700);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error in hint check:', error);
      }
    };

    checkHintStatus();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        if (showHint) {
          setShowHint(false);
        }
      }
    };

    if (isOpen || showHint) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showHint]);

  if (!user) return null;

  const menuItems = [
    {
      icon: User,
      label: 'حسابي',
      action: () => handleNavigate('/dashboard'),
      color: 'text-gray-700 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      icon: BookOpen,
      label: 'كورساتي',
      action: () => handleNavigate('/dashboard/courses'),
      color: 'text-gray-700 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      icon: Settings,
      label: 'الإعدادات',
      action: () => handleNavigate('/profile'),
      color: 'text-gray-700 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="User menu"
      >
        <User className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 mt-3 w-[280px] z-50"
          >
            <div className="relative">
              <div className="absolute -top-2 left-5 w-4 h-4 bg-yellow-50 dark:bg-yellow-900/50 border-l border-t border-yellow-200 dark:border-yellow-700 transform rotate-45" />
              <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-2xl shadow-lg p-4">
                <h4 className="text-base font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  👋 مرحبًا بك
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 leading-relaxed">
                  يمكنك الوصول إلى حسابك،
                  <br />
                  كورساتك والإعدادات
                  <br />
                  من خلال أيقونة الحساب.
                </p>
                <button
                  onClick={handleHintClose}
                  className="w-full bg-yellow-400 dark:bg-yellow-600 hover:bg-yellow-500 dark:hover:bg-yellow-700 text-yellow-900 dark:text-yellow-50 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
                >
                  فهمت
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 mt-3 w-[300px] origin-top-left z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {user.name}
                  </h3>
                  {user.grade && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.grade}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

              <div className="py-2 px-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors duration-200 ${item.color} ${item.hoverColor} cursor-pointer`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

              <div className="py-2 px-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}