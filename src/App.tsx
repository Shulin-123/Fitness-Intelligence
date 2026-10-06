import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { WhyDrawerProvider } from './context/WhyDrawerContext';
import { ThemeProvider } from './context/ThemeContext';
import { AICopilotProvider } from './context/AICopilotContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { NutritionPage } from './pages/NutritionPage';
import { FormCheckerPage } from './pages/FormCheckerPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

export function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <WhyDrawerProvider>
            <AICopilotProvider>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/assessment" element={<AssessmentPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/workout" element={<WorkoutPage />} />
                  <Route path="/nutrition" element={<NutritionPage />} />
                  <Route path="/form-checker" element={<FormCheckerPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/login" element={<AuthPage />} />
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AICopilotProvider>
          </WhyDrawerProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
