export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(n);

export function timeAgo(iso) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  for (const [name, size] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${name}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}
