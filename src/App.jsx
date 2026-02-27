import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BackgroundProvider } from "./context/BackgroundContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import AppBackground from "./components/common/AppBackground";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import TemplatesPage from "./pages/TemplatesPage";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function Layout() {
  return (
    <AppBackground>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/log" element={<WorkoutLogPage />} />
          <Route path="/log/:logId" element={<WorkoutLogPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </AppBackground>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BackgroundProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<Layout />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </BackgroundProvider>
    </AuthProvider>
  );
}
