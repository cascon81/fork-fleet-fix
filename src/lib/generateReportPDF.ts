import { jsPDF } from 'jspdf';

interface ReportData {
  utilizationRate: number;
  monthlyRevenue: number;
  averageTicket: number;
  maintenanceCost: number;
  forkliftsTotal: number;
  forkliftsAvailable: number;
  forkliftsRented: number;
  forkliftsMaintenance: number;
  activeRentals: number;
  totalRentals: number;
  preventiveMaintenances: number;
  correctiveMaintenances: number;
  trends: {
    utilizationTrend: number;
    revenueTrend: number;
  };
}

export const generateReportPDF = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Gerencial', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 32, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 38, pageWidth - 20, 38);
  
  // KPIs Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicadores Principais', 20, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };
  
  const formatTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}% vs mês anterior`;
  };
  
  let yPos = 62;
  const lineHeight = 8;
  
  // Utilization Rate
  doc.setFont('helvetica', 'bold');
  doc.text('Taxa de Utilização:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.utilizationRate}% (${formatTrend(data.trends.utilizationTrend)})`, 80, yPos);
  yPos += lineHeight;
  
  // Monthly Revenue
  doc.setFont('helvetica', 'bold');
  doc.text('Receita Mensal:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatCurrency(data.monthlyRevenue)} (${formatTrend(data.trends.revenueTrend)})`, 80, yPos);
  yPos += lineHeight;
  
  // Average Ticket
  doc.setFont('helvetica', 'bold');
  doc.text('Ticket Médio:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatCurrency(data.averageTicket)} por diária`, 80, yPos);
  yPos += lineHeight;
  
  // Maintenance Cost
  doc.setFont('helvetica', 'bold');
  doc.text('Custo Manutenção:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.maintenanceCost), 80, yPos);
  yPos += lineHeight * 2;
  
  // Fleet Status Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Status da Frota', 20, yPos);
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`• Total de empilhadeiras: ${data.forkliftsTotal}`, 25, yPos);
  yPos += lineHeight;
  doc.text(`• Disponíveis: ${data.forkliftsAvailable}`, 25, yPos);
  yPos += lineHeight;
  doc.text(`• Alugadas: ${data.forkliftsRented}`, 25, yPos);
  yPos += lineHeight;
  doc.text(`• Em manutenção: ${data.forkliftsMaintenance}`, 25, yPos);
  yPos += lineHeight * 2;
  
  // Rentals Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Aluguéis', 20, yPos);
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`• Aluguéis ativos: ${data.activeRentals}`, 25, yPos);
  yPos += lineHeight;
  doc.text(`• Total de aluguéis registrados: ${data.totalRentals}`, 25, yPos);
  yPos += lineHeight * 2;
  
  // Maintenance Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Manutenções', 20, yPos);
  yPos += 12;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`• Preventivas: ${data.preventiveMaintenances}`, 25, yPos);
  yPos += lineHeight;
  doc.text(`• Corretivas: ${data.correctiveMaintenances}`, 25, yPos);
  yPos += lineHeight * 2;
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('Este relatório foi gerado automaticamente pelo sistema de gestão de frota.', pageWidth / 2, 280, { align: 'center' });
  
  // Save
  doc.save(`relatorio-frota-${new Date().toISOString().split('T')[0]}.pdf`);
};
