export function toCapital(name: string | null | undefined) {
  if (!name || !name.trim()) return '';

  const trimmed = name.trim();
  const [first, ...rest] = trimmed;

  return first.toUpperCase() + rest.join('').toLowerCase();
}

export function formatSentenceCase(name: string | null | undefined): string {
  if (!name || !name.trim()) return '—';

  const trimmed = name.trim().replace(/\s+/g, ' ');

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatStrictUpper(name: string | null | undefined): string {
  if (!name || !name.trim()) return '—';
  return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function cleanSpaces(name: string | null | undefined): string {
  if (!name || !name.trim()) return '—';
  return name.trim().replace(/\s+/g, ' ');
}
