import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ API
// ═══════════════════════════════════════════════════════════════════════════════

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return `❌ Erreur ${response.status}: ${errorData.error?.message || 'Erreur API'}`;
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    
    return "Aucune réponse générée.";
    
  } catch (error: any) {
    return `Erreur de connexion: ${error.message}`;
  }
}

async function generateSummary(text: string): Promise<string> {
  return await callGroq(
    `Tu es un assistant pédagogique expert. Génère un résumé CLAIR, COMPLET et STRUCTURÉ en français.

Format OBLIGATOIRE :
📌 CONCEPT PRINCIPAL : [Titre du concept en 1-2 phrases explicatives]

📝 DÉFINITION COMPLÈTE : 
[Explication détaillée en 3-4 phrases. Sois clair et pédagogique. Explique VRAIMENT le concept.]

🔑 POINTS CLÉS (4-5 points) :
• [Point 1 : explication complète en 25-35 mots avec détails]
• [Point 2 : explication complète en 25-35 mots avec détails]
• [Point 3 : explication complète en 25-35 mots avec détails]
• [Point 4 : explication complète en 25-35 mots avec détails]

📐 FORMULE/ÉQUATION (si applicable) :
[Formule complète avec explication de chaque variable]

💡 EXEMPLE CONCRET :
[Un exemple pratique détaillé en 3-4 phrases pour bien comprendre]

Sois CLAIR, COMPLET et PÉDAGOGIQUE. Le résumé doit être compréhensible et utile.`,
    `Résume ce cours de façon CLAIRE et COMPLÈTE :\n\n${text}`
  );
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

async function generateQuiz(text: string): Promise<Question[]> {
  const systemPrompt = `Tu es un professeur expert. Génère exactement 5 questions QCM en français.

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide. Pas de texte avant ou après. Pas de markdown.

Format JSON strict :
{
  "questions": [
    {
      "question": "Quelle est la formule de la loi d'Ohm ?",
      "options": ["U = R × I", "P = U × I", "E = m × c²", "F = m × a"],
      "correct": 0,
      "explanation": "La loi d'Ohm établit que la tension U est égale à la résistance R multipliée par l'intensité I."
    }
  ]
}

RÈGLES STRICTES :
- "question" = texte de la question
- "options" = array de 4 VRAIES réponses complètes (PAS "Option A" ou "Option B")
- "correct" = index de la bonne réponse (0, 1, 2, ou 3)
- "explanation" = explication claire
- Génère EXACTEMENT 5 questions DIFFÉRENTES sur 5 CONCEPTS DIFFÉRENTS`;

  const userMessage = `Cours à transformer en quiz :\n\n${text}`;

  try {
    const response = await callGroq(systemPrompt, userMessage);
    let cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanedResponse);
    return data.questions || [];
  } catch (error) {
    console.error("Erreur parsing quiz:", error);
    return [];
  }
}

async function generateFlashcards(text: string): Promise<string> {
  return await callGroq(
    `Tu es un assistant pédagogique. Génère des FICHES DE RÉVISION concises et mémorisables.

Format OBLIGATOIRE :

🎯 FICHE 1 : [Titre du concept]
━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION : [Question claire]
RÉPONSE : [Réponse courte et précise]

🎯 FICHE 2 : [Titre du concept]
━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION : [Question claire]
RÉPONSE : [Réponse courte et précise]

Génère 5-7 fiches. Sois CONCIS et MÉMORISABLE.`,
    `Crée des fiches de révision pour :\n\n${text}`
  );
}

async function generateStudyPlan(text: string): Promise<string> {
  return await callGroq(
    `Tu es un coach d'étude. Crée un PLANNING D'ÉTUDE personnalisé et motivant.

Format OBLIGATOIRE :

📅 PLANNING D'ÉTUDE - 7 JOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗓️ JOUR 1 : [Titre]
⏰ Durée : [X minutes]
📚 Activités :
• [Activité précise 1]
• [Activité précise 2]
🎯 Objectif : [Objectif clair]

[Répète pour JOURS 2-7]

💡 CONSEILS :
• [Conseil pratique 1]
• [Conseil pratique 2]

Sois MOTIVANT et RÉALISTE.`,
    `Crée un planning d'étude pour réviser :\n\n${text}`
  );
}

