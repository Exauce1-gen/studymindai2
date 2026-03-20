import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES D'ÉPREUVES
// ═══════════════════════════════════════════════════════════════════════════

const examTypes = [
  { id: 'qcm', name: 'QCM Classique', duration: '20 min', icon: '📝', level: 'Tous niveaux' },
  { id: 'math', name: 'Mathématiques', duration: '3h', icon: '🔢', level: 'Lycée/Supérieur' },
  { id: 'physique', name: 'Physique-Chimie', duration: '3h', icon: '⚗️', level: 'Lycée/Supérieur' },
  { id: 'philo', name: 'Philosophie', duration: '4h', icon: '🤔', level: 'Terminale' },
  { id: 'svt', name: 'Sciences de la Vie', duration: '3h30', icon: '🧬', level: 'Lycée' },
  { id: 'histoire', name: 'Histoire-Géographie', duration: '4h', icon: '🌍', level: 'Lycée' },
  { id: 'francais', name: 'Français', duration: '4h', icon: '📚', level: 'Lycée' },
  { id: 'anglais', name: 'Anglais', duration: '3h', icon: '🗣️', level: 'Tous niveaux' },
  { id: 'eco', name: 'Économie-Gestion', duration: '4h', icon: '💼', level: 'Supérieur' }
];

// ═══════════════════════════════════════════════════════════════════════════
// PROMPTS PAR TYPE
// ═══════════════════════════════════════════════════════════════════════════

