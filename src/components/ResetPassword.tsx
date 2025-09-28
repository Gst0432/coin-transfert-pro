import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate reset URL
      const resetUrl = `${window.location.origin}/reset-password`;

      // Send email via our edge function
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          resetUrl
        }
      });

      if (error) {
        throw error;
      }

      // Also trigger Supabase password reset for the actual reset functionality
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (resetError) {
        console.error("Supabase reset error:", resetError);
      }

      setEmailSent(true);
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation a été envoyé à votre adresse",
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de l'email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            Email envoyé
          </CardTitle>
          <CardDescription>
            Vérifiez votre boîte email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
          </p>
          <p className="text-xs text-muted-foreground">
            Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEmailSent(false)}
              className="flex-1"
            >
              Renvoyer l'email
            </Button>
            <Button asChild variant="ghost" className="flex-1">
              <Link to="/auth" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Réinitialiser le mot de passe
        </CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/auth" className="flex items-center gap-1 justify-center">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};