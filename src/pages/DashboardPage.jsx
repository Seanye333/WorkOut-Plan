import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSchedule } from "../hooks/useSchedule";
import { useWorkoutLog } from "../hooks/useWorkoutLog";
import Spinner from "../components/common/Spinner";
import { getDayKey, formatLongDate } from "../utils/dateHelpers";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { weekData, loading: scheduleLoading } = useSchedule(new Date());
  const { logs, loading: logsLoading, refresh } = useWorkoutLog();

  useEffect(() => {
    refresh();
  }, []);

  const today = new Date();
  const todayKey = getDayKey(today);
  const todayWorkouts = weekData?.days?.[todayKey]?.workouts ?? [];

  const name = user?.displayName || user?.email?.split("@")[0] || "Athlete";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Hey, {name}! 👋
        </h1>
        <p className="text-gray-400 mt-1">{formatLongDate(today)}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Schedule", to: "/schedule", emoji: "📅" },
          { label: "Exercises", to: "/exercises", emoji: "🏋️" },
          { label: "Templates", to: "/templates", emoji: "📋" },
          { label: "History", to: "/history", emoji: "📊" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card flex flex-col items-center gap-2 hover:border-indigo-600 transition-colors text-center"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-sm font-medium text-gray-300">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Today's workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Today's Workouts</h2>
          <Link to="/schedule" className="text-indigo-400 text-sm hover:text-indigo-300">
            View schedule →
          </Link>
        </div>
        {scheduleLoading ? (
          <Spinner size="sm" />
        ) : todayWorkouts.length === 0 ? (
          <div className="card text-center text-gray-500 py-6">
            <p>No workouts scheduled for today.</p>
            <Link to="/schedule" className="text-indigo-400 text-sm hover:text-indigo-300 mt-2 block">
              Add a workout to your schedule →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayWorkouts.map((w, i) => (
              <div
                key={i}
                className={`card flex items-center justify-between gap-3 ${
                  w.isCompleted ? "border-green-800/50" : ""
                }`}
              >
                <div>
                  <p className={`font-medium ${w.isCompleted ? "text-green-300" : "text-white"}`}>
                    {w.isCompleted && "✓ "}
                    {w.templateName ?? w.customName ?? "Workout"}
                  </p>
                  {w.exercises?.length > 0 && (
                    <p className="text-gray-500 text-sm">{w.exercises.length} exercises</p>
                  )}
                </div>
                {!w.isCompleted && (
                  <button
                    className="btn-primary text-sm py-1 shrink-0"
                    onClick={() =>
                      navigate("/log", { state: { workout: w, dayKey: todayKey, workoutIndex: i } })
                    }
                  >
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Recent Workouts</h2>
          <Link to="/history" className="text-indigo-400 text-sm hover:text-indigo-300">
            View all →
          </Link>
        </div>
        {logsLoading ? (
          <Spinner size="sm" />
        ) : logs.length === 0 ? (
          <div className="card text-center text-gray-500 py-6">
            <p>No workouts logged yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.slice(0, 3).map((log) => {
              const date = log.loggedAt?.toDate
                ? log.loggedAt.toDate()
                : new Date(log.date ?? log.loggedAt);
              return (
                <div key={log.id} className="card flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{log.name}</p>
                    <p className="text-gray-400 text-sm">{formatLongDate(date)}</p>
                  </div>
                  {log.durationMinutes > 0 && (
                    <span className="text-indigo-400 text-sm shrink-0">{log.durationMinutes} min</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
