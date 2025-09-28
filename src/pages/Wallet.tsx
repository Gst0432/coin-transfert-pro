import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpDown, 
  Copy,
  Eye,
  EyeOff,
  Trash2,
  History
} from "lucide-react";
import TransactionHistory from '@/components/TransactionHistory';

interface MobileWallet {
  id: string;
  country: string;
  operator: string;
  phoneNumber: string;
  currency: "FCFA";
  type: "mobile_money";
}

interface CryptoWallet {
  id: string;
  address: string;
  currency: "USDT";
  type: "crypto";
  network: string;
}

type Wallet = MobileWallet | CryptoWallet;

const westAfricaCountries = [
  { code: "SN", name: "Sénégal", operators: ["Orange Money", "Free Money", "Wari"] },
  { code: "CI", name: "Côte d'Ivoire", operators: ["Orange Money", "MTN Money", "Moov Money"] },
  { code: "ML", name: "Mali", operators: ["Orange Money", "Malitel Money"] },
  { code: "BF", name: "Burkina Faso", operators: ["Orange Money", "Telmob"] },
  { code: "NE", name: "Niger", operators: ["Orange Money", "Airtel Money", "Mynita", "Amanata"] },
  { code: "GN", name: "Guinée", operators: ["Orange Money", "MTN Money"] },
  { code: "BJ", name: "Bénin", operators: ["MTN Money", "Moov Money"] },
  { code: "TG", name: "Togo", operators: ["Togocel Money", "Moov Money"] },
];

const cryptoNetworks = ["TRC20", "ERC20", "BEP20"];

