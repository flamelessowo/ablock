export const russian_propaganda_keywords = [
  "Kremlin",
  "Putin",
  "Russia",
  "Russian",
  "moscow",
  "Soviet",
  "USSR",
  "KGB",
  "FSB",
  "GRU",
  "Oligarch",
  "DNR",
  "LNR",
  "Donbass",
  "Novorossiya",
  "Crimea",
]

export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
  const matrix = Array.from({ length: an + 1 }, (_, i) => [i]);
  for (let j = 1; j <= bn; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return matrix[an][bn];
}

