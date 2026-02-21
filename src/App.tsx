import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";

import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Contacts from "./pages/Contacts";
import Article from "./pages/Article";
import Wellness from "./pages/Wellness";
import Waitlist from "./pages/Waitlist";
import WaitlistChallenge from "./pages/WaitlistChallenge";
import GatingGuard from "./components/GatingGuard";
import Travel from "./pages/Travel";
import Creativity from "./pages/Creativity";
import Growth from "./pages/Growth";
import About from "./pages/About";
import Authors from "./pages/Authors";
import Contact from "./pages/Contact";
import StyleGuide from "./pages/StyleGuide";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import PortraitStudio from "./pages/PortraitStudio";
import HairStudio from "./pages/HairStudio";
import AccessoriesStudio from "./pages/AccessoriesStudio";
import BackgroundStudio from "./pages/BackgroundStudio";

import PromptYourselfStudio from "./pages/PromptYourselfStudio";
import History from "./pages/History";
import Downloads from "./pages/Downloads";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StudioRefinement from "./pages/StudioRefinement";
import Careers from "./pages/Careers";
import Pricing from "./pages/Pricing";
import Documentation from "./pages/Documentation";
import Generate from "./pages/Generate";
import Personalization from "./pages/Personalization";
import Help from "./pages/Help";

import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/waitlist/challenge" element={<WaitlistChallenge />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/contacts" element={<Contacts />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/creativity" element={<Creativity />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/about" element={<About />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/style-guide" element={<StyleGuide />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/portrait-studio" element={<ProtectedRoute><PortraitStudio /></ProtectedRoute>} />
        <Route path="/hair-studio" element={<ProtectedRoute><HairStudio /></ProtectedRoute>} />
        <Route path="/accessories-studio" element={<ProtectedRoute><AccessoriesStudio /></ProtectedRoute>} />
        <Route path="/background-studio" element={<ProtectedRoute><BackgroundStudio /></ProtectedRoute>} />
        <Route path="/prompt-yourself-studio" element={<ProtectedRoute><PromptYourselfStudio /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/studio-refinement" element={<ProtectedRoute><StudioRefinement /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
        <Route path="/personalization" element={<ProtectedRoute><Personalization /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

        <Route path="/careers" element={<Careers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/documentation" element={<Documentation />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GatingGuard>
              <AnimatedRoutes />
            </GatingGuard>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);


export default App;

