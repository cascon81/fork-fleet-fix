import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Frota from "./pages/Frota";
import Alugueis from "./pages/Alugueis";
import Manutencoes from "./pages/Manutencoes";
import Clientes from "./pages/Clientes";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/frota" element={<Frota />} />
            <Route path="/alugueis" element={<Alugueis />} />
            <Route path="/manutencoes" element={<Manutencoes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
