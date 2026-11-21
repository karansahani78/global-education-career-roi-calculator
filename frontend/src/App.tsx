import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Keep the landing page eager; split the rest so the initial bundle stays small.
const Calculator = lazy(() => import("./pages/Calculator"));
const Results = lazy(() => import("./pages/Results"));
const Countries = lazy(() => import("./pages/Countries"));
const Majors = lazy(() => import("./pages/Majors"));
const Compare = lazy(() => import("./pages/Compare"));
const SeoPage = lazy(() => import("./pages/SeoPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DegreeWorthIt = lazy(() => import("./pages/DegreeWorthIt"));
const ShareRedirect = lazy(() => import("./pages/ShareRedirect"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
    <span className="sr-only">Loading page…</span>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <MotionConfig reducedMotion="user">
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/calculator" element={<Calculator />} />
                      {/* Canonical result page */}
                      <Route path="/results/:uuid" element={<Results />} />
                      {/* Share links redirect to the canonical result page */}
                      <Route path="/share/:uuid" element={<ShareRedirect />} />
                      {/* Other pages */}
                      <Route path="/countries" element={<Countries />} />
                      <Route path="/majors" element={<Majors />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/insights/degree-worth-it" element={<DegreeWorthIt />} />
                      <Route path="/page/:slug" element={<SeoPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      {/* Blog */}
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogPostPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </MotionConfig>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;