const getExamPrompt = (type: string, subject: string) => {
  const prompts: any = {
    qcm: `Tu es un professeur créant un QCM de 10 questions.

FORMAT STRICT :
---
QCM - ${subject}
Durée : 20 minutes
Total : 20 points (2 points par question)
---

CONSIGNES :
- Choisir la bonne réponse
- Une seule réponse correcte par question

[Questions 1-10 avec 4 options chacune]

CORRIGÉ :
[Réponses + explications]
---`,

    math: `Tu es un professeur expérimenté créant une VRAIE épreuve de Mathématiques type BAC.

FORMAT OFFICIEL OBLIGATOIRE :
═══════════════════════════════════════════════════════════════════════
ÉPREUVE DE MATHÉMATIQUES
Durée : 3 heures
Coefficient : 4
Total : 20 points
═══════════════════════════════════════════════════════════════════════

CONSIGNES
- La qualité de la rédaction sera prise en compte
- Les calculatrices scientifiques sont autorisées
- Chaque réponse doit être justifiée

PARTIE A : ANALYSE (12 points)

Exercice 1 : Étude de fonction (6 points)
[Énoncé complet avec données, questions avec barème]

Exercice 2 : Suites numériques (6 points)
[Énoncé complet]

PARTIE B : GÉOMÉTRIE (8 points)

Problème : [Énoncé avec figure si nécessaire]

═══════════════════════════════════════════════════════════════════════
FIN DE L'ÉPREUVE
═══════════════════════════════════════════════════════════════════════

Crée une épreuve COMPLÈTE, RÉALISTE et PROFESSIONNELLE basée sur : ${subject}`,

    physique: `Crée une VRAIE épreuve de Physique-Chimie type BAC.

FORMAT :
═══════════════════════════════════════════════════════════════════════
ÉPREUVE DE PHYSIQUE-CHIMIE
Durée : 3 heures
Coefficient : 3
Total : 20 points
═══════════════════════════════════════════════════════════════════════

PARTIE PHYSIQUE (10 points)
Exercice 1 : Mécanique (5 points)
Exercice 2 : Électricité (5 points)

PARTIE CHIMIE (10 points)
Exercice 1 : Réactions chimiques (5 points)
Exercice 2 : Solutions et dosages (5 points)

Sujet : ${subject}`,

    philo: `Crée une VRAIE épreuve de Philosophie type BAC.

FORMAT :
═══════════════════════════════════════════════════════════════════════
ÉPREUVE DE PHILOSOPHIE
Durée : 4 heures
Coefficient : 7
Total : 20 points
═══════════════════════════════════════════════════════════════════════

CONSIGNES
- Vous traiterez UN des trois sujets suivants au choix
- Tout brouillon doit être recopié

SUJET 1 (Dissertation)
[Question philosophique profonde liée à : ${subject}]

SUJET 2 (Dissertation)
[Autre question philosophique]

SUJET 3 (Explication de texte)
[Texte d'un philosophe avec questions d'analyse]`,

    svt: `Crée une épreuve de SVT type BAC.

FORMAT :
═══════════════════════════════════════════════════════════════════════
ÉPREUVE DE SCIENCES DE LA VIE ET DE LA TERRE
Durée : 3h30
Coefficient : 6
Total : 20 points
═══════════════════════════════════════════════════════════════════════

PARTIE I : Restitution de connaissances (8 points)
Question de synthèse sur : ${subject}

PARTIE II : Pratique du raisonnement scientifique (12 points)
Exercice 1 : Exploitation de documents (6 points)
Exercice 2 : Résolution de problème (6 points)`,

    default: `Crée une épreuve d'examen complète et professionnelle sur : ${subject}

FORMAT :
═══════════════════════════════════════════════════════════════════════
ÉPREUVE - ${subject}
Durée : 3 heures
Total : 20 points
═══════════════════════════════════════════════════════════════════════

[Structure avec plusieurs parties]
[Questions détaillées avec barème]
[Instructions claires]
`
  };

  return prompts[type] || prompts.default;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function ExamScreen() {
  const [examType, setExamType] = useState('');
  const [subject, setSubject] = useState('');
  const [courseText, setCourseText] = useState('');
  const [exam, setExam] = useState('');
  const [loading, setLoading] = useState(false);

  const generateExam = async () => {
    if (!examType) {
      alert('Choisissez un type d\'épreuve');
      return;
    }
    if (!subject.trim()) {
      alert('Entrez le sujet de l\'épreuve');
      return;
    }
    if (!courseText.trim()) {
      alert('Collez votre cours de référence');
      return;
    }

    setLoading(true);
    setExam('');

    try {
      const systemPrompt = getExamPrompt(examType, subject);
      const userMessage = `Cours de référence pour créer l'épreuve :\n\n${courseText}`;

      // Appel à Groq (remplacez par votre fonction callGroq)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      const data = await response.json();
      const examText = data.choices[0].message.content;

      setExam(examText);

    } catch (error: any) {
      console.error('Erreur génération épreuve:', error);
      alert(`Erreur : ${error.message || 'Impossible de générer l\'épreuve'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = examTypes.find(t => t.id === examType);

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>
        📝 Épreuves d'Examen
      </h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 20}}>
        Entraînez-vous avec de vraies épreuves type BAC, BEPC, Licence
      </p>

      {!exam ? (
        <>
          {/* Sélection type d'épreuve */}
          <div style={{marginBottom: 20}}>
            <label style={{display: 'block', color: '#e8e8f8', fontSize: 14, fontWeight: 600, marginBottom: 10}}>
              Type d'épreuve
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 10
            }}>
              {examTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setExamType(type.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    border: examType === type.id ? '2px solid #6C5CE7' : '1px solid #333',
                    background: examType === type.id ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                    color: '#e8e8f8',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{fontSize: 24, marginBottom: 4}}>{type.icon}</div>
                  <div>{type.name}</div>
                  <div style={{fontSize: 11, color: '#666', marginTop: 4}}>
                    {type.duration} • {type.level}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <div style={{
              padding: 16,
              background: 'rgba(108,92,231,0.1)',
              border: '1px solid rgba(108,92,231,0.3)',
              borderRadius: 12,
              marginBottom: 20
            }}>
              <div style={{fontSize: 28, marginBottom: 8}}>{selectedType.icon}</div>
              <div style={{fontSize: 16, fontWeight: 700, color: '#6C5CE7', marginBottom: 4}}>
                {selectedType.name}
              </div>
              <div style={{fontSize: 13, color: '#888'}}>
                Durée : {selectedType.duration} • Niveau : {selectedType.level}
              </div>
            </div>
          )}

          {/* Sujet */}
          <input
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 14,
              borderRadius: 14,
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
            placeholder="Sujet de l'épreuve (ex: Les fonctions du second degré)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />

          {/* Cours */}
          <textarea
            style={{
              width: '100%',
              minHeight: 120,
              padding: 14,
              borderRadius: 14,
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              marginBottom: 16
            }}
            placeholder="Collez votre cours de référence pour créer une épreuve réaliste..."
            value={courseText}
            onChange={e => setCourseText(e.target.value)}
          />

          {/* Bouton */}
          <button
            onClick={generateExam}
            disabled={loading || !examType || !subject.trim() || !courseText.trim()}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)'
            }}
          >
            {loading ? '⏳ IA crée l\'épreuve...' : '📝 Générer l\'épreuve'}
          </button>
        </>
      ) : (
        <>
          {/* Affichage épreuve */}
          <div style={{
            background: '#fff',
            color: '#000',
            padding: 40,
            borderRadius: 8,
            marginBottom: 20,
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Georgia, serif',
              fontSize: 14
            }}>
              {exam}
            </pre>
          </div>

          {/* Boutons */}
          <div style={{display: 'flex', gap: 12}}>
            <button
              onClick={() => {
                setExam('');
                setExamType('');
                setSubject('');
                setCourseText('');
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: '1px solid #6C5CE7',
                background: 'rgba(108,92,231,0.15)',
                color: '#6C5CE7',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Nouvelle épreuve
            </button>

            <button
              onClick={() => {
                const blob = new Blob([exam], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Epreuve_${subject.replace(/\s+/g, '_')}.txt`;
                a.click();
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              💾 Télécharger
            </button>
          </div>
        </>
      )}
    </div>
  );
}
