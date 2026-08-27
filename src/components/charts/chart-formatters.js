export function intFmt(value) {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat().format(value);
}

export function percentFmt(value, decimals = 0) {
  if (value === undefined || value === null) return "0%";
  return `${Number(value).toFixed(decimals)}%`;
}

export function compactFmt(value) {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}
