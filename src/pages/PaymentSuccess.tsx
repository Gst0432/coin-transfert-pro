import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Paiement réussi",
      description: "Votre transaction a été traitée avec succès",
    });
  }, [toast]);

  const handleContinue = () => {
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Paiement réussi !
          </h1>
          <p className="text-muted-foreground">
            Votre transaction a été traitée avec succès. Vous pouvez suivre son statut dans votre portefeuille.
          </p>
        </div>

        <Button 
          onClick={handleContinue}
          className="w-full flex items-center gap-2"
        >
          Aller au portefeuille
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}