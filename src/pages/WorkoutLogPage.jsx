import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWorkoutLog } from "../hooks/useWorkoutLog";
import { useSchedule } from "../hooks/useSchedule";
import { formatLongDate } from "../utils/dateHelpers";

function buildInitialSets(exercise) {
  return Array.from({ length: exercise.sets || 3 }, (_, i) => ({
    setNumber: i + 1,
    reps: exercise.reps || 10,
    weight: exercise.weight || 0,
    weightUnit: exercise.weightUnit || "kg",
    completed: false,
  }));
}

export default function WorkoutLogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createLog } = useWorkoutLog();
  const { updateWorkoutInDay } = useSchedule(new Date());

  const stateWorkout = location.state?.workout;
  const dayKey = location.state?.dayKey;
  const workoutIndex = location.state?.workoutIndex;

  const [workoutName] = useState(
    stateWorkout?.templateName ?? stateWorkout?.customName ?? "Workout"
  );

  const [exercises, setExercises] = useState(() => {
    if (!stateWorkout?.exercises?.length) return [];
    return stateWorkout.exercises.map((ex) => ({
      ...ex,
      sets: buildInitialSets(ex),
    }));
  });

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  function updateSet(exIdx, setIdx, field, value) {
    setExercises((prev) =>
      prev.map((ex, ei) =>
        ei !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si !== setIdx ? s : { ...s, [field]: field === "completed" ? value : Number(value) }
              ),
            }
      )
    );
  }

  function addSet(exIdx) {
    setExercises((prev) =>
      prev.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNumber: ex.sets.length + 1,
              reps: last?.reps ?? 10,
              weight: last?.weight ?? 0,
              weightUnit: last?.weightUnit ?? "kg",
              completed: false,
            },
          ],
        };
      })
    );
  }

  function removeSet(exIdx, setIdx) {
    setExercises((prev) =>
      prev.map((ex, ei) =>
        ei !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx).map((s, si) => ({ ...s, setNumber: si + 1 })) }
      )
    );
  }

  async function handleFinish() {
    setSaving(true);
    const logData = {
      name: workoutName,
      date: new Date().toISOString(),
      templateId: stateWorkout?.templateId ?? null,
      templateName: stateWorkout?.templateName ?? null,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId ?? null,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
      })),
      durationMinutes: Math.round(elapsed / 60),
      notes: notes.trim(),
    };

    await createLog(logData);

    if (dayKey !== undefined && workoutIndex !== undefined) {
      await updateWorkoutInDay(dayKey, workoutIndex, { isCompleted: true });
    }

    navigate("/history");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{workoutName}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{formatLongDate(new Date())}</p>
        </div>
        <div className="text-right">
          <p className="text-indigo-400 font-mono text-xl font-bold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="text-gray-500 text-xs">elapsed</p>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">
          <p>No exercises in this workout.</p>
          <p className="text-sm mt-1">Add exercises via Templates to log sets & reps.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="card">
              <h3 className="font-bold text-white mb-3">{ex.exerciseName}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase">
                      <th className="text-left pb-2 w-8">Set</th>
                      <th className="text-center pb-2">Reps</th>
                      <th className="text-center pb-2">Weight ({ex.sets[0]?.weightUnit ?? "kg"})</th>
                      <th className="text-center pb-2">Done</th>
                      <th className="w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {ex.sets.map((set, setIdx) => (
                      <tr key={setIdx} className={set.completed ? "opacity-60" : ""}>
                        <td className="py-2 text-gray-400 text-xs">{set.setNumber}</td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min={0}
                            className="input text-center py-1 px-2 text-sm"
                            value={set.reps}
                            onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className="input text-center py-1 px-2 text-sm"
                            value={set.weight}
                            onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-indigo-500 cursor-pointer"
                            checked={set.completed}
                            onChange={(e) => updateSet(exIdx, setIdx, "completed", e.target.checked)}
                          />
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => removeSet(exIdx, setIdx)}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => addSet(exIdx)}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add Set
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <label className="label">Notes (optional)</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel? Any PRs?"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button className="btn-secondary flex-1" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button
          className="btn-primary flex-1"
          onClick={handleFinish}
          disabled={saving}
        >
          {saving ? "Saving…" : "Finish Workout"}
        </button>
      </div>
    </div>
  );
}
