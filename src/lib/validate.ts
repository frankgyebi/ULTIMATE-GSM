export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function nameError(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Tell us your name.";
  if (trimmed.length < 2) return "A bit longer, please.";
  if (trimmed.length > 80) return "That name is too long.";
  if (!/^[\p{L}\s'.-]+$/u.test(trimmed)) return "Use letters, spaces, and hyphens.";
  return null;
}

export function phoneError(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Add a phone number so we can reach you.";
  if (!/^[0-9+\s()-]+$/.test(trimmed)) return "Use digits, spaces, and + only.";
  const digits = digitsOnly(trimmed);
  if (digits.length < 7) return "That number looks short. Include the full phone number.";
  if (digits.length > 15) return "That number looks too long.";
  return null;
}

export function emailError(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 160) return "That email is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Check the email, or leave it blank.";
  return null;
}

export function isYmd(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function todayYmd(now = new Date()) {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
}

export function parseYmd(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
