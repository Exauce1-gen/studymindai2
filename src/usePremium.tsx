import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export function usePremium() {
  const { userProfile } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setIsPremium(userProfile.is_premium || false);
      setLoading(false);
    }
  }, [userProfile]);

  return { isPremium, loading };
}
