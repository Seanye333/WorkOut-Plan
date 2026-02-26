import { useState } from "react";
import { useExercises } from "../hooks/useExercises";
import ExerciseCard from "../components/exercises/ExerciseCard";
import ExerciseForm from "../components/exercises/ExerciseForm";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import { MUSCLE_GROUPS } from "../utils/constants";

export default function ExerciseLibraryPage() {
  const { exercises, loading, addExercise, updateExercise, deleteExercise } = useExercises();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  async function handleAdd(data) {
    setSaving(true);
    await addExercise(data);
    setSaving(false);
    setShowAdd(false);
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this exercise?")) {
      await deleteExercise(id);
    }
  }

  const filtered = exercises.filter((ex) => {
    const matchesGroup = filter === "All" || ex.muscleGroup === filter;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + Add Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input sm:max-w-xs"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input sm:max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All muscle groups</option>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-lg font-medium text-gray-400">No exercises yet</p>
          <p className="text-sm mt-1">Add your first exercise to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onUpdate={updateExercise}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Exercise" onClose={() => setShowAdd(false)}>
          <ExerciseForm
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
