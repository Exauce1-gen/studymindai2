import { useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './AuthContext';

const grades = [
  { id: '6eme', name: '6ème' },
  { id: '5eme', name: '5ème' },
  { id: '4eme', name: '4ème' },
  { id: '3eme', name: '3ème' },
  { id: 'seconde', name: 'Seconde' },
  { id: 'premiere', name: 'Première' },
  { id: 'terminale', name: 'Terminale' },
  { id: 'superieur', name: 'Études supérieures' }
];

const availableSubjects = [
  '📐 Mathématiques',
  '⚗️ Physique-Chimie',
  '🧬 SVT',
  '🌍 Histoire-Géographie',
  '📚 Français',
  '🗣️ Anglais',
  '🇪🇸 Espagnol',
  '🇩🇪 Allemand',
  '🤔 Philosophie',
  '💼 Économie',
  '💻 Informatique',
  '🎨 Arts'
];

export default function SettingsPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();

  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile?.date_of_birth || '');
  const [grade, setGrade] = useState(userProfile?.grade || '');
  const [subjects, setSubjects] = useState<string[]>(userProfile?.subjects || []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const toggleSubject = (subject: string) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const canSave = firstName.trim() && dateOfBirth && grade && subjects.length >= 3;

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaved(false);

    if (!canSave) {
      setError('Merci de remplir tous les champs et de sélectionner au moins 3 matières.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          date_of_birth: dateOfBirth,
          grade: grade,
          subjects: subjects
        })
        .eq('id', user.id);

      if (updateError) {
        setError(`Erreur: ${updateError.message}`);
        setSaving(false);
        return;
      }

      await refreshUserProfile();
      setSaved(true);
      setSaving(false);

      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      color: '#e8e8f8',
      fontFamily: 'system-ui',
      padding: '80px 20px 60px'
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        background: '#0e0e1d',
        border: '1px solid #333',
        borderRadius: 20,
        padding: 40
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 70,
            height: 70,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            margin: '0 auto 14px'
          }}>
            ⚙️
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e8f8', marginBottom: 6 }}>
            Paramètres du compte
          </h1>
          <p style={{ color: '#888', fontSize: 14 }}>
            Modifiez vos informations personnelles
          </p>
        </div>

        {/* Email (lecture seule) */}
        <label style={{ display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8 }}>
          Email
        </label>
        <div style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          border: '1px solid #333',
          background: '#1a1a2e',
          color: '#666',
          fontSize: 15,
          marginBottom: 20
        }}>
          {user?.email}
        </div>

        {/* Prénom */}
        <label style={{ display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8 }}>
          Prénom
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Entrez votre prénom"
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 15,
            outline: 'none',
            marginBottom: 20,
            boxSizing: 'border-box'
          }}
        />

        {/* Date de naissance */}
        <label style={{ display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8 }}>
          Date de naissance
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 15,
            outline: 'none',
            marginBottom: 24,
            boxSizing: 'border-box'
          }}
        />

        {/* Classe */}
        <label style={{ display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8 }}>
          Classe
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
          {grades.map(g => (
            <button
              key={g.id}
              onClick={() => setGrade(g.id)}
              style={{
                padding: 14,
                borderRadius: 12,
                border: grade === g.id ? '2px solid #6C5CE7' : '1px solid #333',
                background: grade === g.id ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                color: grade === g.id ? '#6C5CE7' : '#aaa',
                fontSize: 14,
                fontWeight: grade === g.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Matières */}
        <label style={{ display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8 }}>
          Matières préférées (minimum 3)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 8 }}>
          {availableSubjects.map(subject => (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              style={{
                padding: 14,
                borderRadius: 12,
                border: subjects.includes(subject) ? '2px solid #6C5CE7' : '1px solid #333',
                background: subjects.includes(subject) ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                color: subjects.includes(subject) ? '#6C5CE7' : '#aaa',
                fontSize: 14,
                fontWeight: subjects.includes(subject) ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              {subject}
            </button>
          ))}
        </div>
        <div style={{
          fontSize: 13,
          color: subjects.length >= 3 ? '#00b894' : '#fd79a8',
          marginBottom: 24
        }}>
          {subjects.length} / 3 matières minimum
        </div>

        {error && (
          <div style={{
            padding: 12,
            background: 'rgba(253,121,168,0.1)',
            border: '1px solid #fd79a8',
            borderRadius: 8,
            color: '#fd79a8',
            fontSize: 14,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{
            padding: 12,
            background: 'rgba(0,184,148,0.1)',
            border: '1px solid #00b894',
            borderRadius: 8,
            color: '#00b894',
            fontSize: 14,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            ✅ Modifications enregistrées !
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            background: saving ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
