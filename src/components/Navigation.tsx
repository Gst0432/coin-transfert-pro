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
        <Badge variant="outline" className="status-success">
          {isAdmin ? 'Admin' : 'Client'}
        </Badge>
      </div>
    </nav>
  );
}