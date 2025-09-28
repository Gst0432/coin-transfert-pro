import { ChangePassword } from "@/components/ChangePassword";

const PasswordSettings = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sécurité du compte</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de sécurité de votre compte
        </p>
      </div>
      
      <ChangePassword />
    </div>
  );
};

export default PasswordSettings;