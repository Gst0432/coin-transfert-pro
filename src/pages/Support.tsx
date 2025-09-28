import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  BookOpen, 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Send,
  FileText,
  Users,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful_count: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  last_response: string;
  category: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour le formulaire de contact
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
    attachment: null as File | null
  });

  // FAQ mockée
  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Comment effectuer mon premier échange ?',
      answer: 'Pour effectuer votre premier échange, connectez-vous à votre compte, sélectionnez le type d\'échange (USDT vers FCFA ou FCFA vers USDT), entrez le montant désiré, vérifiez le taux de change et les frais, puis confirmez la transaction. Vous recevrez un email de confirmation une fois l\'opération terminée.',
      category: 'Échanges',
      helpful_count: 45
    },
    {
      id: '2',
      question: 'Quels sont les frais de transaction ?',
      answer: 'Nos frais varient selon le type de transaction : 1% pour les échanges USDT vers FCFA, 1.5% pour FCFA vers USDT. Les frais de retrait sont de 500 FCFA pour Mobile Money et 1 USDT pour les retraits crypto. Consultez notre page de tarification pour plus de détails.',
      category: 'Frais',
      helpful_count: 38
    },
    {
      id: '3',
      question: 'Combien de temps prend une transaction ?',
      answer: 'Les transactions sont généralement traitées en 5-15 minutes pendant les heures ouvrables. Les transferts vers Mobile Money peuvent prendre jusqu\'à 30 minutes selon l\'opérateur. Les retraits crypto sont traités dans les 24 heures maximum.',
      category: 'Délais',
      helpful_count: 52
    },
    {
      id: '4',
      question: 'Comment vérifier mon compte ?',
      answer: 'Pour vérifier votre compte, allez dans Paramètres > Vérification d\'identité. Vous devrez fournir une pièce d\'identité valide et un justificatif de domicile. La vérification prend généralement 1-3 jours ouvrables.',
      category: 'Vérification',
      helpful_count: 29
    },
    {
      id: '5',
      question: 'Que faire si ma transaction échoue ?',
      answer: 'Si votre transaction échoue, vérifiez d\'abord votre solde et les informations saisies. Les fonds sont automatiquement remboursés en cas d\'échec. Si le problème persiste, contactez notre support avec l\'ID de transaction.',
      category: 'Dépannage',
      helpful_count: 33
    },
    {
      id: '6',
      question: 'Comment sécuriser mon compte ?',
      answer: 'Activez l\'authentification à deux facteurs (2FA), utilisez un mot de passe fort et unique, ne partagez jamais vos identifiants, et déconnectez-vous toujours après utilisation. Surveillez régulièrement l\'activité de votre compte.',
      category: 'Sécurité',
      helpful_count: 41
    }
  ]);

  // Tickets de support mockés
  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      subject: 'Transaction bloquée depuis 2 heures',
      status: 'open',
      priority: 'high',
      created_at: '2024-01-15T14:30:00Z',
      last_response: '2024-01-15T15:45:00Z',
      category: 'Transactions'
    },
    {
      id: 'TKT-002',
      subject: 'Question sur les frais de change',
      status: 'resolved',
      priority: 'low',
      created_at: '2024-01-14T10:20:00Z',
      last_response: '2024-01-14T16:30:00Z',
      category: 'Frais'
    },
    {
      id: 'TKT-003',
      subject: 'Problème de vérification de compte',
      status: 'pending',
      priority: 'medium',
      created_at: '2024-01-13T09:15:00Z',
      last_response: '2024-01-14T11:20:00Z',
      category: 'Vérification'
    }
  ]);

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; text: string }> = {
      open: { variant: 'destructive', text: 'Ouvert' },
      pending: { variant: 'default', text: 'En cours' },
      resolved: { variant: 'default', text: 'Résolu' },
      closed: { variant: 'secondary', text: 'Fermé' }
    };
    
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; text: string }> = {
      low: { variant: 'secondary', text: 'Faible' },
      medium: { variant: 'default', text: 'Moyenne' },
      high: { variant: 'destructive', text: 'Élevée' },
      urgent: { variant: 'destructive', text: 'Urgente' }
    };
    
    const config = variants[priority] || variants.medium;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été envoyée. Nous vous répondrons rapidement.",
      });

      // Reset du formulaire
      setContactForm({
        subject: "",
        category: "general",
        priority: "medium", 
        message: "",
        attachment: null
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Centre d'Aide</h1>
        <p className="text-muted-foreground">
          Trouvez des réponses à vos questions ou contactez notre équipe support
        </p>
      </div>

      {/* Recherche globale */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher dans la FAQ, guides, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contacter le Support</TabsTrigger>
          <TabsTrigger value="tickets">Mes Tickets</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>

        {/* Onglet FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">Questions Fréquentes</h2>
              
              {filteredFAQ.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucune question trouvée pour "{searchQuery}"
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFAQ.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{item.question}</CardTitle>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{item.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{item.helpful_count} personnes ont trouvé cela utile</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Utile
                            </Button>
                            <Button variant="outline" size="sm">
                              Pas utile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar avec catégories */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Catégories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['Échanges', 'Frais', 'Délais', 'Vérification', 'Dépannage', 'Sécurité'].map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSearchQuery(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Contact rapide */}
              <Card>
                <CardHeader>
                  <CardTitle>Besoin d'aide ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <a href="#contact">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter le Support
                    </a>
                  </Button>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Réponse sous 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Support 7j/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Contact */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un Ticket de Support</CardTitle>
                  <CardDescription>
                    Décrivez votre problème en détail pour obtenir une aide personnalisée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <select
                          id="category"
                          value={contactForm.category}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            category: e.target.value
                          }))}
                          className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                        >
                          <option value="general">Question générale</option>
                          <option value="transaction">Problème de transaction</option>
                          <option value="account">Compte et vérification</option>
                          <option value="security">Sécurité</option>
                          <option value="fees">Frais et tarification</option>
                          <option value="technical">Problème technique</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priorité</Label>
                        <select
                          id="priority"
                          value={contactForm.priority}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            priority: e.target.value
                          }))}
                          className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                        >
                          <option value="low">Faible</option>
                          <option value="medium">Moyenne</option>
                          <option value="high">Élevée</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Sujet</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({
                          ...prev,
                          subject: e.target.value
                        }))}
                        placeholder="Décrivez brièvement votre problème"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({
                          ...prev,
                          message: e.target.value
                        }))}
                        placeholder="Décrivez votre problème en détail..."
                        rows={6}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="attachment">Pièce jointe (optionnel)</Label>
                      <input
                        type="file"
                        id="attachment"
                        accept=".jpg,.jpeg,.png,.pdf,.txt"
                        onChange={(e) => setContactForm(prev => ({
                          ...prev,
                          attachment: e.target.files?.[0] || null
                        }))}
                        className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formats acceptés: JPG, PNG, PDF, TXT (max 10MB)
                      </p>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Autres Moyens de Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@exchange.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-sm text-muted-foreground">+229 XX XX XX XX</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Chat en direct</p>
                      <p className="text-sm text-muted-foreground">Disponible 9h-18h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Temps de Réponse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Faible</span>
                    <span className="text-sm text-muted-foreground">48-72h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Moyenne</span>
                    <span className="text-sm text-muted-foreground">24-48h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Élevée</span>
                    <span className="text-sm text-muted-foreground">4-24h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Urgente</span>
                    <span className="text-sm text-success">2-4h</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Mes Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mes Tickets de Support</h2>
            <Button onClick={() => window.location.hash = 'contact'}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Nouveau Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {supportTickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Aucun ticket de support
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vos demandes de support apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              supportTickets.map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:bg-secondary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Ticket #{ticket.id}</span>
                          <span>{ticket.category}</span>
                          <span>Créé le {formatDate(ticket.created_at)}</span>
                          <span>Dernière réponse: {formatDate(ticket.last_response)}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Onglet Ressources */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Guides d'Utilisation
                </CardTitle>
                <CardDescription>
                  Apprenez à utiliser notre plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <FileText className="w-4 h-4" />
                  Guide du débutant
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <FileText className="w-4 h-4" />
                  Comment effectuer un échange
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <FileText className="w-4 h-4" />
                  Vérification de compte
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <FileText className="w-4 h-4" />
                  Sécurité du compte
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Ressources Externes
                </CardTitle>
                <CardDescription>
                  Liens utiles et documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Conditions d'utilisation
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Politique de confidentialité
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Tarification
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Blog et actualités
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Communauté
                </CardTitle>
                <CardDescription>
                  Rejoignez notre communauté
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Forum communautaire
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Groupe Telegram
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Chaîne Discord
                </a>
                <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  Réseaux sociaux
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}