import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      }
      navigate("/");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">💪</span>
          <h1 className="text-3xl font-bold text-white mt-3">WorkoutPlanner</h1>
          <p className="text-gray-400 mt-1">Plan, track, and crush your workouts.</p>
        </div>

        <div className="card">
          {/* Tab switcher */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === "signup" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="input"
                  required
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}
