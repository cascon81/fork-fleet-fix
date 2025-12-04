import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NotificationData {
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

export const useNotifications = () => {
  const sendNotification = async (notificationData: NotificationData) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: notificationData,
      });

      if (error) throw error;

      toast({
        title: "Notificação enviada",
        description: `E-mail enviado para ${notificationData.to}`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Erro ao enviar notificação",
        description: error.message || "Não foi possível enviar o e-mail",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const sendRentalCreatedNotification = async (
    clientEmail: string,
    clientName: string,
    forkliftPlaca: string,
    forkliftModelo: string,
    startDate: string,
    endDate: string,
    dailyRate: number
  ) => {
    return sendNotification({
      to: clientEmail,
      type: "rental_created",
      data: {
        clientName,
        forkliftPlaca,
        forkliftModelo,
        startDate,
        endDate,
        dailyRate,
      },
    });
  };

  const sendRentalEndingNotification = async (
    clientEmail: string,
    clientName: string,
    forkliftPlaca: string,
    forkliftModelo: string,
    endDate: string
  ) => {
    return sendNotification({
      to: clientEmail,
      type: "rental_ending",
      data: {
        clientName,
        forkliftPlaca,
        forkliftModelo,
        endDate,
      },
    });
  };

  const sendMaintenanceScheduledNotification = async (
    email: string,
    forkliftPlaca: string,
    forkliftModelo: string,
    maintenanceDate: string,
    maintenanceType: string
  ) => {
    return sendNotification({
      to: email,
      type: "maintenance_scheduled",
      data: {
        forkliftPlaca,
        forkliftModelo,
        maintenanceDate,
        maintenanceType,
      },
    });
  };

  const sendMaintenanceCompletedNotification = async (
    email: string,
    forkliftPlaca: string,
    forkliftModelo: string,
    maintenanceType: string
  ) => {
    return sendNotification({
      to: email,
      type: "maintenance_completed",
      data: {
        forkliftPlaca,
        forkliftModelo,
        maintenanceType,
      },
    });
  };

  return {
    sendNotification,
    sendRentalCreatedNotification,
    sendRentalEndingNotification,
    sendMaintenanceScheduledNotification,
    sendMaintenanceCompletedNotification,
  };
};
