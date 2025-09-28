import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Paiement annulé",
      description: "Votre transaction a été annulée",
      variant: "destructive"
    });
  }, [toast]);

  const handleRetry = () => {
    navigate('/trading');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Paiement annulé
          </h1>
          <p className="text-muted-foreground">
            Votre transaction a été annulée. Aucun montant n'a été débité.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </Button>
          
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
}