import { useState } from 'react';
import { useAuth } from './AuthContext';

const GRADES = [
  '6ème', '5ème', '4ème', '3ème',
  'Seconde', 'Première', 'Terminale',
  'Université', 'Autre'
];

const SUBJECTS = [
  'Mathématiques', 'Physique-Chimie', 'SVT',
  'Français', 'Histoire-Géographie', 'Anglais',
  'Espagnol', 'Philosophie', 'Économie',
  'Informatique', 'Arts', 'Sport'
];

export default function OnboardingPage() {
  const { updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [grade, setGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!firstName || !lastName)) {
      alert('Veuillez entrer votre nom et prénom');
      return;
    }
    if (step === 2 && (!age || !gender)) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    if (step === 3 && !grade) {
      alert('Veuillez sélectionner votre classe');
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (selectedSubjects.length < 3) {
      alert('Sélectionne au moins 3 matières');
      return;
    }

    try {
      setLoading(true);
      
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        age: parseInt(age) || 0,
        gender: gender || '',
        grade: grade || '',
        subjects: selectedSubjects,
        onboarding_completed: true
      };

      console.log('Sauvegarde du profil:', profileData);
      
      await updateUserProfile(profileData);
      
      // Si on arrive ici, la sauvegarde a réussi
      console.log('Profil sauvegardé avec succès !');
      
    } catch (error: any) {
      console.error('Erreur complète:', error);
      setLoading(false);
      
      // Message d'erreur plus détaillé
      const errorMsg = error?.message || error?.error_description || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde: ${errorMsg}\n\nRéessayez ou rechargez la page.`);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: 40,
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Progress bar */}
        <div style={{marginBottom: 32}}>
          <div style={{
            height: 6,
            background: '#e0e0e0',
            borderRadius: 10,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6C5CE7, #8b5cf6)',
              width: `${progress}%`,
              transition: 'width 0.3s'
            }}/>
          </div>
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: 13,
            marginTop: 12,
            fontWeight: 600
          }}>
            Étape {step} sur 4
          </p>
        </div>

        {/* Step 1: Nom et Prénom */}
        {step === 1 && (
          <div>
            <h2 style={{fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8}}>
              👋 Bienvenue !
            </h2>
            <p style={{color: '#666', marginBottom: 32, lineHeight: 1.6}}>
              Pour commencer, dis-nous comment tu t'appelles
            </p>

            <div style={{marginBottom: 20}}>
              <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8}}>
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Ex: Marie"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#6C5CE7'}
                onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{marginBottom: 20}}>
              <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8}}>
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Ex: Dubois"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#6C5CE7'}
                onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>
        )}

        {/* Step 2: Âge et Genre */}
        {step === 2 && (
          <div>
            <h2 style={{fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8}}>
              📊 Quelques infos
            </h2>
            <p style={{color: '#666', marginBottom: 32, lineHeight: 1.6}}>
              Cela nous aide à personnaliser ton expérience
            </p>

            <div style={{marginBottom: 20}}>
              <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8}}>
                Âge
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Ex: 15"
                min="10"
                max="99"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#6C5CE7'}
                onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div>
              <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 12}}>
                Genre
              </label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
                {[
                  ['male', '👨 Homme'],
                  ['female', '👩 Femme'],
                  ['other', '🌈 Autre']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGender(value as any)}
                    style={{
                      padding: '14px 12px',
                      border: gender === value ? '2px solid #6C5CE7' : '2px solid #e0e0e0',
                      borderRadius: 12,
                      background: gender === value ? 'rgba(108,92,231,0.1)' : '#fff',
                      color: gender === value ? '#6C5CE7' : '#666',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Classe */}
        {step === 3 && (
          <div>
            <h2 style={{fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8}}>
              🎓 Ta classe
            </h2>
            <p style={{color: '#666', marginBottom: 24, lineHeight: 1.6}}>
              Sélectionne ta classe actuelle
            </p>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
              {GRADES.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  style={{
                    padding: '14px 16px',
                    border: grade === g ? '2px solid #6C5CE7' : '2px solid #e0e0e0',
                    borderRadius: 12,
                    background: grade === g ? 'rgba(108,92,231,0.1)' : '#fff',
                    color: grade === g ? '#6C5CE7' : '#666',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Matières */}
        {step === 4 && (
          <div>
            <h2 style={{fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8}}>
              📚 Tes matières
            </h2>
            <p style={{color: '#666', marginBottom: 24, lineHeight: 1.6}}>
              Sélectionne tes matières préférées (au moins 3)
            </p>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: '12px 14px',
                    border: selectedSubjects.includes(subject) ? '2px solid #6C5CE7' : '2px solid #e0e0e0',
                    borderRadius: 10,
                    background: selectedSubjects.includes(subject) ? 'rgba(108,92,231,0.1)' : '#fff',
                    color: selectedSubjects.includes(subject) ? '#6C5CE7' : '#666',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  {selectedSubjects.includes(subject) ? '✓ ' : ''}{subject}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{display: 'flex', gap: 12, marginTop: 32}}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: 12,
                background: '#fff',
                color: '#666',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ← Retour
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={loading || (step === 4 && selectedSubjects.length < 3)}
            style={{
              flex: step > 1 ? 1 : undefined,
              width: step === 1 ? '100%' : undefined,
              padding: '14px 20px',
              border: 'none',
              borderRadius: 12,
              background: loading || (step === 4 && selectedSubjects.length < 3) ? '#ccc' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading || (step === 4 && selectedSubjects.length < 3) ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(108,92,231,0.4)'
            }}
          >
            {loading ? '⏳ Enregistrement...' : step === 4 ? '✨ Commencer à apprendre' : 'Suivant →'}
          </button>
        </div>

        {step === 4 && selectedSubjects.length < 3 && (
          <p style={{textAlign: 'center', color: '#999', fontSize: 12, marginTop: 12}}>
            Sélectionne au moins 3 matières pour continuer
          </p>
        )}
      </div>
    </div>
  );
}
