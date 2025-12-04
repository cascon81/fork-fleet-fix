import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string;
  type: "rental_created" | "rental_ending" | "maintenance_scheduled" | "maintenance_completed";
  data: {
    clientName?: string;
    forkliftPlaca?: string;
    forkliftModelo?: string;
    startDate?: string;
    endDate?: string;
    maintenanceDate?: string;
    maintenanceType?: string;
    dailyRate?: number;
  };
}

const getEmailContent = (type: string, data: NotificationRequest["data"]) => {
  switch (type) {
    case "rental_created":
      return {
        subject: `Novo Aluguel Confirmado - ${data.forkliftPlaca}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Aluguel Confirmado!</h1>
            <p>Prezado(a) <strong>${data.clientName}</strong>,</p>
            <p>Seu aluguel foi confirmado com sucesso!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalhes do Aluguel:</h3>
              <p><strong>Empilhadeira:</strong> ${data.forkliftModelo} (${data.forkliftPlaca})</p>
              <p><strong>Data de Início:</strong> ${data.startDate}</p>
              <p><strong>Data de Término:</strong> ${data.endDate}</p>
              <p><strong>Valor Diário:</strong> R$ ${data.dailyRate?.toFixed(2)}</p>
            </div>
            <p>Qualquer dúvida, entre em contato conosco.</p>
            <p>Atenciosamente,<br><strong>ForkLift Manager</strong></p>
          </div>
        `,
      };
    case "rental_ending":
      return {
        subject: `Aluguel Terminando em Breve - ${data.forkliftPlaca}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Lembrete de Término</h1>
            <p>Prezado(a) <strong>${data.clientName}</strong>,</p>
            <p>Seu aluguel está chegando ao fim!</p>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalhes:</h3>
              <p><strong>Empilhadeira:</strong> ${data.forkliftModelo} (${data.forkliftPlaca})</p>
              <p><strong>Data de Término:</strong> ${data.endDate}</p>
            </div>
            <p>Entre em contato para renovar ou agendar a devolução.</p>
            <p>Atenciosamente,<br><strong>ForkLift Manager</strong></p>
          </div>
        `,
      };
    case "maintenance_scheduled":
      return {
        subject: `Manutenção Agendada - ${data.forkliftPlaca}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Manutenção Agendada</h1>
            <p>Uma nova manutenção foi agendada.</p>
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalhes:</h3>
              <p><strong>Empilhadeira:</strong> ${data.forkliftModelo} (${data.forkliftPlaca})</p>
              <p><strong>Tipo:</strong> ${data.maintenanceType}</p>
              <p><strong>Data:</strong> ${data.maintenanceDate}</p>
            </div>
            <p>Atenciosamente,<br><strong>ForkLift Manager</strong></p>
          </div>
        `,
      };
    case "maintenance_completed":
      return {
        subject: `Manutenção Concluída - ${data.forkliftPlaca}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">Manutenção Concluída!</h1>
            <p>A manutenção foi finalizada com sucesso.</p>
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalhes:</h3>
              <p><strong>Empilhadeira:</strong> ${data.forkliftModelo} (${data.forkliftPlaca})</p>
              <p><strong>Tipo:</strong> ${data.maintenanceType}</p>
            </div>
            <p>O equipamento está pronto para uso.</p>
            <p>Atenciosamente,<br><strong>ForkLift Manager</strong></p>
          </div>
        `,
      };
    default:
      return {
        subject: "Notificação ForkLift Manager",
        html: "<p>Você tem uma nova notificação.</p>",
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: NotificationRequest = await req.json();
    
    console.log(`Sending ${type} notification to ${to}`);
    
    const { subject, html } = getEmailContent(type, data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ForkLift Manager <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
