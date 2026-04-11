import { useState } from 'react';
import { useAuth } from './AuthContext';
import FileUpload from './FileUpload';
import { useUsageLimit, incrementFeatureUsage } from './useUsageLimit';
import { usePremium } from './usePremium';

export default function LearningPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'exam' | 'chat' | 'fiches' | 'planning'>('summary');

  const tabs = [
    { id: 'summary' as const, name: '✨ Résumé', icon: '✨' },
    { id: 'quiz' as const, name: '🎯 Quiz', icon: '🎯' },
    { id: 'exam' as const, name: '📝 Examen', icon: '📝' },
    { id: 'chat' as const, name: '💬 Chat', icon: '💬' },
    { id: 'fiches' as const, name: '📋 Fiches', icon: '📋' },
    { id: 'planning' as const, name: '📅 Planning', icon: '📅' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', padding: 20 }}>
      {/* Header avec bouton retour */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 12,
            color: '#aaa',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Tableau de bord
        </button>

        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#e8e8f8'
        }}>
          Bonjour {userProfile?.first_name || 'Étudiant'} 👋
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 30px',
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        padding: '0 4px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 24px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #6C5CE7, #8b5cf6)' : '#1a1a2e',
              border: activeTab === tab.id ? 'none' : '1px solid #333',
              borderRadius: 12,
              color: activeTab === tab.id ? '#fff' : '#aaa',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'summary' && <SummaryScreen />}
        {activeTab === 'quiz' && <QuizScreen />}
        {activeTab === 'exam' && <ExamScreen />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'fiches' && <FichesScreen />}
        {activeTab === 'planning' && <PlanningScreen />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUMMARY SCREEN
// ════════════════════════════════════════════════════════════════════

function SummaryScreen() {
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { canUse, usageCount, maxUsage, resetTime } = useUsageLimit('summary');
  const { isPremium } = usePremium();

  const handleFileUpload = (extractedText: string) => {
    setCourseContent(extractedText);
  };

  const generateSummary = async () => {
    if (!courseContent.trim()) {
      alert('Veuillez coller votre cours ou importer un fichier !');
      return;
    }

    // Vérifier limite gratuite
    if (!canUse && !isPremium) {
      alert(`Limite gratuite atteinte (${maxUsage}/jour). Réinitialisation à ${resetTime}.\n\nPassez à Premium pour des résumés illimités !`);
      return;
    }

    setLoading(true);
    setSummary('');

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant pédagogique expert. Crée des résumés clairs, structurés et faciles à mémoriser pour les étudiants.'
            },
            {
              role: 'user',
              content: `Résume ce cours de manière claire et structurée. Inclus les concepts clés, formules importantes et exemples.\n\nCours:\n${courseContent}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const generatedSummary = data.choices[0]?.message?.content || 'Erreur de génération';
      
      setSummary(generatedSummary);
      
      // Incrémenter l'utilisation si gratuit
      if (!isPremium && user) {
        await incrementFeatureUsage(user.id, 'summary');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0e0e1d',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 32
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        ✨ Générateur de Résumés
      </h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>
        Collez votre cours ou importez un PDF/photo, et obtenez un résumé clair en quelques secondes
      </p>

      {/* Usage counter pour gratuit */}
      {!isPremium && (
        <div style={{
          marginBottom: 20,
          padding: 16,
          background: canUse ? 'rgba(0,184,148,0.1)' : 'rgba(253,121,168,0.1)',
          border: `1px solid ${canUse ? '#00b894' : '#fd79a8'}`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 14, color: canUse ? '#00b894' : '#fd79a8', fontWeight: 700 }}>
              {canUse ? `${usageCount}/${maxUsage} résumés utilisés aujourd'hui` : '⚠️ Limite gratuite atteinte'}
            </div>
            {!canUse && (
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
                Réinitialisation à {resetTime}
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.href = '/premium'}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            💎 Premium Illimité
          </button>
        </div>
      )}

      {/* FileUpload Component */}
      <FileUpload onTextExtracted={handleFileUpload} />

      {/* Textarea */}
      <textarea
        value={courseContent}
        onChange={(e) => setCourseContent(e.target.value)}
        placeholder="Collez votre cours ici... ou importez un PDF/photo ci-dessus"
        style={{
          width: '100%',
          minHeight: 200,
          padding: 16,
          background: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: 12,
          color: '#fff',
          fontSize: 15,
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          marginBottom: 20
        }}
      />

      {/* Generate Button */}
      <button
        onClick={generateSummary}
        disabled={loading || !courseContent.trim()}
        style={{
          width: '100%',
          padding: 16,
          background: (loading || !courseContent.trim()) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          cursor: (loading || !courseContent.trim()) ? 'not-allowed' : 'pointer',
          marginBottom: 20
        }}
      >
        {loading ? '⏳ Génération en cours...' : '✨ Générer le résumé'}
      </button>

      {/* Summary Result */}
      {summary && (
        <div style={{
          padding: 24,
          background: '#1a1a2e',
          border: '1px solid #6C5CE7',
          borderRadius: 12,
          marginTop: 20
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#6C5CE7', marginBottom: 16 }}>
            📄 Votre Résumé
          </h3>
          <div style={{
            color: '#e8e8f8',
            fontSize: 15,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap'
          }}>
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// QUIZ SCREEN
// ════════════════════════════════════════════════════════════════════

function QuizScreen() {
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const { isPremium } = usePremium();

  const handleFileUpload = (extractedText: string) => {
    setCourseContent(extractedText);
  };

  const generateQuiz = async () => {
    if (!courseContent.trim()) {
      alert('Veuillez coller votre cours ou importer un fichier !');
      return;
    }

    setLoading(true);
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Tu es un créateur de quiz pédagogiques. Génère des quiz au format JSON avec 10 questions QCM, 4 choix par question (A, B, C, D), et indique la bonne réponse.'
            },
            {
              role: 'user',
              content: `Crée un quiz de 10 questions QCM sur ce cours. Format JSON strict:\n\n{"questions": [{"question": "...", "choices": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct": "A"}]}\n\nCours:\n${courseContent}`
            }
          ],
          temperature: 0.8,
          max_tokens: 2500
        })
      });

      const data = await response.json();
      const quizText = data.choices[0]?.message?.content || '';
      
      // Extraire le JSON
      const jsonMatch = quizText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0]);
        setQuiz(quizData);
      } else {
        throw new Error('Format invalide');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération. Réessayez.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (userAnswers[i] === q.correct) correct++;
    });
    return correct;
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  return (
    <div style={{
      background: '#0e0e1d',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 32
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        🎯 Générateur de Quiz
      </h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>
        Créez un quiz personnalisé pour tester vos connaissances
      </p>

      {!quiz ? (
        <>
          {/* FileUpload Component */}
          <FileUpload onTextExtracted={handleFileUpload} />

          {/* Textarea */}
          <textarea
            value={courseContent}
            onChange={(e) => setCourseContent(e.target.value)}
            placeholder="Collez votre cours ici... ou importez un PDF/photo ci-dessus"
            style={{
              width: '100%',
              minHeight: 200,
              padding: 16,
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              marginBottom: 20
            }}
          />

          {/* Generate Button */}
          <button
            onClick={generateQuiz}
            disabled={loading || !courseContent.trim()}
            style={{
              width: '100%',
              padding: 16,
              background: (loading || !courseContent.trim()) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: (loading || !courseContent.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Génération en cours...' : '🎯 Générer le quiz'}
          </button>
        </>
      ) : (
        <>
          {/* Quiz Questions */}
          <div style={{ marginBottom: 24 }}>
            {quiz.questions.map((q: any, i: number) => (
              <div key={i} style={{
                padding: 24,
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: 12,
                marginBottom: 16
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#e8e8f8',
                  marginBottom: 16
                }}>
                  {i + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(q.choices).map(([key, value]: [string, any]) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        background: userAnswers[i] === key ? 'rgba(108,92,231,0.15)' : '#0e0e1d',
                        border: userAnswers[i] === key ? '2px solid #6C5CE7' : '1px solid #333',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        value={key}
                        checked={userAnswers[i] === key}
                        onChange={() => handleAnswerChange(i, key)}
                        disabled={showResults}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        color: showResults && key === q.correct ? '#00b894' : 
                               showResults && userAnswers[i] === key && key !== q.correct ? '#ff6b6b' : '#e8e8f8',
                        fontSize: 15
                      }}>
                        {key}. {value}
                        {showResults && key === q.correct && ' ✅'}
                        {showResults && userAnswers[i] === key && key !== q.correct && ' ❌'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit/Results */}
          {!showResults ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(userAnswers).length !== quiz.questions.length}
              style={{
                width: '100%',
                padding: 16,
                background: Object.keys(userAnswers).length !== quiz.questions.length ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: Object.keys(userAnswers).length !== quiz.questions.length ? 'not-allowed' : 'pointer'
              }}
            >
              ✅ Soumettre mes réponses
            </button>
          ) : (
            <div style={{
              padding: 24,
              background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,184,148,0.1))',
              border: '2px solid #6C5CE7',
              borderRadius: 12,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {calculateScore() >= 7 ? '🎉' : calculateScore() >= 5 ? '👍' : '📚'}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#6C5CE7', marginBottom: 8 }}>
                {calculateScore()}/{quiz.questions.length}
              </div>
              <div style={{ fontSize: 18, color: '#e8e8f8', marginBottom: 20 }}>
                {calculateScore() >= 7 ? 'Excellent !' : calculateScore() >= 5 ? 'Bien !' : 'Continue à réviser !'}
              </div>
              <button
                onClick={() => {
                  setQuiz(null);
                  setUserAnswers({});
                  setShowResults(false);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#aaa',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 Nouveau quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// EXAM SCREEN (début)
// ════════════════════════════════════════════════════════════════════

function ExamScreen() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const subjects = [
    { id: 'maths', name: '📐 Mathématiques', emoji: '📐' },
    { id: 'physique', name: '⚗️ Physique-Chimie', emoji: '⚗️' },
    { id: 'svt', name: '🧬 SVT', emoji: '🧬' },
    { id: 'philo', name: '🤔 Philosophie', emoji: '🤔' },
    { id: 'histoire', name: '🌍 Histoire-Géo', emoji: '🌍' },
    { id: 'francais', name: '📚 Français', emoji: '📚' },
    { id: 'anglais', name: '🗣️ Anglais', emoji: '🗣️' }
  ];

  const generateExam = async () => {
    if (!selectedSubject) {
      alert('Sélectionnez une matière !');
      return;
    }

    setLoading(true);
    setExam(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || '';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Tu es un créateur d\'examens type BAC/BEPC. Génère des épreuves réalistes avec questions structurées.'
            },
            {
              role: 'user',
              content: `Crée une épreuve type BAC en ${subjectName} avec 15 questions QCM (4 choix A/B/C/D). Format JSON:\n\n{"title": "...", "duration": "...", "questions": [{"question": "...", "choices": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct": "A", "points": 1}]}`
            }
          ],
          temperature: 0.8,
          max_tokens: 3000
        })
      });

      const data = await response.json();
      const examText = data.choices[0]?.message?.content || '';
      
      const jsonMatch = examText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const examData = JSON.parse(jsonMatch[0]);
        setExam(examData);
      } else {
        throw new Error('Format invalide');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération. Réessayez.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    exam.questions.forEach((q: any, i: number) => {
      totalPoints += q.points || 1;
      if (userAnswers[i] === q.correct) {
        earnedPoints += q.points || 1;
      }
    });
    
    return { earnedPoints, totalPoints };
  };

  const submitExam = () => {
    setShowResults(true);
  };

  return (
    <div style={{
      background: '#0e0e1d',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 32
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        📝 Examens Type BAC/BEPC
      </h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>
        Entraînez-vous avec des épreuves réalistes
      </p>

      {!exam ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                style={{
                  padding: 20,
                  background: selectedSubject === subject.id ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                  border: selectedSubject === subject.id ? '2px solid #6C5CE7' : '1px solid #333',
                  borderRadius: 12,
                  color: selectedSubject === subject.id ? '#6C5CE7' : '#e8e8f8',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>

          <button
            onClick={generateExam}
            disabled={loading || !selectedSubject}
            style={{
              width: '100%',
              padding: 16,
              background: (loading || !selectedSubject) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: (loading || !selectedSubject) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Génération en cours...' : '📝 Générer l\'examen'}
          </button>
        </>
      ) : (
        <>
          <div style={{
            padding: 20,
            background: '#1a1a2e',
            border: '1px solid #6C5CE7',
            borderRadius: 12,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#6C5CE7', marginBottom: 8 }}>
              {exam.title}
            </h3>
            <p style={{ color: '#aaa', fontSize: 14 }}>
              Durée: {exam.duration} • {exam.questions.length} questions
            </p>
          </div>

          {exam.questions.map((q: any, i: number) => (
            <div key={i} style={{
              padding: 24,
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 12,
              marginBottom: 16
            }}>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#e8e8f8',
                marginBottom: 16
              }}>
                Question {i + 1} ({q.points || 1} point{(q.points || 1) > 1 ? 's' : ''})
              </div>
              <div style={{ color: '#e8e8f8', marginBottom: 16, fontSize: 15 }}>
                {q.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(q.choices).map(([key, value]: [string, any]) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      background: userAnswers[i] === key ? 'rgba(108,92,231,0.15)' : '#0e0e1d',
                      border: userAnswers[i] === key ? '2px solid #6C5CE7' : '1px solid #333',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={key}
                      checked={userAnswers[i] === key}
                      onChange={() => handleAnswerChange(i, key)}
                      disabled={showResults}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      color: showResults && key === q.correct ? '#00b894' : 
                             showResults && userAnswers[i] === key && key !== q.correct ? '#ff6b6b' : '#e8e8f8',
                      fontSize: 15
                    }}>
                      {key}. {value}
                      {showResults && key === q.correct && ' ✅'}
                      {showResults && userAnswers[i] === key && key !== q.correct && ' ❌'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {!showResults ? (
            <button
              onClick={submitExam}
              disabled={Object.keys(userAnswers).length !== exam.questions.length}
              style={{
                width: '100%',
                padding: 16,
                background: Object.keys(userAnswers).length !== exam.questions.length ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: Object.keys(userAnswers).length !== exam.questions.length ? 'not-allowed' : 'pointer'
              }}
            >
              ✅ Soumettre mon examen
            </button>
          ) : (
            <div style={{
              padding: 32,
              background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,184,148,0.1))',
              border: '2px solid #6C5CE7',
              borderRadius: 12,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>
                {(calculateScore().earnedPoints / calculateScore().totalPoints) * 20 >= 14 ? '🎉' : 
                 (calculateScore().earnedPoints / calculateScore().totalPoints) * 20 >= 10 ? '👍' : '📚'}
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#6C5CE7', marginBottom: 8 }}>
                {((calculateScore().earnedPoints / calculateScore().totalPoints) * 20).toFixed(1)}/20
              </div>
              <div style={{ fontSize: 18, color: '#e8e8f8', marginBottom: 24 }}>
                {calculateScore().earnedPoints}/{calculateScore().totalPoints} points
              </div>
              <button
                onClick={() => {
                  setExam(null);
                  setUserAnswers({});
                  setShowResults(false);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#aaa',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 Nouvel examen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CHAT SCREEN
// ════════════════════════════════════════════════════════════════════

function ChatScreen() {
  const [courseContent, setCourseContent] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (extractedText: string) => {
    setCourseContent(extractedText);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Tu es un professeur particulier bienveillant. ${courseContent ? `Voici le cours de référence:\n${courseContent}` : 'Aide l\'étudiant avec ses questions.'}`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Erreur de réponse';
      
      setMessages([...messages, userMessage, { role: 'assistant', content: aiResponse }]);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0e0e1d',
      border: '1px solid #333',
      borderRadius: 16,
      padding: 32
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        💬 Chat avec l'IA
      </h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>
        Posez vos questions, l'IA vous aide à comprendre
      </p>

      {messages.length === 0 && <FileUpload onTextExtracted={handleFileUpload} />}

      <div style={{
        minHeight: 300,
        maxHeight: 500,
        overflowY: 'auto',
        marginBottom: 20,
        padding: 16,
        background: '#1a1a2e',
        borderRadius: 12
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
            💬 Posez votre première question...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 16,
              padding: 16,
              background: msg.role === 'user' ? 'rgba(108,92,231,0.15)' : '#0e0e1d',
              border: msg.role === 'user' ? '1px solid #6C5CE7' : '1px solid #333',
              borderRadius: 12,
              color: '#e8e8f8',
              fontSize: 15,
              whiteSpace: 'pre-wrap'
            }}>
              <strong style={{ color: msg.role === 'user' ? '#6C5CE7' : '#00b894', marginBottom: 8, display: 'block' }}>
                {msg.role === 'user' ? '👤 Vous' : '🤖 IA'}
              </strong>
              {msg.content}
            </div>
          ))
        )}
        {loading && (
          <div style={{ textAlign: 'center', color: '#888' }}>
            ⏳ L'IA réfléchit...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question..."
          style={{
            flex: 1,
            padding: 16,
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 12,
            color: '#fff',
            fontSize: 15,
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '16px 32px',
            background: (loading || !input.trim()) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// FICHES SCREEN + PLANNING SCREEN (Simplified)
// ════════════════════════════════════════════════════════════════════

function FichesScreen() {
  return (
    <div style={{ background: '#0e0e1d', border: '1px solid #333', borderRadius: 16, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        Fiches de Révision
      </h2>
      <p style={{ color: '#888', fontSize: 15 }}>
        Fonctionnalité en cours de développement
      </p>
    </div>
  );
}

function PlanningScreen() {
  return (
    <div style={{ background: '#0e0e1d', border: '1px solid #333', borderRadius: 16, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f8', marginBottom: 8 }}>
        Planning de Révision
      </h2>
      <p style={{ color: '#888', fontSize: 15 }}>
        Fonctionnalité en cours de développement
      </p>
    </div>
  );
}
