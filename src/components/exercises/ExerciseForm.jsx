import { useState } from "react";
import { MUSCLE_GROUPS, WEIGHT_UNITS } from "../../utils/constants";

const defaults = {
  name: "",
  muscleGroup: "Chest",
  description: "",
  defaultSets: 3,
  defaultReps: 10,
  defaultWeight: 0,
  weightUnit: "kg",
};

export default function ExerciseForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ ...defaults, ...initial });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const setNum = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: Number(e.target.value) }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      defaultSets: Number(form.defaultSets),
      defaultReps: Number(form.defaultReps),
      defaultWeight: Number(form.defaultWeight),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="label">Exercise Name *</label>
        <input
          className="input"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Barbell Squat"
          required
        />
      </div>

      <div>
        <label className="label">Muscle Group</label>
        <select className="input" value={form.muscleGroup} onChange={set("muscleGroup")}>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Description (optional)</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={form.description}
          onChange={set("description")}
          placeholder="Notes about form, variations, etc."
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Default Sets</label>
          <input type="number" min={1} max={20} className="input" value={form.defaultSets} onChange={setNum("defaultSets")} />
        </div>
        <div>
          <label className="label">Default Reps</label>
          <input type="number" min={1} max={100} className="input" value={form.defaultReps} onChange={setNum("defaultReps")} />
        </div>
        <div>
          <label className="label">Default Weight</label>
          <input type="number" min={0} step={0.5} className="input" value={form.defaultWeight} onChange={setNum("defaultWeight")} />
        </div>
      </div>

      <div>
        <label className="label">Weight Unit</label>
        <div className="flex gap-3">
          {WEIGHT_UNITS.map((u) => (
            <label key={u} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="weightUnit"
                value={u}
                checked={form.weightUnit === u}
                onChange={set("weightUnit")}
                className="accent-indigo-500"
              />
              <span className="text-sm text-gray-300">{u}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save Exercise"}
        </button>
      </div>
    </form>
  );
}
