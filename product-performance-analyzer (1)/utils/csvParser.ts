// A lightweight CSV parser sufficient for standard Google Ads exports
export const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r?\n/);
  const result: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let inQuotes = false;
    let currentToken = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      const nextChar = line[charIndex + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentToken += '"';
          charIndex++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of cell
        row.push(currentToken);
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    row.push(currentToken);
    result.push(row);
  }
  return result;
};
