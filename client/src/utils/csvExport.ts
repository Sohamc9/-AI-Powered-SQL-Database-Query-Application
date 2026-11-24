/**
 * RFC 4180 compliant CSV export utility
 */
export function exportToCsv(
  filename: string,
  columns: string[],
  rows: Record<string, any>[]
): void {
  if (!columns.length || !rows.length) {
    return;
  }

  // Format header row
  const header = columns
    .map(col => `"${String(col).replace(/"/g, '""')}"`)
    .join(',');

  // Format data rows
  const dataRows = rows.map(row => {
    return columns
      .map(col => {
        const val = row[col];
        if (val === null || val === undefined) {
          return '';
        }
        if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        const strVal = String(val);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return `"${strVal}"`;
      })
      .join(',');
  });

  const csvContent = [header, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
