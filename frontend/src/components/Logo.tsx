export function Mark({ size = 28, color = "currentColor", title }: { size?: number; color?: string; title?: string }) {
  return (
    <svg
      width={(size * 193) / 144}
      height={size}
      viewBox="0 0 193 144"
      fill={color}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M0 0h35l43 87 43-87h35L85 143H71z" />
      <rect x="158" y="109" width="35" height="35" rx="5" />
    </svg>
  );
}

export function Wordmark({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color }} aria-label="Velo">
      Velo
    </span>
  );
}

export function Logo({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <span className="logo" style={{ color }}>
      <Mark size={size} />
      <Wordmark size={size * 0.95} />
    </span>
  );
}
