import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Code,
  Settings,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBrandingSettings } from '@/hooks/useBrandingSettings';

interface SMTPConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  encryption: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

interface EmailTemplate {
  welcome: {
    subject: string;
    content: string;
  };
  password_reset: {
    subject: string;
    content: string;
  };
  transaction_notification: {
    subject: string;
    content: string;
  };
}

export default function EmailConfiguration() {
  const { settings: brandingSettings } = useBrandingSettings();
  const { toast } = useToast();
  
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>({
    host: '',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls',
    from_email: '',
    from_name: brandingSettings.site_name || 'Exchange Pro',
    is_active: false,
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate>({
    welcome: {
      subject: 'Bienvenue sur {{site_name}}',
      content: `<h1>Bienvenue sur {{site_name}} !</h1>
<p>Nous sommes ravis de vous accueillir, {{user_name}} !</p>
<p>Votre compte a été créé avec succès. Vous pouvez maintenant profiter de nos services d'échange de cryptomonnaies.</p>
<a href="{{app_url}}" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accéder à votre compte</a>
<p>L'équipe {{site_name}}</p>`,
    },
    password_reset: {
      subject: 'Réinitialisation de mot de passe - {{site_name}}',
      content: `<h1>Réinitialisation de mot de passe</h1>
<p>Vous avez demandé la réinitialisation de votre mot de passe pour {{site_name}}.</p>
<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
<a href="{{reset_url}}" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Réinitialiser mon mot de passe</a>
<p><strong>Ce lien expirera dans 60 minutes.</strong></p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
<p>L'équipe {{site_name}}</p>`,
    },
    transaction_notification: {
      subject: 'Mise à jour de votre transaction - {{site_name}}',
      content: `<h1>Mise à jour de transaction</h1>
<p>Votre transaction {{transaction_id}} a été mise à jour.</p>
<p><strong>Statut :</strong> {{transaction_status}}</p>
<p><strong>Montant :</strong> {{transaction_amount}}</p>
<p><strong>Date :</strong> {{transaction_date}}</p>
<a href="{{app_url}}/history" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir mes transactions</a>
<p>L'équipe {{site_name}}</p>`,
    },
  });

  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<keyof EmailTemplate>('welcome');

  // Load configurations on mount
  useEffect(() => {
    loadEmailConfigurations();
  }, []);

  // Update from_name when branding changes
  useEffect(() => {
    setSMTPConfig(prev => ({
      ...prev,
      from_name: brandingSettings.site_name || 'Exchange Pro',
    }));
  }, [brandingSettings.site_name]);

  const loadEmailConfigurations = async () => {
    try {
      setLoading(true);
      // API call to load SMTP config and templates
      const response = await fetch('/api/admin/email-config');
      if (response.ok) {
        const data = await response.json();
        if (data.smtp_config) setSMTPConfig(data.smtp_config);
        if (data.email_templates) setEmailTemplates(data.email_templates);
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_config: smtpConfig,
          email_templates: emailTemplates,
        }),
      });

      if (response.ok) {
        toast({
          title: "Configuration sauvegardée",
          description: "Les paramètres email ont été mis à jour avec succès.",
        });
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSMTPConnection = async () => {
    if (!testEmail) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez saisir une adresse email pour le test.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_config: smtpConfig,
          test_email: testEmail,
        }),
      });

      if (response.ok) {
        toast({
          title: "Test réussi !",
          description: "Email de test envoyé avec succès.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de test SMTP');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Test échoué",
        description: error.message || "Impossible d'envoyer l'email de test.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPreviewContent = () => {
    const template = emailTemplates[previewTemplate];
    const variables = {
      '{{site_name}}': brandingSettings.site_name || 'Exchange Pro',
      '{{user_name}}': 'John Doe',
      '{{app_url}}': window.location.origin,
      '{{primary_color}}': '#3b82f6', // Default primary color
      '{{reset_url}}': window.location.origin + '/reset-password-confirm?token=example',
      '{{transaction_id}}': 'TXN-12345',
      '{{transaction_status}}': 'Terminée',
      '{{transaction_amount}}': '100 USDT',
      '{{transaction_date}}': new Date().toLocaleDateString('fr-FR'),
    };

    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value);
    });

    let subject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key, 'g'), value);
    });

    return { subject, content };
  };

  if (loading && !smtpConfig.host) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuration Email</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres SMTP et les templates d'emails de votre plateforme
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={smtpConfig.is_active ? 'default' : 'secondary'}>
            {smtpConfig.is_active ? 'SMTP Actif' : 'SMTP Inactif'}
          </Badge>
          
          <Button onClick={saveConfiguration} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration SMTP
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Templates Email
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Configuration SMTP */}
        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Paramètres SMTP Hostinger
              </CardTitle>
              <CardDescription>
                Configurez votre serveur SMTP pour l'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">Serveur SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={smtpConfig.host}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="mail.votredomaine.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">Port</Label>
                  <Select value={smtpConfig.port} onValueChange={(value) => setSMTPConfig(prev => ({ ...prev, port: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="587">587 (TLS)</SelectItem>
                      <SelectItem value="465">465 (SSL)</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
                  <Input
                    id="smtp_username"
                    type="email"
                    value={smtpConfig.username}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="noreply@votredomaine.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">Mot de passe</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="smtp_encryption">Chiffrement</Label>
                  <Select value={smtpConfig.encryption} onValueChange={(value) => setSMTPConfig(prev => ({ ...prev, encryption: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="from_email">Email expéditeur</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={smtpConfig.from_email}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="noreply@votredomaine.com"
                  />
                </div>
                <div>
                  <Label htmlFor="from_name">Nom expéditeur</Label>
                  <Input
                    id="from_name"
                    value={smtpConfig.from_name}
                    onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="Exchange Pro"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Test de la configuration</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email de test"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={testSMTPConnection} disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    Tester
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Email */}
        <TabsContent value="templates" className="space-y-4">
          <Tabs defaultValue="welcome" className="space-y-4">
            <TabsList>
              <TabsTrigger value="welcome">Bienvenue</TabsTrigger>
              <TabsTrigger value="password_reset">Mot de passe</TabsTrigger>
              <TabsTrigger value="transaction_notification">Transaction</TabsTrigger>
            </TabsList>

            <TabsContent value="welcome" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Email de Bienvenue</CardTitle>
                  <CardDescription>
                    Email envoyé lors de l'inscription d'un nouvel utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="welcome_subject">Sujet</Label>
                    <Input
                      id="welcome_subject"
                      value={emailTemplates.welcome.subject}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        welcome: { ...prev.welcome, subject: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="welcome_content">Contenu HTML</Label>
                    <Textarea
                      id="welcome_content"
                      rows={10}
                      value={emailTemplates.welcome.content}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        welcome: { ...prev.welcome, content: e.target.value }
                      }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password_reset" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Réinitialisation Mot de Passe</CardTitle>
                  <CardDescription>
                    Email envoyé lors d'une demande de réinitialisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reset_subject">Sujet</Label>
                    <Input
                      id="reset_subject"
                      value={emailTemplates.password_reset.subject}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        password_reset: { ...prev.password_reset, subject: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reset_content">Contenu HTML</Label>
                    <Textarea
                      id="reset_content"
                      rows={10}
                      value={emailTemplates.password_reset.content}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        password_reset: { ...prev.password_reset, content: e.target.value }
                      }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transaction_notification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Notification Transaction</CardTitle>
                  <CardDescription>
                    Email envoyé lors du changement de statut d'une transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="transaction_subject">Sujet</Label>
                    <Input
                      id="transaction_subject"
                      value={emailTemplates.transaction_notification.subject}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        transaction_notification: { ...prev.transaction_notification, subject: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transaction_content">Contenu HTML</Label>
                    <Textarea
                      id="transaction_content"
                      rows={10}
                      value={emailTemplates.transaction_notification.content}
                      onChange={(e) => setEmailTemplates(prev => ({
                        ...prev,
                        transaction_notification: { ...prev.transaction_notification, content: e.target.value }
                      }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Variables disponibles :</strong> {`{{site_name}}`}, {`{{user_name}}`}, {`{{app_url}}`}, {`{{primary_color}}`}, {`{{reset_url}}`}, {`{{transaction_id}}`}, {`{{transaction_status}}`}, {`{{transaction_amount}}`}, {`{{transaction_date}}`}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Aperçu */}
        <TabsContent value="preview" className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="preview_template">Template à prévisualiser :</Label>
            <Select value={previewTemplate} onValueChange={(value: keyof EmailTemplate) => setPreviewTemplate(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Bienvenue</SelectItem>
                <SelectItem value="password_reset">Mot de passe</SelectItem>
                <SelectItem value="transaction_notification">Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aperçu de l'email</CardTitle>
              <CardDescription>
                Aperçu avec les variables remplacées par des exemples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Sujet :</Label>
                  <div className="p-3 bg-muted rounded-md font-medium">
                    {getPreviewContent().subject}
                  </div>
                </div>
                <div>
                  <Label>Contenu :</Label>
                  <div 
                    className="p-4 bg-white border rounded-md"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent().content }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}