import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/schedule", label: "Schedule" },
  { to: "/exercises", label: "Exercises" },
  { to: "/templates", label: "Templates" },
  { to: "/history", label: "History" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <span className="text-indigo-400 font-bold text-lg tracking-tight">
            💪 WorkoutPlanner
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* User + logout (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-1">
              Logout
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-gray-800 mt-2 pt-2">
            <p className="text-gray-500 text-xs mb-2">{user?.email}</p>
            <button onClick={handleLogout} className="btn-secondary text-sm w-full">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
