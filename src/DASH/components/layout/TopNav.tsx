import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import type { User as UserType } from '../../types';

interface TopNavProps {
  currentUser: UserType;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
  isDarkMode: boolean;
  language: 'ar' | 'en';
}

export function TopNav({ currentUser, onThemeToggle, onLanguageToggle, isDarkMode, language }: TopNavProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const notifications = [
    { id: '1', title: 'طالب جديد', message: 'تم تسجيل أحمد سالم', time: 'منذ 5 دقائق', unread: true },
    { id: '2', title: 'دفع جديد', message: 'تم استلام دفعة بقيمة 299 ريال', time: 'منذ ساعة', unread: true },
    { id: '3', title: 'اختبار مكتمل', message: 'أكمل 15 طالب اختبار الرياضيات', time: 'منذ ساعتين', unread: true },
    { id: '4', title: 'تذكير', message: 'موعد انتهاء اشتراك 5 طلاب', time: 'منذ 3 ساعات', unread: false },
  ];

  const quickActions = [
    { id: '1', label: 'إضافة طالب جديد', icon: <User size={18} />, action: () => console.log('Add student') },
    { id: '2', label: 'إنشاء دورة', icon: <BookOpen size={18} />, action: () => console.log('Create course') },
    { id: '3', label: 'إرسال إشعار', icon: <Bell size={18} />, action: () => console.log('Send notification') },
    { id: '4', label: 'توليد أكواد', icon: <Key size={18} />, action: () => console.log('Generate codes') },
  ];

  return (
    <header className="h-20 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div
          className={cn(
            'relative flex items-center w-full transition-all duration-300',
            searchFocused ? 'scale-105' : 'scale-100'
          )}
        >
          <Search
            size={20}
            className={cn(
              'absolute right-3 transition-colors',
              searchFocused ? 'text-primary' : 'text-gray-400'
            )}
          />
          <input
            type="text"
            placeholder="بحث عن طالب، دورة، اختبار..."
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors btn-micro flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline text-sm font-medium">إجراء سريع</span>
          </button>

          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50"
              >
                <div className="p-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        setShowQuickActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-right"
                    >
                      <span className="text-primary">{action.icon}</span>
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors btn-micro relative"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                  <span className="text-xs text-primary cursor-pointer hover:underline">تحديد الكل كمقروء</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer',
                        notification.unread && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          notification.unread ? 'bg-primary' : 'bg-gray-300'
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-border">
                  <button className="text-sm text-primary hover:underline">عرض كل الإشعارات</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors btn-micro"
          aria-label={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDarkMode ? <Sun size={20} className="text-gray-600" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={onLanguageToggle}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors btn-micro flex items-center gap-2"
        >
          <Globe size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-600">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors btn-micro"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border">
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-right">
                    <Settings size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-700">الإعدادات</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-danger/10 transition-colors text-right text-danger">
                    <LogOut size={18} />
                    <span className="text-sm">تسجيل الخروج</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// Import BookOpen and Key from lucide-react
import { BookOpen, Key } from 'lucide-react';
