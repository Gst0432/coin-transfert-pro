import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  emailType: 'registration' | 'transaction_confirmation' | 'admin_notification';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, emailType, data }: EmailRequest = await req.json();
    
    console.log('Email notification request:', { userId, emailType });

    // For now, just log the email request and create notifications
    // Later we can integrate with actual email service
    
    // Create in-app notification for user
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: getNotificationTitle(emailType, data),
        message: getNotificationMessage(emailType, data),
        type: 'info',
        category: emailType === 'registration' ? 'account' : 'transaction',
        important: true,
        data: data
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Send notification to admin if it's a transaction
    if (emailType === 'transaction_confirmation') {
      // Get admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (!adminError && adminUsers) {
        for (const admin of adminUsers) {
          // Create in-app notification for admin
          await supabase
            .from('notifications')
            .insert({
              user_id: admin.user_id,
              title: 'Nouvelle transaction',
              message: `Transaction ${data.type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'} de ${data.amount} ${data.type === 'fcfa_to_usdt' ? 'FCFA' : 'USDT'} en attente`,
              type: 'info',
              category: 'transaction',
              important: true,
              data: data
            });
        }
      }
    }

    console.log('Email notification processed successfully');

    return new Response(JSON.stringify({ success: true, notification }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getNotificationTitle(emailType: string, data: any): string {
  switch (emailType) {
    case 'registration':
      return 'Bienvenue !';
    case 'transaction_confirmation':
      return 'Transaction initiée';
    case 'admin_notification':
      return 'Nouvelle transaction';
    default:
      return 'Notification';
  }
}

function getNotificationMessage(emailType: string, data: any): string {
  switch (emailType) {
    case 'registration':
      return 'Votre compte a été créé avec succès. Bienvenue sur notre plateforme d\'échange !';
    case 'transaction_confirmation':
      return `Votre transaction ${data.type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'} a été initiée. Vous recevrez une confirmation une fois le traitement terminé.`;
    case 'admin_notification':
      return `Nouvelle transaction ${data.type === 'fcfa_to_usdt' ? 'FCFA → USDT' : 'USDT → FCFA'} nécessitant votre attention.`;
    default:
      return 'Vous avez reçu une nouvelle notification.';
  }
}

serve(handler);