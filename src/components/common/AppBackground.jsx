import { useBackground } from "../../hooks/useBackground";

export default function AppBackground({ children }) {
  const { bgUrl, opacity } = useBackground();

  if (!bgUrl) return <>{children}</>;

  return (
    <div className="relative min-h-screen">
      {/* Background image layer */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgUrl})`,
          opacity,
          zIndex: 0,
        }}
      />
      {/* Dark base so text always readable */}
      <div className="fixed inset-0 bg-gray-950/80" style={{ zIndex: 1 }} />
      {/* Content on top */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
