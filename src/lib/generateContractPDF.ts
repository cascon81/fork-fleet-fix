import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractData {
  // Client info
  clientName: string;
  clientCnpj: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientContact: string;
  
  // Forklift info
  forkliftPlaca: string;
  forkliftModelo: string;
  forkliftMarca: string;
  forkliftCapacidade: string;
  forkliftAno: number;
  
  // Rental info
  startDate: string;
  endDate: string;
  dailyRate: number;
  
  // Company info (optional)
  companyName?: string;
  companyAddress?: string;
  companyCnpj?: string;
}

export const generateContractPDF = (data: ContractData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function to add centered text
  const addCenteredText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.text(text, pageWidth / 2, y, { align: "center" });
    y += fontSize * 0.5;
  };

  // Helper function to add paragraph
  const addParagraph = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * fontSize * 0.5 + 5;
  };

  // Helper function to add section title
  const addSectionTitle = (title: string) => {
    y += 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 8;
  };

  // Calculate total days and value
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalValue = totalDays * data.dailyRate;

  // Header
  addCenteredText("CONTRATO DE LOCAÇÃO DE EMPILHADEIRA", 16, true);
  y += 5;
  addCenteredText(`Nº ${Date.now().toString().slice(-8)}`, 10);
  y += 10;

  // Date
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.setFontSize(10);
  doc.text(`Data: ${today}`, pageWidth - margin - 50, y);
  y += 15;

  // Parties
  addSectionTitle("1. DAS PARTES");
  
  const companyName = data.companyName || "ForkLift Manager Ltda";
  const companyAddress = data.companyAddress || "Rua das Empilhadeiras, 123 - São Paulo/SP";
  const companyCnpj = data.companyCnpj || "00.000.000/0001-00";
  
  addParagraph(
    `LOCADORA: ${companyName}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${companyCnpj}, com sede em ${companyAddress}, doravante denominada simplesmente "LOCADORA".`
  );
  
  addParagraph(
    `LOCATÁRIO: ${data.clientName}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.clientCnpj}, com sede em ${data.clientAddress}, telefone ${data.clientPhone}, e-mail ${data.clientEmail}, representada por ${data.clientContact}, doravante denominada simplesmente "LOCATÁRIO".`
  );

  // Object
  addSectionTitle("2. DO OBJETO");
  addParagraph(
    `O presente contrato tem por objeto a locação do seguinte equipamento: Empilhadeira ${data.forkliftMarca} ${data.forkliftModelo}, ano ${data.forkliftAno}, placa ${data.forkliftPlaca}, capacidade ${data.forkliftCapacidade}, em perfeito estado de funcionamento.`
  );

  // Period
  addSectionTitle("3. DO PRAZO");
  const formattedStart = format(startDate, "dd/MM/yyyy");
  const formattedEnd = format(endDate, "dd/MM/yyyy");
  addParagraph(
    `A locação terá início em ${formattedStart} e término em ${formattedEnd}, totalizando ${totalDays} dias.`
  );

  // Value
  addSectionTitle("4. DO VALOR");
  addParagraph(
    `Pela locação do equipamento, o LOCATÁRIO pagará à LOCADORA o valor de R$ ${data.dailyRate.toFixed(2)} (${numberToWords(data.dailyRate)} reais) por dia, totalizando R$ ${totalValue.toFixed(2)} (${numberToWords(totalValue)} reais) pelo período contratado.`
  );

  // Obligations
  addSectionTitle("5. DAS OBRIGAÇÕES DO LOCATÁRIO");
  addParagraph("a) Utilizar o equipamento de forma adequada e para os fins a que se destina;");
  addParagraph("b) Responsabilizar-se por quaisquer danos causados ao equipamento durante o período de locação;");
  addParagraph("c) Não sublocar, ceder ou emprestar o equipamento a terceiros;");
  addParagraph("d) Devolver o equipamento nas mesmas condições em que o recebeu;");
  addParagraph("e) Efetuar o pagamento nas datas acordadas.");

  // Check if need new page
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // General provisions
  addSectionTitle("6. DAS DISPOSIÇÕES GERAIS");
  addParagraph(
    "O não cumprimento de qualquer cláusula deste contrato poderá acarretar a rescisão imediata do mesmo, sem prejuízo das perdas e danos cabíveis."
  );
  addParagraph(
    "As partes elegem o foro da comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas do presente contrato."
  );

  // Signatures
  y += 20;
  addParagraph("E por estarem justos e contratados, firmam o presente em duas vias de igual teor.");
  
  y += 20;
  doc.setFontSize(10);
  
  // Signature lines
  const signatureY = y + 15;
  doc.line(margin, signatureY, margin + 70, signatureY);
  doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin, signatureY);
  
  doc.text("LOCADORA", margin + 35, signatureY + 5, { align: "center" });
  doc.text("LOCATÁRIO", pageWidth - margin - 35, signatureY + 5, { align: "center" });

  // Save
  doc.save(`contrato_${data.forkliftPlaca}_${format(new Date(), "yyyyMMdd")}.pdf`);
};

// Simple number to words converter for Portuguese
function numberToWords(num: number): string {
  const intPart = Math.floor(num);
  
  if (intPart === 0) return "zero";
  if (intPart < 0) return "menos " + numberToWords(-intPart);
  
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  
  if (intPart < 10) return units[intPart];
  if (intPart < 20) return teens[intPart - 10];
  if (intPart < 100) {
    const t = Math.floor(intPart / 10);
    const u = intPart % 10;
    return tens[t] + (u > 0 ? " e " + units[u] : "");
  }
  if (intPart === 100) return "cem";
  if (intPart < 1000) {
    const h = Math.floor(intPart / 100);
    const rest = intPart % 100;
    return hundreds[h] + (rest > 0 ? " e " + numberToWords(rest) : "");
  }
  if (intPart < 1000000) {
    const t = Math.floor(intPart / 1000);
    const rest = intPart % 1000;
    const prefix = t === 1 ? "mil" : numberToWords(t) + " mil";
    return prefix + (rest > 0 ? " " + (rest < 100 ? "e " : "") + numberToWords(rest) : "");
  }
  
  return intPart.toString();
}
