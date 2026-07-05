import { lazy, Suspense, memo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './hooks/useAuth';

// Code-split every page
const LandingPage   = lazy(() => import('./pages/LandingPage'));
const PredictPage   = lazy(() => import('./pages/PredictPage'));
const MapPage       = lazy(() => import('./pages/MapPage'));
const ComparePage   = lazy(() => import('./pages/ComparePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const SignupPage    = lazy(() => import('./pages/SignupPage'));
const ProfilePage   = lazy(() => import('./pages/ProfilePage'));

// Minimal page loader — skeleton bar
const PageLoader = memo(() => (
  <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 9999 }}>
    <div
      style={{ height: 2, background: '#0F172A', animation: 'loadBar 1.2s ease forwards' }}
    />
    <style>{`
      @keyframes loadBar {
        0%   { width: 0%; opacity: 1; }
        80%  { width: 90%; }
        100% { width: 100%; opacity: 0; }
      }
    `}</style>
  </div>
));

// Pages that own their full layout (no top navbar / global footer)
const FULL_LAYOUT = new Set(['/login', '/signup']);
// Pages that hide the footer
const NO_FOOTER   = new Set(['/map', '/dashboard', '/login', '/signup']);

// Page animation variants
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0,        transition: { duration: 0.15, ease: 'easeIn' } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}

function Layout() {
  const location = useLocation();
  const { pathname } = location;
  const standalone = FULL_LAYOUT.has(pathname);
  const showFooter  = !NO_FOOTER.has(pathname);

  return (
    <>
      {!standalone && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={pathname}>
            <Route path="/"          element={<AnimatedPage><LandingPage /></AnimatedPage>} />
            <Route path="/predict"   element={<AnimatedPage><PredictPage /></AnimatedPage>} />
            <Route path="/map"       element={<AnimatedPage><MapPage /></AnimatedPage>} />
            <Route path="/compare"   element={<AnimatedPage><ComparePage /></AnimatedPage>} />
            <Route path="/analytics" element={<AnimatedPage><AnalyticsPage /></AnimatedPage>} />
            <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
            <Route path="/login"     element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path="/signup"    element={<AnimatedPage><SignupPage /></AnimatedPage>} />
            <Route path="/profile"   element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
