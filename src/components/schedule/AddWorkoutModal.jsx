import { useState } from "react";
import { useTemplates } from "../../hooks/useTemplates";

export default function AddWorkoutModal({ onAdd, onClose }) {
  const { templates } = useTemplates();
  const [tab, setTab] = useState("template"); // "template" | "adhoc"
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customName, setCustomName] = useState("");

  function handleAdd() {
    if (tab === "template" && selectedTemplate) {
      onAdd({
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        customName: null,
        exercises: selectedTemplate.exercises ?? [],
        isCompleted: false,
        scheduledAt: new Date().toISOString(),
      });
    } else if (tab === "adhoc" && customName.trim()) {
      onAdd({
        templateId: null,
        templateName: null,
        customName: customName.trim(),
        exercises: [],
        isCompleted: false,
        scheduledAt: new Date().toISOString(),
      });
    }
    onClose();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab */}
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setTab("template")}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "template" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          From Template
        </button>
        <button
          onClick={() => setTab("adhoc")}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "adhoc" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Custom Name
        </button>
      </div>

      {tab === "template" ? (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No templates yet. Create one in the Templates page.
            </p>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  selectedTemplate?.id === t.id
                    ? "border-indigo-500 bg-indigo-900/30"
                    : "border-gray-700 hover:border-gray-600 bg-gray-800"
                }`}
              >
                <p className="font-medium text-white text-sm">{t.name}</p>
                {t.exercises?.length > 0 && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {t.exercises.length} exercise{t.exercises.length !== 1 ? "s" : ""}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      ) : (
        <div>
          <label className="label">Workout Name</label>
          <input
            className="input"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Morning Run, Stretching…"
            autoFocus
          />
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className="btn-primary"
          onClick={handleAdd}
          disabled={
            (tab === "template" && !selectedTemplate) ||
            (tab === "adhoc" && !customName.trim())
          }
        >
          Add to Schedule
        </button>
      </div>
    </div>
  );
}
