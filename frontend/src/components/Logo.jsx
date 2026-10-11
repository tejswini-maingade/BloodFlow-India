// Original logo: a blood droplet with a pulse line. Uses currentColor so CSS controls the colour.
export default function Logo({ size = 28 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.2c3.4 4.3 6.2 7.6 6.2 11.2a6.2 6.2 0 0 1-12.4 0c0-3.6 2.8-6.9 6.2-11.2z"
        fill="currentColor"
      />
      <path
        d="M7.6 13.6h2.3l1.3-2.6 1.9 5 1.4-2.4h2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
