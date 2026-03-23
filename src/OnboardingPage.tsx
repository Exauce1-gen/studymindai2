import { useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './AuthContext';

export default function OnboardingPage() {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  // Step 1: Infos personnelles
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Step 2: Niveau scolaire
  const [grade, setGrade] = useState('');
  
  // Step 3: Matières
  const [subjects, setSubjects] = useState<string[]>([]);

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

  const toggleSubject = (subject: string) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const handleFinish = async () => {
    if (!user) {
      setDebugInfo('❌ ERREUR: Pas d\'utilisateur connecté');
      return;
    }
    
    setLoading(true);
    setDebugInfo('🔄 Début de l\'enregistrement...');
    
    try {
      // Log des données
      const dataToUpdate = {
        first_name: firstName,
        date_of_birth: dateOfBirth,
        grade: grade,
        subjects: subjects,
        onboarding_completed: true
      };
      
      setDebugInfo(`📦 Données à enregistrer:\n${JSON.stringify(dataToUpdate, null, 2)}\n\n🔑 User ID: ${user.id}`);
      
      // Vérifier si l'utilisateur existe dans la table
      setDebugInfo(prev => prev + '\n\n🔍 Vérification de l\'utilisateur...');
      
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (selectError) {
        setDebugInfo(prev => prev + `\n\n❌ ERREUR SELECT: ${selectError.message}\nCode: ${selectError.code}\nDétails: ${JSON.stringify(selectError, null, 2)}`);
        
        // Si l'utilisateur n'existe pas, le créer
        if (selectError.code === 'PGRST116') {
          setDebugInfo(prev => prev + '\n\n📝 Utilisateur n\'existe pas, création...');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              ...dataToUpdate
            });
          
          if (insertError) {
            setDebugInfo(prev => prev + `\n\n❌ ERREUR INSERT: ${insertError.message}\nCode: ${insertError.code}\nDétails: ${JSON.stringify(insertError, null, 2)}`);
            setLoading(false);
            return;
          }
          
          setDebugInfo(prev => prev + '\n\n✅ Utilisateur créé avec succès !');
        } else {
          setLoading(false);
          return;
        }
      } else {
        setDebugInfo(prev => prev + `\n\n✅ Utilisateur trouvé: ${existingUser.email}`);
        
        // Mettre à jour l'utilisateur existant
        setDebugInfo(prev => prev + '\n\n🔄 Mise à jour du profil...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update(dataToUpdate)
          .eq('id', user.id);
        
        if (updateError) {
          setDebugInfo(prev => prev + `\n\n❌ ERREUR UPDATE: ${updateError.message}\nCode: ${updateError.code}\nDétails: ${JSON.stringify(updateError, null, 2)}`);
          setLoading(false);
          return;
        }
        
        setDebugInfo(prev => prev + '\n\n✅ Profil mis à jour avec succès !');
      }
      
      // Recharger la page
      setDebugInfo(prev => prev + '\n\n🔄 Rechargement de la page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      setDebugInfo(prev => prev + `\n\n❌ ERREUR CATCH: ${error.message}\n${JSON.stringify(error, null, 2)}`);
      setLoading(false);
    }
  };

  const canProceedStep1 = firstName.trim() && dateOfBirth;
  const canProceedStep2 = grade;
  const canFinish = subjects.length >= 3;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 600,
        background: '#0e0e1d',
        border: '1px solid #333',
        borderRadius: 20,
        padding: 40
      }}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 16px'
          }}>
            🧠
          </div>
          <h1 style={{fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8}}>
            Bienvenue sur Study<span style={{color: '#6C5CE7'}}>Mind</span> AI
          </h1>
          <p style={{color: '#888', fontSize: 14}}>
            Personnalisons votre expérience
          </p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 12,
            fontSize: 12,
            color: '#aaa',
            whiteSpace: 'pre-wrap',
            maxHeight: 300,
            overflowY: 'auto',
            fontFamily: 'monospace'
          }}>
            {debugInfo}
          </div>
        )}

        {/* Progress */}
        <div style={{display: 'flex', gap: 8, marginBottom: 32}}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1,
              height: 4,
              background: i <= step ? '#6C5CE7' : '#333',
              borderRadius: 2,
              transition: 'all 0.3s'
            }} />
          ))}
        </div>

        {/* Step 1: Infos personnelles */}
        {step === 1 && (
          <div>
            <h2 style={{fontSize: 22, fontWeight: 700, color: '#e8e8f8', marginBottom: 24}}>
              📝 Vos informations
            </h2>
            
            <label style={{display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8}}>
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
                marginBottom: 20
              }}
            />

            <label style={{display: 'block', color: '#aaa', fontSize: 14, marginBottom: 8}}>
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
                marginBottom: 24
              }}
            />

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: 'none',
                background: canProceedStep1 ? 'linear-gradient(135deg, #6C5CE7, #8b5cf6)' : '#444',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: canProceedStep1 ? 'pointer' : 'not-allowed'
              }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2: Niveau scolaire */}
        {step === 2 && (
          <div>
            <h2 style={{fontSize: 22, fontWeight: 700, color: '#e8e8f8', marginBottom: 24}}>
              🎓 Votre niveau scolaire
            </h2>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24}}>
              {grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: grade === g.id ? '2px solid #6C5CE7' : '1px solid #333',
                    background: grade === g.id ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                    color: grade === g.id ? '#6C5CE7' : '#aaa',
                    fontSize: 15,
                    fontWeight: grade === g.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div style={{display: 'flex', gap: 12}}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #333',
                  background: '#1a1a2e',
                  color: '#aaa',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                style={{
                  flex: 2,
                  padding: 16,
                  borderRadius: 12,
                  border: 'none',
                  background: canProceedStep2 ? 'linear-gradient(135deg, #6C5CE7, #8b5cf6)' : '#444',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: canProceedStep2 ? 'pointer' : 'not-allowed'
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Matières */}
        {step === 3 && (
          <div>
            <h2 style={{fontSize: 22, fontWeight: 700, color: '#e8e8f8', marginBottom: 8}}>
              📚 Vos matières
            </h2>
            <p style={{color: '#888', fontSize: 14, marginBottom: 24}}>
              Sélectionnez au moins 3 matières
            </p>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24}}>
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: subjects.includes(subject) ? '2px solid #6C5CE7' : '1px solid #333',
                    background: subjects.includes(subject) ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                    color: subjects.includes(subject) ? '#6C5CE7' : '#aaa',
                    fontSize: 15,
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
              padding: 12,
              background: canFinish ? 'rgba(0,184,148,0.1)' : 'rgba(253,121,168,0.1)',
              border: `1px solid ${canFinish ? '#00b894' : '#fd79a8'}`,
              borderRadius: 8,
              color: canFinish ? '#00b894' : '#fd79a8',
              fontSize: 14,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              {subjects.length} / 3 matières minimum
            </div>

            <div style={{display: 'flex', gap: 12}}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #333',
                  background: '#1a1a2e',
                  color: '#aaa',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← Retour
              </button>
              <button
                onClick={handleFinish}
                disabled={!canFinish || loading}
                style={{
                  flex: 2,
                  padding: 16,
                  borderRadius: 12,
                  border: 'none',
                  background: (canFinish && !loading) ? 'linear-gradient(135deg, #6C5CE7, #8b5cf6)' : '#444',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: (canFinish && !loading) ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? '⏳ Enregistrement...' : '🚀 Commencer à apprendre'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
