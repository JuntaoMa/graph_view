const BASE_COLORS = [
  '#64748B',
  '#F59E0B',
  '#22C55E',
  '#3B82F6',
  '#A855F7',
  '#F97316',
  '#14B8A6',
  '#EF4444',
  '#0EA5E9',
  '#84CC16',
];

const FALLBACK_COLOR = '#64748B';

function hashToColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 52%)`;
}

export function buildTypePalette(types: string[]) {
  const sorted = [...new Set(types)].sort((a, b) => a.localeCompare(b));
  const palette: Record<string, string> = {};
  sorted.forEach((type, index) => {
    palette[type] = BASE_COLORS[index] ?? hashToColor(type);
  });
  return palette;
}

export function getTypeColor(type: string | undefined, palette: Record<string, string>) {
  if (!type) return FALLBACK_COLOR;
  return palette[type] ?? hashToColor(type);
}

export const relationPalette: Record<string, string> = {
  'IS A': '#22C55E',
  'WORKS IN': '#F59E0B',
  DIRECTED: '#64748B',
  'STARRED IN': '#3B82F6',
};
