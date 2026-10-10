// Lien direct Monetag
export const MONETAG_LINK = 'https://uplcm.com/4/11986460';

// Âge minimal atteint selon la date de naissance du profil.
// Date inconnue ou invalide → false (choix prudent : on ne montre rien).
export function isAtLeast(dateOfBirth: string | undefined, minAge: number): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= minAge;
}

export const isAdult = (dateOfBirth?: string) => isAtLeast(dateOfBirth, 18);
