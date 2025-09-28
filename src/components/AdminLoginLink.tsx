import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLoginLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="bg-background/80 backdrop-blur-sm border-2 hover:bg-muted/80 shadow-lg"
      >
        <Link to="/admin-auth" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin
        </Link>
      </Button>
    </div>
  );
}