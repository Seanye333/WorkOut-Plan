import { useState } from "react";
import { useTemplates } from "../hooks/useTemplates";
import TemplateForm from "../components/templates/TemplateForm";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";

export default function TemplatesPage() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd(data) {
    setSaving(true);
    await addTemplate(data);
    setSaving(false);
    setShowAdd(false);
  }

  async function handleUpdate(data) {
    setSaving(true);
    await updateTemplate(editing.id, data);
    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(t) {
    if (window.confirm(`Delete template "${t.name}"?`)) {
      await deleteTemplate(t.id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workout Templates</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + New Template
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium text-gray-400">No templates yet</p>
          <p className="text-sm mt-1">Create a reusable workout routine.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card hover:border-gray-700 transition-colors flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white">{t.name}</h3>
                  {t.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{t.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(t)} className="text-gray-400 hover:text-indigo-400 transition-colors p-1" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(t)} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Delete">🗑️</button>
                </div>
              </div>
              {t.exercises?.length > 0 && (
                <div className="flex flex-col gap-1">
                  {t.exercises.slice(0, 4).map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{ex.exerciseName}</span>
                      <span className="text-gray-500 text-xs">{ex.sets}×{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}${ex.weightUnit}` : ""}</span>
                    </div>
                  ))}
                  {t.exercises.length > 4 && (
                    <p className="text-gray-500 text-xs">+{t.exercises.length - 4} more</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="New Template" onClose={() => setShowAdd(false)}>
          <TemplateForm onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Template" onClose={() => setEditing(null)}>
          <TemplateForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} loading={saving} />
        </Modal>
      )}
    </div>
  );
}
