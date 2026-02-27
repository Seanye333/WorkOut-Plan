import { useState } from "react";
import Modal from "./Modal";
import { useBackground } from "../../hooks/useBackground";

export default function BackgroundSettings() {
  const { bgUrl, opacity, saveBackground, clearBackground } = useBackground();
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(bgUrl);
  const [opInput, setOpInput] = useState(opacity);

  function handleSave() {
    saveBackground(urlInput.trim(), opInput);
    setOpen(false);
  }

  function handleClear() {
    clearBackground();
    setUrlInput("");
    setOpInput(0.15);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => { setUrlInput(bgUrl); setOpInput(opacity); setOpen(true); }}
        className="text-gray-400 hover:text-white transition-colors p-1 text-lg"
        title="Background settings"
      >
        🖼️
      </button>

      {open && (
        <Modal title="Background Image" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-5">
            {/* Preview */}
            {urlInput && (
              <div
                className="w-full h-32 rounded-lg bg-cover bg-center border border-gray-700"
                style={{ backgroundImage: `url(${urlInput})` }}
              />
            )}

            {/* URL input */}
            <div>
              <label className="label">Image URL</label>
              <input
                className="input"
                placeholder="https://example.com/luffy-gear5.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Right-click any image on the web → "Copy image address" and paste it here.
              </p>
            </div>

            {/* Opacity / darkness slider */}
            <div>
              <label className="label">
                Image brightness —{" "}
                <span className="text-indigo-400">{Math.round(opInput * 100)}%</span>
                <span className="text-gray-500 text-xs ml-2">(lower = darker overlay)</span>
              </label>
              <input
                type="range"
                min={0.03}
                max={0.6}
                step={0.01}
                value={opInput}
                onChange={(e) => setOpInput(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>Very dark</span>
                <span>Bright</span>
              </div>
            </div>

            <div className="flex gap-3">
              {bgUrl && (
                <button className="btn-danger flex-1" onClick={handleClear}>
                  Remove Background
                </button>
              )}
              <button
                className="btn-primary flex-1"
                onClick={handleSave}
                disabled={!urlInput.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
