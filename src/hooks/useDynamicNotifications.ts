import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type DbForklift = Tables<'forklifts'>;
type DbRental = Tables<'rentals'>;
type DbMaintenance = Tables<'maintenances'>;

export interface DynamicNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'maintenance' | 'rental' | 'alert';
}

export const useDynamicNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const [forkliftsRes, rentalsRes, maintenancesRes] = await Promise.all([
        supabase.from('forklifts').select('*'),
        supabase.from('rentals').select('*'),
        supabase.from('maintenances').select('*'),
      ]);

      const forklifts = forkliftsRes.data || [];
      const rentals = rentalsRes.data || [];
      const maintenances = maintenancesRes.data || [];

      const dynamicNotifications: DynamicNotification[] = [];
      const now = new Date();

      // Check for upcoming maintenances (next 7 days)
      maintenances
        .filter(m => m.status === 'agendada')
        .forEach(m => {
          const scheduledDate = new Date(m.data_agendada);
          const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil >= 0 && daysUntil <= 7) {
            const forklift = forklifts.find(f => f.id === m.forklift_id);
            dynamicNotifications.push({
              id: `maint-${m.id}`,
              title: 'Manutenção agendada',
              message: `${forklift?.placa || 'Empilhadeira'} - ${m.tipo} em ${daysUntil === 0 ? 'hoje' : `${daysUntil} dia(s)`}`,
              time: formatTimeAgo(m.created_at),
              type: 'maintenance',
            });
          }
        });

      // Check for overdue rentals
      rentals
        .filter(r => r.status === 'atrasado')
        .forEach(r => {
          const endDate = new Date(r.data_fim);
          const daysOverdue = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
          const forklift = forklifts.find(f => f.id === r.forklift_id);
          
          dynamicNotifications.push({
            id: `rental-overdue-${r.id}`,
            title: 'Aluguel atrasado',
            message: `${r.cliente} - ${forklift?.placa || ''} - ${daysOverdue} dia(s) de atraso`,
            time: formatTimeAgo(r.data_fim),
            type: 'alert',
          });
        });

      // Check for rentals ending soon (next 3 days)
      rentals
        .filter(r => r.status === 'ativo')
        .forEach(r => {
          const endDate = new Date(r.data_fim);
          const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd >= 0 && daysUntilEnd <= 3) {
            const forklift = forklifts.find(f => f.id === r.forklift_id);
            dynamicNotifications.push({
              id: `rental-ending-${r.id}`,
              title: 'Aluguel terminando',
              message: `${r.cliente} - ${forklift?.placa || ''} termina ${daysUntilEnd === 0 ? 'hoje' : `em ${daysUntilEnd} dia(s)`}`,
              time: formatTimeAgo(r.created_at),
              type: 'rental',
            });
          }
        });

      // Check for forklifts in maintenance
      forklifts
        .filter(f => f.status === 'manutencao')
        .forEach(f => {
          dynamicNotifications.push({
            id: `forklift-maint-${f.id}`,
            title: 'Empilhadeira em manutenção',
            message: `${f.placa} - ${f.marca} ${f.modelo}`,
            time: formatTimeAgo(f.updated_at),
            type: 'maintenance',
          });
        });

      // Sort by most recent and limit to 10
      dynamicNotifications.sort((a, b) => {
        // Priority: alerts > maintenance > rental
        const priorityOrder = { alert: 0, maintenance: 1, rental: 2 };
        return priorityOrder[a.type] - priorityOrder[b.type];
      });

      setNotifications(dynamicNotifications.slice(0, 10));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return { notifications, isLoading, refetch: fetchNotifications };
};
