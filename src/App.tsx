import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

import Auth from "./pages/Auth";
import Contacts from "./pages/Contacts";
import Insights from "./pages/Insights";
import Article from "./pages/Article";
import Wellness from "./pages/Wellness";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="page-transition">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/contacts" element={<Contacts />} />
            <Route path="/insights" element={<Insights />} />
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portrait-studio" element={<PortraitStudio />} />
            <Route path="/hair-studio" element={<HairStudio />} />
            <Route path="/accessories-studio" element={<AccessoriesStudio />} />
            <Route path="/background-studio" element={<BackgroundStudio />} />

            <Route path="/prompt-yourself-studio" element={<PromptYourselfStudio />} />
            <Route path="/history" element={<History />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/studio-refinement" element={<StudioRefinement />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/generate" element={<Generate />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
