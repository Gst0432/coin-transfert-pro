import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Settings, Home } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 glass-effect rounded-xl p-2">
        {isAdmin ? (
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow">
              <Home className="w-4 h-4 mr-2" />
              Interface Client
            </Button>
          </Link>
        ) : (
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow">
              <Settings className="w-4 h-4 mr-2" />
              Administration
            </Button>
          </Link>
        )}
        <Badge variant="outline" className="status-success">
          {isAdmin ? 'Admin' : 'Client'}
        </Badge>
      </div>
    </nav>
  );
}