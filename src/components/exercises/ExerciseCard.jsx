import { useState } from "react";
import Modal from "../common/Modal";
import ExerciseForm from "./ExerciseForm";

export default function ExerciseCard({ exercise, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(data) {
    setSaving(true);
    await onUpdate(exercise.id, data);
    setSaving(false);
    setEditing(false);
  }

  return (
    <>
      <div className="card hover:border-gray-700 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{exercise.name}</h3>
            <span className="inline-block text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full mt-1">
              {exercise.muscleGroup}
            </span>
            {exercise.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{exercise.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              {exercise.defaultSets} sets × {exercise.defaultReps} reps
              {exercise.defaultWeight > 0 && ` @ ${exercise.defaultWeight} ${exercise.weightUnit}`}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-gray-400 hover:text-indigo-400 transition-colors p-1"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(exercise.id)}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal title="Edit Exercise" onClose={() => setEditing(false)}>
          <ExerciseForm
            initial={exercise}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
            loading={saving}
          />
        </Modal>
      )}
    </>
  );
}
