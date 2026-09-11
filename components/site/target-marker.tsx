export function TargetMarker({ locked = false }: { locked?: boolean }) {
  return (
    <div
      className={`target-marker ${locked ? 'locked' : ''}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
      <b />
      <span className="target-crosshair" />
      <span className="target-brackets">
        <em />
        <em />
        <em />
        <em />
      </span>
    </div>
  );
}
