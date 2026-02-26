import { useNavigate } from "react-router-dom";

export default function WorkoutCard({ workout, dayKey, workoutIndex, onMarkComplete, onRemove }) {
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        workout.isCompleted
          ? "bg-green-900/20 border-green-800/50"
          : "bg-gray-800 border-gray-700 hover:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${workout.isCompleted ? "text-green-300" : "text-white"}`}>
            {workout.isCompleted && "✓ "}
            {workout.templateName ?? workout.customName ?? "Workout"}
          </p>
          {workout.exercises?.length > 0 && (
            <p className="text-gray-500 text-xs mt-0.5">
              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {!workout.isCompleted && (
            <button
              onClick={() =>
                navigate("/log", { state: { workout, dayKey, workoutIndex } })
              }
              className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-2 py-1 rounded transition-colors"
              title="Log workout"
            >
              Log
            </button>
          )}
          <button
            onClick={() => onRemove(workoutIndex)}
            className="text-gray-500 hover:text-red-400 transition-colors text-xs px-1"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
