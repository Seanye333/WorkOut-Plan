import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import TemplatesPage from "./pages/TemplatesPage";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import HistoryPage from "./pages/HistoryPage";

function Layout() {
  return (
    <>
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
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<Layout />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
