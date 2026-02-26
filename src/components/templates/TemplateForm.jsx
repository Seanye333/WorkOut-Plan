import { useState } from "react";
import { useExercises } from "../../hooks/useExercises";

const blankExEntry = (ex) => ({
  exerciseId: ex.id,
  exerciseName: ex.name,
  sets: ex.defaultSets ?? 3,
  reps: ex.defaultReps ?? 10,
  weight: ex.defaultWeight ?? 0,
  weightUnit: ex.weightUnit ?? "kg",
  order: 0,
});

export default function TemplateForm({ initial = {}, onSave, onCancel, loading }) {
  const { exercises } = useExercises();
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [selectedExercises, setSelectedExercises] = useState(
    initial.exercises ?? []
  );
  const [exSearch, setExSearch] = useState("");

  const filteredLib = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(exSearch.toLowerCase()) &&
      !selectedExercises.some((s) => s.exerciseId === ex.id)
  );

  function addExercise(ex) {
    setSelectedExercises((prev) => [
      ...prev,
      { ...blankExEntry(ex), order: prev.length },
    ]);
    setExSearch("");
  }

  function removeExercise(idx) {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateField(idx, field, value) {
    setSelectedExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  }

  function moveUp(idx) {
    if (idx === 0) return;
    setSelectedExercises((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr.map((ex, i) => ({ ...ex, order: i }));
    });
  }

  function moveDown(idx) {
    if (idx === selectedExercises.length - 1) return;
    setSelectedExercises((prev) => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr.map((ex, i) => ({ ...ex, order: i }));
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      exercises: selectedExercises.map((ex, i) => ({
        ...ex,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        weight: Number(ex.weight),
        order: i,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label">Template Name *</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day A"
          required
        />
      </div>

      <div>
        <label className="label">Description (optional)</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes about this routine…"
        />
      </div>

      {/* Exercise picker */}
      <div>
        <label className="label">Add Exercises</label>
        <input
          className="input mb-2"
          placeholder="Search exercise library…"
          value={exSearch}
          onChange={(e) => setExSearch(e.target.value)}
        />
        {exSearch && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-h-40 overflow-y-auto">
            {filteredLib.length === 0 ? (
              <p className="text-gray-500 text-sm px-3 py-2">No exercises found</p>
            ) : (
              filteredLib.map((ex) => (
                <button
                  type="button"
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors text-sm text-gray-200 flex items-center justify-between"
                >
                  <span>{ex.name}</span>
                  <span className="text-xs text-gray-500">{ex.muscleGroup}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected exercises */}
      {selectedExercises.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label">Exercises in Template</p>
          {selectedExercises.map((ex, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{ex.exerciseName}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveUp(idx)} className="text-gray-400 hover:text-white text-xs px-1" disabled={idx === 0}>↑</button>
                  <button type="button" onClick={() => moveDown(idx)} className="text-gray-400 hover:text-white text-xs px-1" disabled={idx === selectedExercises.length - 1}>↓</button>
                  <button type="button" onClick={() => removeExercise(idx)} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Sets</label>
                  <input type="number" min={1} max={20} className="input text-sm py-1" value={ex.sets} onChange={(e) => updateField(idx, "sets", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Reps</label>
                  <input type="number" min={1} max={100} className="input text-sm py-1" value={ex.reps} onChange={(e) => updateField(idx, "reps", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Weight ({ex.weightUnit})</label>
                  <input type="number" min={0} step={0.5} className="input text-sm py-1" value={ex.weight} onChange={(e) => updateField(idx, "weight", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
          {loading ? "Saving…" : "Save Template"}
        </button>
      </div>
    </form>
  );
}
