import TopNavbar from './TopNavbar';
import BottomTabBar from './BottomTabBar';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="pt-0 md:pt-14 pb-16 md:pb-0">{children}</main>
      {user && <BottomTabBar />}
    </div>
  );
};

export default AppLayout;
