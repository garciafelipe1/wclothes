/**
 * Mapeo de nombres de color a valor CSS para swatches en filtros.
 */
export const COLOR_SWATCHES: Record<string, string> = {
  Negro: "#1a1a1a",
  Blanco: "#ffffff",
  Gris: "#9ca3af",
  Castaño: "#92400e",
  Flamenco: "#c2410c",
  "Azul marino": "#1e3a8a",
  Rayas: "linear-gradient(135deg, #1a1a1a 50%, #fff 50%)",
  Crudo: "#f5f5dc",
  Natural: "#faf5e6",
  Amarillo: "#facc15",
  Azul: "#3b82f6",
  Beige: "#d4b896",
  Caqui: "#c3b091",
  Rojo: "#dc2626",
  Rosa: "#f472b6",
  Verde: "#22c55e",
}

export function getColorSwatch(colorName: string): string {
  return COLOR_SWATCHES[colorName] ?? "#e5e7eb"
}
