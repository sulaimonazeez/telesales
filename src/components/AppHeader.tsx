import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '@/services/logout';

const AppHeader = ({ agentName }: { agentName?: string }) => {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch (_) {
      // session may already be gone — still redirect
    }
    navigate('/login', { replace: true });
  }

  return (
    <header className="bg-card border-b border-border2 px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-floor">VV</span>
        </div>
        <span className="font-bold text-floor text-foreground">VitalVida Telesales</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-floor font-semibold text-foreground">
            {agentName || 'Emeka Okafor'}
          </div>
          <div className="font-mono text-floor text-accent">80% ·Target This Week</div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded hover:bg-muted 3r3x-colors"
          style={{ color: '#aaa' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;