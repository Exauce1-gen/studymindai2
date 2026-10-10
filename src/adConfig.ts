// Lien direct Monetag
export const MONETAG_LINK = 'https://uplcm.com/4/11986460';

// Majeur selon la date de naissance du profil. Date inconnue → false (choix prudent).
export function isAdult(dateOfBirth?: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 18;
}
