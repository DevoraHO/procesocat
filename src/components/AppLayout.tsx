import TopNavbar from './TopNavbar';
import BottomTabBar from './BottomTabBar';
import SOSButton from './SOSButton';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="pb-16 md:pb-0">{children}</main>
      {user && <BottomTabBar />}
      <SOSButton />
    </div>
  );
};

export default AppLayout;