// Types d'épreuves
const examTypes = [
  { id: 'maths', name: 'Mathématiques', duration: '3h', icon: '🔢', color: '#6C5CE7' },
  { id: 'physique', name: 'Physique-Chimie', duration: '3h', icon: '⚗️', color: '#00b894' },
  { id: 'philo', name: 'Philosophie', duration: '4h', icon: '🤔', color: '#fd79a8' },
  { id: 'svt', name: 'Sciences de la Vie', duration: '3h30', icon: '🧬', color: '#00cec9' },
  { id: 'histoire', name: 'Histoire-Géographie', duration: '4h', icon: '🌍', color: '#fdcb6e' },
  { id: 'francais', name: 'Français', duration: '4h', icon: '📚', color: '#e17055' },
  { id: 'anglais', name: 'Anglais', duration: '3h', icon: '🗣️', color: '#0984e3' }
];

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
}

interface ExamData {
  title: string;
  duration: string;
  totalPoints: number;
  parts: {
    title: string;
    points: number;
    questions: ExamQuestion[];
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMSCREEN - TYPE BAC QCM
// ═══════════════════════════════════════════════════════════════════════════════

function ExamScreen() {
  const [step, setStep] = useState<'select' | 'config' | 'exam'>('select');
  const [selectedType, setSelectedType] = useState('');
  const [subject, setSubject] = useState('');
  const [courseText, setCourseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const generateExam = async () => {
    setLoading(true);
    const type = examTypes.find(t => t.id === selectedType);
    
    const systemPrompt = `Tu es un professeur créant une épreuve type BAC.

Réponds UNIQUEMENT avec ce JSON :
{
  "title": "Épreuve de ${type?.name}",
  "duration": "${type?.duration}",
  "totalPoints": 20,
  "parts": [
    {
      "title": "PARTIE I : ...",
      "points": 8,
      "questions": [
        {
          "id": 1,
          "question": "...",
          "options": ["A...", "B...", "C...", "D..."],
          "correctAnswer": 0,
          "points": 2,
          "explanation": "..."
        }
      ]
    }
  ]
}`;

    try {
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
            { role: 'user', content: `Sujet: ${subject}\n\nCours:\n${courseText}` }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      const data = await response.json();
      let examText = data.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setExamData(JSON.parse(examText));
      setStep('exam');
    } catch (error) {
      alert('Erreur génération');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!examData) return 0;
    let score = 0;
    examData.parts.forEach(part => {
      part.questions.forEach(q => {
        if (userAnswers[`${part.title}-${q.id}`] === q.correctAnswer) {
          score += q.points;
        }
      });
    });
    return score;
  };
// SUITE DE EXAMSCREEN

  if (step === 'select') {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: '#6C5CE7', fontSize: 24, fontWeight: 800}}>📝 Épreuves</h2>
        <p style={{color: '#888', fontSize: 14, marginBottom: 24}}>Entraînez-vous avec des épreuves type BAC</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16}}>
          {examTypes.map(type => (
            <button key={type.id} onClick={() => { setSelectedType(type.id); setStep('config'); }}
              style={{padding: 20, borderRadius: 16, border: '1px solid #333', background: '#1a1a2e', color: '#e8e8f8', cursor: 'pointer', textAlign: 'left'}}>
              <div style={{fontSize: 32, marginBottom: 8}}>{type.icon}</div>
              <div style={{fontSize: 16, fontWeight: 700}}>{type.name}</div>
              <div style={{fontSize: 12, color: '#888'}}>{type.duration}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'config') {
    const type = examTypes.find(t => t.id === selectedType);
    return (
      <div style={{padding: 20}}>
        <button onClick={() => setStep('select')} style={{marginBottom: 20, padding: '8px 16px', borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#888', cursor: 'pointer'}}>← Retour</button>
        <div style={{padding: 20, background: `${type?.color}15`, border: `1px solid ${type?.color}30`, borderRadius: 16, marginBottom: 24}}>
          <div style={{fontSize: 40, marginBottom: 12}}>{type?.icon}</div>
          <h2 style={{fontSize: 24, fontWeight: 800, color: type?.color}}>{type?.name}</h2>
          <p style={{fontSize: 14, color: '#888'}}>Durée : {type?.duration} • QCM • 20 points</p>
        </div>
        <input style={{width: '100%', marginBottom: 16, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 15, outline: 'none'}}
          placeholder="Sujet (ex: Les suites numériques)" value={subject} onChange={e => setSubject(e.target.value)} />
        <textarea style={{width: '100%', minHeight: 150, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 20}}
          placeholder="Collez votre cours..." value={courseText} onChange={e => setCourseText(e.target.value)} />
        <button onClick={generateExam} disabled={loading || !subject || !courseText}
          style={{width: '100%', padding: 16, borderRadius: 14, border: 'none', background: loading ? '#444' : `linear-gradient(135deg, ${type?.color}, ${type?.color}dd)`, color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'}}>
          {loading ? '⏳ Création...' : '🚀 Générer'}
        </button>
      </div>
    );
  }

  if (step === 'exam' && examData) {
    return (
      <div style={{padding: 20}}>
        <div style={{padding: 24, background: '#1a1a2e', border: '2px solid #6C5CE7', borderRadius: 16, marginBottom: 32, textAlign: 'center'}}>
          <h1 style={{fontSize: 24, fontWeight: 900, marginBottom: 8}}>{examData.title}</h1>
          <div style={{fontSize: 14, color: '#888'}}>Durée : {examData.duration} • Total : {examData.totalPoints} pts</div>
        </div>

        {examData.parts.map((part, pIdx) => (
          <div key={pIdx} style={{marginBottom: 40}}>
            <div style={{padding: 16, background: '#6C5CE720', borderLeft: '4px solid #6C5CE7', borderRadius: 8, marginBottom: 24}}>
              <h3 style={{fontSize: 18, fontWeight: 800, color: '#6C5CE7'}}>{part.title}</h3>
              <div style={{fontSize: 13, color: '#888'}}>{part.points} pts • {part.questions.length} questions</div>
            </div>

            {part.questions.map((q, qIdx) => {
              const qKey = `${part.title}-${q.id}`;
              const selected = userAnswers[qKey];
              
              return (
                <div key={qIdx} style={{marginBottom: 32, padding: 20, background: '#0e0e1d', border: '1px solid #333', borderRadius: 12}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 12, color: '#6C5CE7', fontWeight: 700, marginBottom: 8}}>Question {qIdx + 1}</div>
                      <div style={{fontSize: 15, color: '#e8e8f8'}}>{q.question}</div>
                    </div>
                    <div style={{padding: '4px 12px', background: '#6C5CE715', border: '1px solid #6C5CE730', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#6C5CE7', marginLeft: 16}}>{q.points} pts</div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selected === oIdx;
                      const letter = String.fromCharCode(65 + oIdx);
                      
                      return (
                        <button key={oIdx} onClick={() => setUserAnswers(prev => ({...prev, [qKey]: oIdx}))}
                          style={{padding: '14px 16px', borderRadius: 10, border: isSelected ? '2px solid #6C5CE7' : '1px solid #333', background: isSelected ? '#6C5CE715' : '#1a1a2e', color: '#e8e8f8', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12}}>
                          <div style={{minWidth: 28, height: 28, borderRadius: '50%', border: isSelected ? '2px solid #6C5CE7' : '2px solid #333', background: isSelected ? '#6C5CE7' : 'transparent', color: isSelected ? '#fff' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700}}>{letter}</div>
                          <div style={{flex: 1, paddingTop: 4}}>{opt}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <button onClick={() => setShowResults(true)} style={{width: '100%', padding: 18, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer'}}>📝 Soumettre</button>

        {showResults && (
          <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto'}}>
            <div style={{maxWidth: 700, width: '100%', background: '#0e0e1d', border: '2px solid #6C5CE7', borderRadius: 20, padding: 40, maxHeight: '90vh', overflowY: 'auto'}}>
              <div style={{textAlign: 'center', marginBottom: 32}}>
                <div style={{fontSize: 64}}>{calculateScore() >= 10 ? '🎉' : '📚'}</div>
                <h2 style={{fontSize: 28, fontWeight: 900, marginBottom: 8}}>{calculateScore() >= 10 ? 'Félicitations !' : 'Bon travail !'}</h2>
                <div style={{fontSize: 48, fontWeight: 900, color: '#6C5CE7'}}>{calculateScore()}/20</div>
              </div>

              <div style={{marginBottom: 24}}>
                <h3 style={{fontSize: 18, fontWeight: 700, color: '#6C5CE7', marginBottom: 16}}>📋 Corrections</h3>
                {examData.parts.map((part, pIdx) => (
                  <div key={pIdx} style={{marginBottom: 24}}>
                    <div style={{fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 12}}>{part.title}</div>
                    {part.questions.map((q, qIdx) => {
                      const qKey = `${part.title}-${q.id}`;
                      const userAns = userAnswers[qKey];
                      const isCorrect = userAns === q.correctAnswer;
                      
                      return (
                        <div key={qIdx} style={{marginBottom: 16, padding: 16, background: isCorrect ? '#00b89410' : '#ff6b6b10', border: `1px solid ${isCorrect ? '#00b894' : '#ff6b6b'}`, borderRadius: 10}}>
                          <div style={{fontSize: 13, fontWeight: 700, marginBottom: 8}}>{isCorrect ? '✅' : '❌'} Question {qIdx + 1}</div>
                          <div style={{fontSize: 13, color: '#888', marginBottom: 8}}>
                            Votre réponse : {userAns !== undefined ? String.fromCharCode(65 + userAns) : 'Non répondu'} • Bonne réponse : {String.fromCharCode(65 + q.correctAnswer)}
                          </div>
                          <div style={{fontSize: 13, color: '#e8e8f8'}}>{q.explanation}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button onClick={() => { setStep('select'); setExamData(null); setUserAnswers({}); setShowResults(false); setSubject(''); setCourseText(''); }}
                style={{width: '100%', padding: 16, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer'}}>🔄 Nouvelle épreuve</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ ET AUTRES COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════════

function QuizScreen() {
  const [courseText, setCourseText] = useState("");
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showCorrection, setShowCorrection] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!courseText.trim()) {
      alert("Veuillez coller un cours.");
      return;
    }
    setLoading(true);
    setQuiz([]);
    setUserAnswers({});
    setShowCorrection(false);

    const questions = await generateQuiz(courseText);
    setQuiz(questions);
    setLoading(false);
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quiz.length) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setShowCorrection(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correct++;
    });
    return correct;
  };

  if (quiz.length === 0) {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: "#6C5CE7", marginBottom: 10, fontSize: 22, fontWeight: 800}}>🧩 Quiz IA</h2>
        <p style={{color: "#888", fontSize: 13, marginBottom: 20}}>Générez un quiz de 5 questions</p>
        <textarea style={{width: "100%", minHeight: 120, padding: 14, borderRadius: 14, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 14, outline: "none", marginBottom: 16}} placeholder="Collez votre cours ici..." value={courseText} onChange={(e) => setCourseText(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} style={{width: "100%", padding: 16, borderRadius: 14, border: "none", background: loading ? "#444" : "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"}}>
          {loading ? "⏳ Génération..." : "🚀 Générer le quiz"}
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 24}}>🧩 Quiz - 5 Questions</h2>
      {quiz.map((q, i) => (
        <div key={i} style={{marginBottom: 24, padding: 20, background: "#0e0e1d", border: "1px solid #333", borderRadius: 12}}>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#e8e8f8"}}>Question {i + 1}</div>
          <div style={{fontSize: 14, marginBottom: 16, color: "#e8e8f8"}}>{q.question}</div>
          <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {q.options.map((opt, oIdx) => {
              const isSelected = userAnswers[i] === oIdx;
              const isCorrect = q.correct === oIdx;
              const showResult = showCorrection;
              
              return (
                <button key={oIdx} onClick={() => !showCorrection && setUserAnswers({...userAnswers, [i]: oIdx})}
                  style={{padding: 12, borderRadius: 10, border: showResult ? (isCorrect ? "2px solid #00b894" : isSelected ? "2px solid #ff6b6b" : "1px solid #333") : isSelected ? "2px solid #6C5CE7" : "1px solid #333", background: showResult ? (isCorrect ? "#00b89410" : isSelected ? "#ff6b6b10" : "#1a1a2e") : isSelected ? "#6C5CE715" : "#1a1a2e", color: "#e8e8f8", fontSize: 14, textAlign: "left", cursor: showCorrection ? "default" : "pointer"}}>
                  {showResult && isCorrect && "✅ "}
                  {showResult && !isCorrect && isSelected && "❌ "}
                  {opt}
                </button>
              );
            })}
          </div>
          {showCorrection && (
            <div style={{marginTop: 12, padding: 12, background: "#6C5CE710", border: "1px solid #6C5CE730", borderRadius: 8, fontSize: 13, color: "#e8e8f8"}}>
              💡 {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!showCorrection ? (
        <button onClick={handleSubmit} style={{width: "100%", padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer"}}>✅ Soumettre</button>
      ) : (
        <div style={{padding: 20, background: "#6C5CE715", border: "1px solid #6C5CE7", borderRadius: 12, textAlign: "center"}}>
          <div style={{fontSize: 40, marginBottom: 8}}>{calculateScore() >= 3 ? "🎉" : "📚"}</div>
          <div style={{fontSize: 24, fontWeight: 800, color: "#6C5CE7", marginBottom: 8}}>Score : {calculateScore()}/5</div>
          <button onClick={() => { setQuiz([]); setCourseText(""); setUserAnswers({}); setShowCorrection(false); }} style={{marginTop: 16, padding: "12px 24px", borderRadius: 10, border: "none", background: "#6C5CE7", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer"}}>🔄 Nouveau quiz</button>
        </div>
      )}
    </div>
  );
}
// SUITE ET FIN - AUTRES COMPOSANTS + LEARNINGPAGE PRINCIPAL

function ChatScreen() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, {role: "user", content: userMessage}]);
    setLoading(true);

    const response = await callGroq("Tu es un assistant pédagogique. Réponds de façon claire et pédagogique.", userMessage);
    
    setMessages(prev => [...prev, {role: "assistant", content: response}]);
    setLoading(false);
  };

  return (
    <div style={{display: "flex", flexDirection: "column", height: "calc(100vh - 120px)"}}>
      <div style={{flex: 1, overflowY: "auto", padding: 20}}>
        <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 20}}>💬 Chat IA</h2>
        {messages.length === 0 && (
          <div style={{textAlign: "center", padding: 40, color: "#888"}}>
            <div style={{fontSize: 48, marginBottom: 16}}>💬</div>
            <div>Posez vos questions !</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start"}}>
            <div style={{maxWidth: "80%", padding: 14, borderRadius: 12, background: msg.role === "user" ? "#6C5CE7" : "#1a1a2e", color: "#e8e8f8", fontSize: 14, whiteSpace: "pre-wrap"}}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{marginBottom: 16}}>
            <div style={{maxWidth: "80%", padding: 14, borderRadius: 12, background: "#1a1a2e", color: "#888", fontSize: 14}}>⏳ Réflexion...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{padding: 20, borderTop: "1px solid #333"}}>
        <div style={{display: "flex", gap: 12}}>
          <input style={{flex: 1, padding: 14, borderRadius: 12, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 14, outline: "none"}} placeholder="Posez votre question..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} />
          <button onClick={handleSend} disabled={!input.trim() || loading} style={{padding: "0 24px", borderRadius: 12, border: "none", background: loading || !input.trim() ? "#444" : "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !input.trim() ? "not-allowed" : "pointer"}}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}

function FlashcardsScreen() {
  const [courseText, setCourseText] = useState("");
  const [flashcards, setFlashcards] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!courseText.trim()) {
      alert("Veuillez coller un cours.");
      return;
    }
    setLoading(true);
    const result = await generateFlashcards(courseText);
    setFlashcards(result);
    setLoading(false);
  };

  if (!flashcards) {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 10}}>📋 Fiches de révision</h2>
        <p style={{color: "#888", fontSize: 13, marginBottom: 20}}>Créez des fiches mémo</p>
        <textarea style={{width: "100%", minHeight: 120, padding: 14, borderRadius: 14, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 14, outline: "none", marginBottom: 16}} placeholder="Collez votre cours..." value={courseText} onChange={e => setCourseText(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} style={{width: "100%", padding: 16, borderRadius: 14, border: "none", background: loading ? "#444" : "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"}}>
          {loading ? "⏳ Génération..." : "🚀 Générer les fiches"}
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 20}}>📋 Fiches de révision</h2>
      <div style={{padding: 20, background: "#0e0e1d", border: "1px solid #333", borderRadius: 12, marginBottom: 20, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: "1.8"}}>
        {flashcards}
      </div>
      <button onClick={() => { setFlashcards(""); setCourseText(""); }} style={{width: "100%", padding: 14, borderRadius: 12, border: "1px solid #6C5CE7", background: "#6C5CE715", color: "#6C5CE7", fontSize: 14, fontWeight: 700, cursor: "pointer"}}>🔄 Nouvelles fiches</button>
    </div>
  );
}

function PlanningScreen() {
  const [courseText, setCourseText] = useState("");
  const [planning, setPlanning] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!courseText.trim()) {
      alert("Veuillez coller un cours.");
      return;
    }
    setLoading(true);
    const result = await generateStudyPlan(courseText);
    setPlanning(result);
    setLoading(false);
  };

  if (!planning) {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 10}}>📅 Planning d'étude</h2>
        <p style={{color: "#888", fontSize: 13, marginBottom: 20}}>Créez un planning sur 7 jours</p>
        <textarea style={{width: "100%", minHeight: 120, padding: 14, borderRadius: 14, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 14, outline: "none", marginBottom: 16}} placeholder="Collez votre cours..." value={courseText} onChange={e => setCourseText(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} style={{width: "100%", padding: 16, borderRadius: 14, border: "none", background: loading ? "#444" : "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"}}>
          {loading ? "⏳ Génération..." : "🚀 Créer le planning"}
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 20}}>📅 Planning d'étude</h2>
      <div style={{padding: 20, background: "#0e0e1d", border: "1px solid #333", borderRadius: 12, marginBottom: 20, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: "1.8"}}>
        {planning}
      </div>
      <button onClick={() => { setPlanning(""); setCourseText(""); }} style={{width: "100%", padding: 14, borderRadius: 12, border: "1px solid #6C5CE7", background: "#6C5CE715", color: "#6C5CE7", fontSize: 14, fontWeight: 700, cursor: "pointer"}}>🔄 Nouveau planning</button>
    </div>
  );
}

function SummaryScreen() {
  const [courseText, setCourseText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!courseText.trim()) {
      alert("Veuillez coller un cours.");
      return;
    }
    setLoading(true);
    const result = await generateSummary(courseText);
    setSummary(result);
    setLoading(false);
  };

  if (!summary) {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 10}}>📄 Résumé IA</h2>
        <p style={{color: "#888", fontSize: 13, marginBottom: 20}}>Générez un résumé structuré</p>
        <textarea style={{width: "100%", minHeight: 120, padding: 14, borderRadius: 14, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 14, outline: "none", marginBottom: 16}} placeholder="Collez votre cours..." value={courseText} onChange={e => setCourseText(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} style={{width: "100%", padding: 16, borderRadius: 14, border: "none", background: loading ? "#444" : "linear-gradient(135deg, #6C5CE7, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"}}>
          {loading ? "⏳ Génération..." : "🚀 Générer le résumé"}
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: "#6C5CE7", fontSize: 22, fontWeight: 800, marginBottom: 20}}>📄 Résumé</h2>
      <div style={{padding: 20, background: "#0e0e1d", border: "1px solid #333", borderRadius: 12, marginBottom: 20, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: "1.8"}}>
        {summary}
      </div>
      <button onClick={() => { setSummary(""); setCourseText(""); }} style={{width: "100%", padding: 14, borderRadius: 12, border: "1px solid #6C5CE7", background: "#6C5CE715", color: "#6C5CE7", fontSize: 14, fontWeight: 700, cursor: "pointer"}}>🔄 Nouveau résumé</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNINGPAGE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function LearningPage() {
  const [tab, setTab] = useState<"summary" | "quiz" | "exam" | "chat" | "flashcards" | "planning">("summary");

  const tabs = [
    { id: "summary", name: "Résumé", icon: "📄" },
    { id: "quiz", name: "Quiz", icon: "🧩" },
    { id: "exam", name: "Examen", icon: "📝" },
    { id: "chat", name: "Chat", icon: "💬" },
    { id: "flashcards", name: "Fiches", icon: "📋" },
    { id: "planning", name: "Planning", icon: "📅" }
  ];

  return (
    <div style={{minHeight: "100vh", background: "#07070f"}}>
      {/* Bouton retour */}
      <div style={{padding: "16px 20px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 12}}>
        <button 
          onClick={() => window.location.hash = '#/dashboard'}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "#1a1a2e",
            color: "#888",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          ← Tableau de bord
        </button>
        <div style={{fontSize: 18, fontWeight: 700, color: "#e8e8f8"}}>
          📚 Espace d'apprentissage
        </div>
      </div>

      {/* Tabs */}
      <div style={{borderBottom: "1px solid #333", padding: "16px 20px", display: "flex", gap: 8, overflowX: "auto"}}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{padding: "10px 20px", borderRadius: 10, border: tab === t.id ? "1px solid #6C5CE7" : "1px solid #333", background: tab === t.id ? "#6C5CE715" : "#1a1a2e", color: tab === t.id ? "#6C5CE7" : "#888", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"}}>
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div>
        {tab === "summary" && <SummaryScreen />}
        {tab === "quiz" && <QuizScreen />}
        {tab === "exam" && <ExamScreen />}
        {tab === "chat" && <ChatScreen />}
        {tab === "flashcards" && <FlashcardsScreen />}
        {tab === "planning" && <PlanningScreen />}
      </div>
    </div>
  );
}
