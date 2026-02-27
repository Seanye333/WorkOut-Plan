import { useEffect, useState } from "react";
import { useWorkoutLog } from "../hooks/useWorkoutLog";
import { useExercises } from "../hooks/useExercises";
import { exportWorkoutsToExcel } from "../utils/exportToExcel";
import Spinner from "../components/common/Spinner";
import { formatLongDate } from "../utils/dateHelpers";

function LogEntry({ log }) {
  const [expanded, setExpanded] = useState(false);
  const date = log.loggedAt?.toDate
    ? log.loggedAt.toDate()
    : new Date(log.date ?? log.loggedAt);

  return (
    <div className="card">
      <button
        className="w-full text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-white">{log.name}</p>
            <p className="text-gray-400 text-sm">{formatLongDate(date)}</p>
          </div>
          <div className="text-right shrink-0">
            {log.durationMinutes > 0 && (
              <p className="text-indigo-400 text-sm font-medium">{log.durationMinutes} min</p>
            )}
            <p className="text-gray-500 text-xs">
              {log.exercises?.length ?? 0} exercise{log.exercises?.length !== 1 ? "s" : ""}
            </p>
            <span className="text-gray-600 text-xs">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-800 pt-4">
          {log.exercises?.map((ex, i) => (
            <div key={i}>
              <p className="font-medium text-gray-200 text-sm mb-1">{ex.exerciseName}</p>
              <div className="flex flex-wrap gap-2">
                {ex.sets?.map((s, si) => (
                  <span
                    key={si}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      s.completed
                        ? "bg-green-900/30 border-green-800 text-green-300"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    }`}
                  >
                    {s.reps} reps{s.weight > 0 ? ` @ ${s.weight}${s.weightUnit}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {log.notes && (
            <p className="text-gray-400 text-sm italic border-t border-gray-800 pt-3">
              "{log.notes}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { logs, loading, hasMore, loadMore, refresh, fetchAllLogs } = useWorkoutLog();
  const { exercises } = useExercises();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const allLogs = await fetchAllLogs();
      exportWorkoutsToExcel(allLogs, exercises);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workout History</h1>
        {logs.length > 0 && (
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              "Exporting…"
            ) : (
              <>
                <span>⬇</span> Export Excel
              </>
            )}
          </button>
        )}
      </div>

      {loading && logs.length === 0 ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-lg font-medium text-gray-400">No workouts logged yet</p>
          <p className="text-sm mt-1">
            Schedule a workout and hit "Log" to track your progress.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}

          {hasMore && (
            <button
              className="btn-secondary w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
