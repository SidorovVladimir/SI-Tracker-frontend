export function toCapital(name: string | null | undefined) {
  if (!name || !name.trim()) return '';

  const trimmed = name.trim();
  const [first, ...rest] = trimmed;

  return first.toUpperCase() + rest.join('').toLowerCase();
}
