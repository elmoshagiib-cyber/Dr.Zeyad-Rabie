import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Courses } from './pages/Courses';
import { Lessons } from './pages/Lessons';
import { Exams } from './pages/Exams';
import { Subscriptions } from './pages/Subscriptions';
import { AccessCodes } from './pages/AccessCodes';
import { Financial } from './pages/Financial';
import { Payments } from './pages/Payments';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

type Page = 'dashboard' | 'students' | 'courses' | 'lessons' | 'exams' | 'subscriptions' | 'access-codes' | 'financial' | 'payments' | 'notifications' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleNavigate = (path: string) => {
    const pageMap: Record<string, Page> = {
      '/': 'dashboard',
      '/students': 'students',
      '/courses': 'courses',
      '/lessons': 'lessons',
      '/exams': 'exams',
      '/subscriptions': 'subscriptions',
      '/access-codes': 'access-codes',
      '/financial': 'financial',
      '/payments': 'payments',
      '/notifications': 'notifications',
      '/settings': 'settings',
    };
    setCurrentPage(pageMap[path] || 'dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'courses':
        return <Courses />;
      case 'lessons':
        return <Lessons />;
      case 'exams':
        return <Exams />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'access-codes':
        return <AccessCodes />;
      case 'financial':
        return <Financial />;
      case 'payments':
        return <Payments />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout currentPage={`/${currentPage === 'dashboard' ? '' : currentPage}`} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
