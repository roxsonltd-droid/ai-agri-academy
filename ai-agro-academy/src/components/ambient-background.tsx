/**
 * Global decorative layers: floating blurred gradients, glowing orbs,
 * subtle drifting “particles”, and a light glass veil. All pointer-events: none.
 */
export function AmbientBackground() {
  return (
    <div
      className="ambient-site-root"
      aria-hidden
    >
      <div className="ambient-blobs">
        <div className="ambient-blob ambient-blob--a" />
        <div className="ambient-blob ambient-blob--b" />
        <div className="ambient-blob ambient-blob--c" />
      </div>
      <div className="ambient-orbs">
        <span className="ambient-orb ambient-orb--1" />
        <span className="ambient-orb ambient-orb--2" />
        <span className="ambient-orb ambient-orb--3" />
      </div>
      <div className="ambient-particles" />
      <div className="ambient-glass-veil" />
    </div>
  );
}
