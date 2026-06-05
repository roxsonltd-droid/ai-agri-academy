export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: "#06101c", // a bit lighter and fresher than pure dark slate
        backgroundImage: 
          "radial-gradient(circle at 20% 0%, rgba(16, 185, 129, 0.25), transparent 50%), " +
          "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.2), transparent 50%), " +
          "radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.15), transparent 50%)",
      }}
      aria-hidden
    >
      {/* Subtle modern grid overlay for structure */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
    </div>
  );
}
