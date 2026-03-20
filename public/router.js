// router.js - Script de routage intelligent
// Ce script détecte si l'utilisateur doit voir la landing ou l'app

(function() {
  // Fonction pour vérifier si l'utilisateur est connecté
  async function isUserAuthenticated() {
    try {
      // Vérifier la session Supabase
      const response = await fetch('https://josrvfcyweohpkfhfjbg.supabase.co/auth/v1/user', {
        headers: {
          'apikey': 'votre_supabase_anon_key',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return !!data.id;
      }
      return false;
    } catch {
      // Alternative : vérifier localStorage
      return !!(
        localStorage.getItem('supabase.auth.token') || 
        localStorage.getItem('sb-josrvfcyweohpkfhfjbg-auth-token')
      );
    }
  }

  // Fonction principale de routage
  async function route() {
    const path = window.location.pathname;
    const isAuth = await isUserAuthenticated();

    // Si sur /landing, toujours montrer la landing
    if (path === '/landing' || path === '/landing.html') {
      return; // Reste sur la landing
    }

    // Si sur /app, toujours montrer l'app
    if (path === '/app' || path === '/app.html') {
      if (!isAuth) {
        // Pas connecté mais demande /app → rediriger vers connexion
        window.location.href = '/';
      }
      return;
    }

    // Si sur la racine /
    if (path === '/' || path === '/index.html') {
      if (!isAuth && !sessionStorage.getItem('visited')) {
        // Première visite, pas connecté → montrer landing
        sessionStorage.setItem('visited', 'true');
        window.location.href = '/landing';
      }
      // Sinon montrer l'app (React se charge normalement)
    }
  }

  // Exécuter au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', route);
  } else {
    route();
  }
})();
