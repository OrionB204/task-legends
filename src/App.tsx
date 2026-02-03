import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { BackgroundMusic } from "./components/game/BackgroundMusic";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // SECURITY: Force removal of unwanted floating buttons on mobile
    const cleaner = setInterval(() => {
      if (window.innerWidth >= 640) return; // Only affect mobile

      const fixedElements = document.querySelectorAll('.fixed, [class*="fixed"]');
      fixedElements.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;

        const style = window.getComputedStyle(el);
        const isBottom = style.bottom !== 'auto' && parseInt(style.bottom) < 150;
        const isRight = style.right !== 'auto' && parseInt(style.right) < 100;

        // Target elements in bottom-right corner
        if (isBottom && isRight) {
          // Skip Toasts (usually wider) and likely important UI that isn't a button
          if (el.offsetWidth > 100) return;

          // Hide it
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          // console.log('Hidden floating element:', el);
        }
      });
    }, 1000); // Check every second
    return () => clearInterval(cleaner);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BackgroundMusic />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
