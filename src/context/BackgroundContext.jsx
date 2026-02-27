import { createContext, useContext, useState } from "react";

const BackgroundContext = createContext(null);

const STORAGE_KEY = "wp_background";
const OPACITY_KEY = "wp_bg_opacity";

export function BackgroundProvider({ children }) {
  const [bgUrl, setBgUrl] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [opacity, setOpacity] = useState(() =>
    parseFloat(localStorage.getItem(OPACITY_KEY) ?? "0.15")
  );

  function saveBackground(url, op) {
    setBgUrl(url);
    setOpacity(op);
    localStorage.setItem(STORAGE_KEY, url);
    localStorage.setItem(OPACITY_KEY, String(op));
  }

  function clearBackground() {
    setBgUrl("");
    setOpacity(0.15);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OPACITY_KEY);
  }

  return (
    <BackgroundContext.Provider value={{ bgUrl, opacity, saveBackground, clearBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}