export default function Wallet() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: "1",
      country: "Niger",
      operator: "Orange Money",
      phoneNumber: "+227 96 12 34 56",
      currency: "FCFA",
      type: "mobile_money"
    },
    {
      id: "2",
      address: "TQMfqFK...xyz123",
      currency: "USDT",
      type: "crypto",
      network: "TRC20"
    }
  ]);
  
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [hideAddresses, setHideAddresses] = useState(true);
  const [activeTab, setActiveTab] = useState("mobile");
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to home (landing page) if not authenticated
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleAutoConvert = () => {
    setActiveTab(activeTab === "mobile" ? "crypto" : "mobile");
    toast({
      title: "Inversion automatique",
      description: `Basculé vers ${activeTab === "mobile" ? "crypto (USDT)" : "mobile money (FCFA)"}`,
    });
  };

  const addMobileWallet = () => {
    if (!selectedCountry || !selectedOperator || !phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const newWallet: MobileWallet = {
      id: Date.now().toString(),
      country: selectedCountry,
      operator: selectedOperator,
      phoneNumber,
      currency: "FCFA",
      type: "mobile_money"
    };

    setWallets([...wallets, newWallet]);
    setSelectedCountry("");
    setSelectedOperator("");
    setPhoneNumber("");
    
    toast({
      title: "Portefeuille ajouté",
      description: `${selectedOperator} ${selectedCountry} ajouté avec succès`,
    });
  };

  const addCryptoWallet = () => {
    if (!cryptoAddress || !selectedNetwork) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const newWallet: CryptoWallet = {
      id: Date.now().toString(),
      address: cryptoAddress,
      currency: "USDT",
      type: "crypto",
      network: selectedNetwork
    };

    setWallets([...wallets, newWallet]);
    setCryptoAddress("");
    setSelectedNetwork("");
    
    toast({
      title: "Adresse USDT ajoutée",
      description: `Adresse ${selectedNetwork} ajoutée avec succès`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Adresse copiée dans le presse-papiers",
    });
  };

  const deleteWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
    toast({
      title: "Portefeuille supprimé",
      description: "Le portefeuille a été supprimé avec succès",
    });
  };

  const mobileWallets = wallets.filter(w => w.type === "mobile_money") as MobileWallet[];
  const cryptoWallets = wallets.filter(w => w.type === "crypto") as CryptoWallet[];

  return (
    <div className="container mx-auto p-2 max-w-xs space-y-2">
      {/* Header */}
      <div className="flex flex-col justify-between items-start gap-2">
        <div>
          <h1 className="text-lg font-bold text-foreground">Portefeuille</h1>
          <p className="text-[11px] text-muted-foreground">Gérez vos comptes mobile money et adresses crypto</p>
        </div>
        
        <div className="flex gap-1 w-full">
          <Button
            onClick={handleAutoConvert}
            variant="outline"
            size="sm"
            className="gap-1 h-7 px-2 text-[11px] flex-1"
          >
            <ArrowUpDown className="w-2.5 h-2.5" />
            Inverser
          </Button>
          
          <Button
            onClick={() => setShowAllWallets(!showAllWallets)}
            variant="outline"
            size="sm"
            className="gap-1 h-7 px-2 text-[11px] flex-1"
          >
            <WalletIcon className="w-2.5 h-2.5" />
            {showAllWallets ? "Masquer" : "Tous"}
          </Button>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[11px] text-muted-foreground">Mobile Money</p>
                <p className="text-lg font-semibold">{mobileWallets.length} comptes</p>
                <Badge variant="outline" className="text-[11px]">FCFA</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[11px] text-muted-foreground">Crypto</p>
                <p className="text-lg font-semibold">{cryptoWallets.length} adresses</p>
                <Badge variant="outline" className="text-[11px]">USDT</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour ajouter des portefeuilles */}
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Gestion du portefeuille</CardTitle>
          <CardDescription className="text-[11px]">
            Ajoutez vos comptes et consultez l'historique des transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 h-7">
              <TabsTrigger value="mobile" className="gap-1 h-7 px-2 text-[11px]">
                <Smartphone className="w-2.5 h-2.5" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="crypto" className="gap-1 h-7 px-2 text-[11px]">
                <WalletIcon className="w-2.5 h-2.5" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 h-7 px-2 text-[11px]">
                <History className="w-2.5 h-2.5" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mobile" className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-xs font-medium">Pays</Label>
                  <Select value={selectedCountry} onValueChange={(value) => {
                    setSelectedCountry(value);
                    setSelectedOperator(""); // Reset operator when country changes
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choisir un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {westAfricaCountries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="operator" className="text-xs font-medium">Opérateur</Label>
                  <Select 
                    value={selectedOperator} 
                    onValueChange={setSelectedOperator}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choisir un opérateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountry && 
                        westAfricaCountries
                          .find(c => c.name === selectedCountry)
                          ?.operators.map((operator) => (
                            <SelectItem key={operator} value={operator}>
                              {operator}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1 col-span-2">
                <Label htmlFor="phone" className="text-xs font-medium">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+227 96 12 34 56"
                  type="tel"
                  className="h-8 px-1.5 text-xs"
                />
              </div>
              
              <Button onClick={addMobileWallet} className="w-full gap-1 h-8 px-2 text-xs col-span-2">
                <Plus className="w-2.5 h-2.5" />
                Ajouter compte mobile money
              </Button>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-2 mt-2">
              <div className="space-y-1">
                <Label htmlFor="network" className="text-xs font-medium">Réseau</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choisir un réseau" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoNetworks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="address" className="text-xs font-medium">Adresse USDT</Label>
                <Input
                  id="address"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Coller l'adresse du portefeuille"
                  className="h-8 px-1.5 text-xs"
                />
              </div>
              
              <Button onClick={addCryptoWallet} className="w-full gap-1 h-8 px-2 text-xs">
                <Plus className="w-2.5 h-2.5" />
                Ajouter adresse USDT
              </Button>
            </TabsContent>
            
            <TabsContent value="history" className="mt-2">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des portefeuilles */}
      {showAllWallets && (
        <div className="space-y-4">
          {/* Mobile Money Wallets */}
          {mobileWallets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Money ({mobileWallets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mobileWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{wallet.country}</Badge>
                        <Badge variant="secondary" className="text-xs">{wallet.operator}</Badge>
                        <Badge className="text-xs bg-warning/20 text-warning border-warning/30">
                          {wallet.currency}
                        </Badge>
                      </div>
                      <p className="font-mono text-sm">{wallet.phoneNumber}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(wallet.phoneNumber)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteWallet(wallet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Crypto Wallets */}
          {cryptoWallets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <WalletIcon className="w-5 h-5" />
                  Adresses Crypto ({cryptoWallets.length})
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHideAddresses(!hideAddresses)}
                    className="ml-auto"
                  >
                    {hideAddresses ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cryptoWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{wallet.network}</Badge>
                        <Badge className="text-xs bg-success/20 text-success border-success/30">
                          {wallet.currency}
                        </Badge>
                      </div>
                      <p className="font-mono text-sm">
                        {hideAddresses 
                          ? wallet.address.slice(0, 8) + "..." + wallet.address.slice(-6)
                          : wallet.address
                        }
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteWallet(wallet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}