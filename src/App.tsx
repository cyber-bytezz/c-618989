
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeCustomizationProvider } from "./contexts/ThemeCustomizationContext";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import AssetDetails from "./pages/AssetDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <ThemeCustomizationProvider>
            <WatchlistProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/asset/:id" element={<AssetDetails />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </WatchlistProvider>
          </ThemeCustomizationProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
