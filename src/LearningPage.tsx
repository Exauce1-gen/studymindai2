import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ API INTEGRATION
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

// Fonctions de génération avec IA
async function generateSummary(text: string): Promise<string> {
  return await callGroq(
    `Tu es un assistant pédagogique expert. Génère un résumé ULTRA-COURT et STRUCTURÉ en français.

Format OBLIGATOIRE :
📌 CONCEPT : [nom du concept en 1 ligne]
📐 FORMULE : [formule mathématique si applicable, sinon skip]
📝 DÉFINITION : [définition en 1 phrase courte max 20 mots]
🔑 POINTS CLÉS : 
• [point 1 en 10 mots max]
• [point 2 en 10 mots max]
• [point 3 en 10 mots max]

Sois ULTRA-CONCIS. Pas de blabla. Style télégraphique.`,
    `Résume ce cours de façon ULTRA-COURTE et STRUCTURÉE :\n\n${text}`
  );
}

async function generateQuiz(text: string): Promise<Question[]> {
  const raw = await callGroq(
    `Tu es un professeur expert. Génère exactement 5 questions QCM en français.

RÈGLES STRICTES :
- Les RÉPONSES DOIVENT ÊTRE DANS LES OPTIONS (A, B, C, D)
- Si question = "Quelle est la formule ?", alors UNE option doit contenir la VRAIE formule
- Si question = "Qu'est-ce que X ?", alors UNE option doit contenir la VRAIE définition
- Les mauvaises réponses doivent être PLAUSIBLES mais FAUSSES

Format EXACT :
Q1: [question claire et précise]
A) [réponse complète] B) [réponse complète] C) [réponse complète] D) [réponse complète]
Réponse: [A/B/C/D]
Explication: [pourquoi c'est cette réponse en 1 phrase]

Exemple CORRECT :
Q1: Quelle est la formule de la loi d'Ohm ?
A) U = R × I  B) P = U × I  C) E = m × c²  D) F = m × a
Réponse: A
Explication: La loi d'Ohm établit que la tension U est égale à la résistance R multipliée par l'intensité I.

Répète ce format pour Q2, Q3, Q4, Q5.`,
    `Cours : ${text}`
  );
  
  const questions: Question[] = [];
  const blocks = raw.split(/\n(?=Q\d+[:\.])/g);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean);
    if (!lines.length) continue;
    
    const qMatch = lines[0].match(/Q\d+[:\.]?\s*(.+)/);
    if (!qMatch) continue;
    
    const question = qMatch[1].trim();
    const options: string[] = [];
    let correct = 0;
    let explanation = '';
    
    for (const line of lines.slice(1)) {
      const o = line.match(/^([A-D])[)\.:\s]\s*(.+)/);
      if (o) {
        options.push(o[2].trim());
        continue;
      }
      
      const c = line.match(/R[ée]ponse\s*[:\-]\s*([A-D])/i);
      if (c) {
        correct = c[1].charCodeAt(0) - 65;
        continue;
      }
      
      const e = line.match(/Explication\s*[:\-]\s*(.+)/i);
      if (e) explanation = e[1].trim();
    }
    
    if (options.length >= 2) {
      questions.push({ question, options, correct, explanation });
    }
  }
  
  return questions.length > 0 ? questions : [
    {
      question: "Question basée sur le cours",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
      explanation: "Explication de la réponse correcte."
    }
  ];
}

async function generateCards(text: string): Promise<Card[]> {
  const raw = await callGroq(
    `Génère exactement 6 fiches de révision en français.
Format strict :
1. [Concept clé]
Réponse: [explication courte et claire]

Répète pour 2, 3, 4, 5, 6.`,
    `Cours : ${text}`
  );
  
  const cards: Card[] = [];
  const blocks = raw.split(/\n(?=\d+[\.:])/g);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean);
    if (lines.length < 2) continue;
    
    const front = lines[0].replace(/^\d+[\.:\s]+/, '').trim();
    const back = lines.slice(1).join(' ').replace(/^[Rr][ée]ponse[:\s-]+/, '').trim();
    
    if (front && back) cards.push({ front, back });
  }
  
  return cards.length > 0 ? cards : [
    { front: "Concept 1", back: "Explication du concept 1" },
    { front: "Concept 2", back: "Explication du concept 2" }
  ];
}

async function generateExam(text: string, subject: string): Promise<string> {
  const raw = await callGroq(
    `Tu es un professeur qui crée des examens. Génère un examen complet en français de 5 questions.

RÈGLES :
- Questions variées : QCM, vrai/faux, calculs, définitions
- Difficulté progressive (facile → difficile)
- Chaque question vaut 4 points (total 20 points)
- Fournis les SOLUTIONS COMPLÈTES à la fin

Format EXACT :
EXAMEN : [Matière]
Durée : 1h | Total : 20 points

Question 1 (4 points) : [Question facile]
[Espace pour réponse]

Question 2 (4 points) : [Question moyenne]
[Espace pour réponse]

Question 3 (4 points) : [Question moyenne]
[Espace pour réponse]

Question 4 (4 points) : [Question difficile]
[Espace pour réponse]

Question 5 (4 points) : [Question difficile avec calcul]
[Espace pour réponse]

---
CORRIGÉ (à ne consulter qu'après avoir terminé)
---

Q1: [Solution détaillée]
Q2: [Solution détaillée]
Q3: [Solution détaillée]
Q4: [Solution détaillée]
Q5: [Solution détaillée]`,
    `Sujet de l'examen : ${subject}\nCours de référence : ${text}`
  );
  
  return raw;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Card {
  front: string;
  back: string;
}

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface Subject {
  name: string;
}

interface Session {
  day: string;
  subject: string;
  duration: string;
  done: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCHANTILLONS DE COURS
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLES: Record<string, string> = {
  bio: "La mitose est le processus de division cellulaire par lequel une cellule mère se divise en deux cellules filles génétiquement identiques. Elle se déroule en 4 phases : prophase, métaphase, anaphase et télophase.",
  hist: "La Révolution française (1789-1799) débute avec la prise de la Bastille le 14 juillet 1789. La Déclaration des droits de l'homme proclame liberté, égalité et fraternité. La monarchie est abolie en 1792.",
  phys: "La relativité restreinte d'Einstein (1905) repose sur deux postulats : les lois physiques sont identiques dans tous les référentiels inertiels, et la vitesse de la lumière est constante."
};

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN RÉSUMÉ
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  const go = async () => {
    if (!text.trim()) { alert("Entre du texte"); return; }
    setLoading(true); setResult('');
    const r = await generateSummary(text);
    setResult(r); setLoading(false);
  };

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>📄 Résumé IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>Colle ton cours, l'IA le résume avec Groq</p>
      
      <textarea 
        style={{width: '100%', minHeight: 120, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical'}}
        placeholder="Colle ton cours ici…" 
        value={text} 
        onChange={e => setText(e.target.value)}
      />
      
      <div style={{display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap'}}>
        {[["🧬 Bio", SAMPLES.bio], ["🏛️ Hist", SAMPLES.hist], ["⚛️ Phys", SAMPLES.phys]].map(([l,s]) => (
          <button key={l} onClick={() => setText(s as string)} style={{padding: '7px 14px', borderRadius: 20, border: '1px solid #444', background: '#1a1a2e', color: '#888', cursor: 'pointer', fontSize: 12}}>{l}</button>
        ))}
      </div>
      
      <button onClick={go} disabled={loading || !text.trim()} style={{width: '100%', marginTop: 16, padding: 16, borderRadius: 14, border: 'none', background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1}}>
        {loading ? "⏳ IA Groq analyse…" : "✨ Générer le résumé IA"}
      </button>
      
      {loading && <div style={{textAlign: 'center', padding: 24, color: '#6C5CE7'}}>Groq AI analyse votre cours...</div>}
      
      {result && (
        <div style={{marginTop: 20, padding: 20, borderRadius: 16, background: '#0e0e1d', border: '1px solid #333'}}>
          <div style={{fontSize: 11, color: '#6C5CE7', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase'}}>✦ Résumé généré par Groq AI</div>
          <div style={{fontSize: 14, lineHeight: 1.8, color: '#e8e8f8', whiteSpace: 'pre-wrap'}}>{result}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN QUIZ
// ═══════════════════════════════════════════════════════════════════════════════

function QuizScreen() {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'input' | 'playing' | 'done'>('input');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!text.trim()) { alert("Entre du texte"); return; }
    setLoading(true);
    const q = await generateQuiz(text);
    setQuestions(q); setCurrent(0); setSelected(null); setScore(0); setPhase('playing');
    setLoading(false);
  };

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[current].correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setPhase('done'); }
    else { setCurrent(c => c + 1); setSelected(null); }
  };

  const restart = () => { setPhase('input'); setText(''); setQuestions([]); };

  if (phase === 'input') return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>🧩 Quiz IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>Groq génère 5 QCM automatiques</p>
      <textarea style={{width: '100%', minHeight: 120, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none'}} placeholder="Colle ton cours…" value={text} onChange={e => setText(e.target.value)}/>
      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        {[["🧬 Bio", SAMPLES.bio], ["🏛️ Hist", SAMPLES.hist]].map(([l,s]) => <button key={l} onClick={() => setText(s as string)} style={{padding: '7px 14px', borderRadius: 20, border: '1px solid #444', background: '#1a1a2e', color: '#888', cursor: 'pointer', fontSize: 12}}>{l}</button>)}
      </div>
      <button onClick={generate} disabled={loading || !text.trim()} style={{width: '100%', marginTop: 16, padding: 16, borderRadius: 14, border: 'none', background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'}}>{loading ? "⏳ IA génère…" : "🧩 Générer le quiz IA"}</button>
      {loading && <div style={{textAlign: 'center', padding: 24, color: '#6C5CE7'}}>Groq crée vos questions...</div>}
    </div>
  );

  if (phase === 'done') {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{padding: 20, textAlign: 'center'}}>
        <div style={{fontSize: 52, marginBottom: 16}}>{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}</div>
        <div style={{fontSize: 36, fontWeight: 800, color: '#6C5CE7', marginBottom: 8}}>{score}/{questions.length}</div>
        <div style={{fontSize: 14, color: '#888', marginBottom: 20}}>{pct}% de réussite</div>
        <button onClick={restart} style={{padding: '14px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer'}}>🔄 Nouveau quiz</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{padding: 20}}>
      <div style={{background: '#0e0e1d', border: '1px solid #333', borderRadius: 16, overflow: 'hidden'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontWeight: 700, fontSize: 14}}>Quiz IA</span>
          <span style={{background: 'rgba(0,206,201,0.12)', color: '#00cec9', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700}}>✦ {score}/{questions.length}</span>
        </div>
        <div style={{height: 3, background: '#1a1a2e'}}>
          <div style={{height: '100%', background: 'linear-gradient(90deg, #6C5CE7, #fd79a8)', width: `${(current / questions.length) * 100}%`, transition: 'width 0.4s'}}/>
        </div>
        <div style={{padding: 18}}>
          <div style={{fontSize: 11, color: '#888', marginBottom: 8}}>Question {current + 1} sur {questions.length}</div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 18, lineHeight: 1.4}}>{q.question}</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {q.options.map((opt, i) => {
              let cls: React.CSSProperties = {background: '#1a1a2e', border: '1px solid #333', color: '#e8e8f8'};
              if (selected !== null) {
                if (i === q.correct) cls = {background: 'rgba(0,206,201,0.08)', border: '1px solid #00cec9', color: '#00cec9'};
                else if (i === selected) cls = {background: 'rgba(253,121,168,0.08)', border: '1px solid #fd79a8', color: '#fd79a8'};
              }
              return (
                <button key={i} onClick={() => pick(i)} disabled={selected !== null} style={{...cls, padding: '12px 16px', borderRadius: 12, cursor: selected !== null ? 'default' : 'pointer', fontSize: 13, textAlign: 'left', fontWeight: 500, transition: 'all 0.2s'}}>
                  <span style={{marginRight: 12, fontWeight: 700}}>{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected !== null && q.explanation && (
            <div style={{marginTop: 12, padding: '12px 14px', background: 'rgba(108,92,231,0.08)', border: '1px solid #333', borderLeft: '3px solid #6C5CE7', borderRadius: 10, fontSize: 13, color: '#888', lineHeight: 1.6}}>💡 {q.explanation}</div>
          )}
        </div>
        {selected !== null && (
          <div style={{padding: '12px 18px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: 10}}>
            <button onClick={restart} style={{padding: '9px 18px', background: '#1a1a2e', border: '1px solid #333', borderRadius: 11, color: '#e8e8f8', fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>Quitter</button>
            <button onClick={next} style={{padding: '9px 18px', background: '#1a1a2e', border: '1px solid #333', borderRadius: 11, color: '#e8e8f8', fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>{current + 1 >= questions.length ? "Résultats →" : "Suivant →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN EXAMEN
// ═══════════════════════════════════════════════════════════════════════════════

// Nouveau composant ExamScreen avec QCM interactif
// À REMPLACER dans LearningPage.tsx (remplace l'ancien ExamScreen)

interface ExamQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM SCREEN - QCM INTERACTIF AVEC NOTATION (VERSION CORRIGÉE)
// ═══════════════════════════════════════════════════════════════════════════════

interface ExamQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function ExamScreen() {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateExamQCM = async () => {
    if (!text.trim() || !subject.trim()) {
      alert("Entre le sujet ET colle ton cours");
      return;
    }

    try {
      setLoading(true);
      setQuestions([]);
      setUserAnswers([]);
      setSubmitted(false);

      const systemPrompt = `Tu es un professeur expert. Crée un examen de 5 questions à choix multiples (QCM).

RÈGLES STRICTES :
1. Exactement 5 questions
2. Chaque question a exactement 4 options
3. UNE SEULE bonne réponse par question (index 0-3)
4. Difficulté croissante
5. Chaque question vaut 4 points (total 20 points)

FORMAT JSON (réponds UNIQUEMENT avec ce JSON, rien d'autre) :
{
  "questions": [
    {
      "question": "Quelle est la capitale de la France ?",
      "options": ["Londres", "Paris", "Berlin", "Madrid"],
      "correctAnswer": 1,
      "explanation": "Paris est la capitale de la France depuis 987."
    }
  ]
}`;

      const userMessage = `Sujet de l'examen : ${subject}

Cours de référence :
${text}`;

      const response = await callGroq(systemPrompt, userMessage);
      
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.questions || parsed.questions.length === 0) {
        throw new Error('Format invalide');
      }

      setQuestions(parsed.questions);
      setUserAnswers(new Array(parsed.questions.length).fill(null));
      
    } catch (error: any) {
      console.error('Erreur génération examen:', error);
      alert(`Erreur: ${error.message || 'Impossible de générer l\'examen. Réessayez.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (userAnswers.some(answer => answer === null)) {
      alert('Répondez à toutes les questions avant de soumettre !');
      return;
    }

    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) correctCount++;
    });

    setScore(correctCount * 4);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setQuestions([]);
    setUserAnswers([]);
    setSubmitted(false);
    setScore(0);
    setText('');
    setSubject('');
  };

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>📝 Examen IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>QCM avec correction automatique</p>

      {questions.length === 0 ? (
        <>
          <input
            style={{width: '100%', marginBottom: 12, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none'}}
            placeholder="Sujet (ex: Photosynthèse, Révolution française...)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <textarea
            style={{width: '100%', minHeight: 100, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none'}}
            placeholder="Colle ton cours de référence..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button
            onClick={generateExamQCM}
            disabled={loading || !text.trim() || !subject.trim()}
            style={{width: '100%', marginTop: 16, padding: 16, borderRadius: 14, border: 'none', background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'}}
          >
            {loading ? "⏳ IA crée l'examen..." : "📝 Générer 5 QCM (20 points)"}
          </button>
          {loading && <div style={{textAlign: 'center', padding: 24, color: '#6C5CE7'}}>Groq prépare votre examen QCM...</div>}
        </>
      ) : (
        <div>
          {submitted && (
            <div style={{
              background: score >= 16 ? 'rgba(0,206,201,0.15)' : score >= 12 ? 'rgba(253,121,168,0.15)' : 'rgba(255,107,107,0.15)',
              border: `2px solid ${score >= 16 ? '#00cec9' : score >= 12 ? '#fd79a8' : '#ff6b6b'}`,
              borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center'
            }}>
              <div style={{fontSize: 48, marginBottom: 12}}>
                {score >= 16 ? '🎉' : score >= 12 ? '👍' : '💪'}
              </div>
              <div style={{fontSize: 32, fontWeight: 800, color: score >= 16 ? '#00cec9' : score >= 12 ? '#fd79a8' : '#ff6b6b', marginBottom: 8}}>
                {score}/20
              </div>
              <div style={{fontSize: 16, color: '#e8e8f8', fontWeight: 600}}>
                {score >= 16 ? 'Excellent ! Très bien maîtrisé !' : score >= 12 ? 'Bien ! Encore quelques efforts.' : 'Continue, tu vas y arriver !'}
              </div>
            </div>
          )}

          {questions.map((q, qIndex) => {
            const userAnswer = userAnswers[qIndex];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={qIndex} style={{
                background: '#0e0e1d',
                border: submitted ? (isCorrect ? '2px solid #00cec9' : '2px solid #ff6b6b') : '1px solid #333',
                borderRadius: 16, padding: 20, marginBottom: 16
              }}>
                <div style={{display: 'flex', gap: 12, marginBottom: 16}}>
                  <div style={{
                    background: submitted ? (isCorrect ? '#00cec9' : '#ff6b6b') : '#6C5CE7',
                    color: '#fff', width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, flexShrink: 0
                  }}>
                    {qIndex + 1}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 16, fontWeight: 700, color: '#e8e8f8', lineHeight: 1.5}}>
                      {q.question}
                    </div>
                    <div style={{fontSize: 12, color: '#888', marginTop: 4}}>4 points</div>
                  </div>
                  {submitted && <div style={{fontSize: 24}}>{isCorrect ? '✅' : '❌'}</div>}
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                  {q.options.map((option, oIndex) => {
                    const isSelected = userAnswer === oIndex;
                    const isCorrectOption = oIndex === q.correctAnswer;
                    const showCorrect = submitted && isCorrectOption;
                    const showWrong = submitted && isSelected && !isCorrectOption;

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        disabled={submitted}
                        style={{
                          padding: '14px 16px', borderRadius: 12,
                          border: showCorrect ? '2px solid #00cec9' : showWrong ? '2px solid #ff6b6b' : isSelected ? '2px solid #6C5CE7' : '1px solid #444',
                          background: showCorrect ? 'rgba(0,206,201,0.1)' : showWrong ? 'rgba(255,107,107,0.1)' : isSelected ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                          color: '#e8e8f8', fontSize: 14, fontWeight: isSelected ? 600 : 400,
                          cursor: submitted ? 'not-allowed' : 'pointer',
                          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: showCorrect ? '2px solid #00cec9' : showWrong ? '2px solid #ff6b6b' : isSelected ? '2px solid #6C5CE7' : '2px solid #444',
                          background: isSelected ? (showCorrect ? '#00cec9' : showWrong ? '#ff6b6b' : '#6C5CE7') : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0
                        }}>
                          {isSelected && (showCorrect ? '✓' : showWrong ? '✗' : '✓')}
                        </div>
                        <span style={{flex: 1}}>{option}</span>
                        {showCorrect && <span style={{color: '#00cec9', fontSize: 18}}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div style={{
                    marginTop: 16, padding: 14,
                    background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 10
                  }}>
                    <div style={{fontSize: 12, color: '#6C5CE7', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase'}}>
                      💡 Explication
                    </div>
                    <div style={{fontSize: 14, color: '#e8e8f8', lineHeight: 1.6}}>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{display: 'flex', gap: 12, marginTop: 24}}>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={userAnswers.some(a => a === null)}
                style={{
                  flex: 1, padding: '16px 20px', borderRadius: 14, border: 'none',
                  background: userAnswers.some(a => a === null) ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                  color: '#fff', fontSize: 16, fontWeight: 800,
                  cursor: userAnswers.some(a => a === null) ? 'not-allowed' : 'pointer',
                  boxShadow: userAnswers.some(a => a === null) ? 'none' : '0 8px 24px rgba(108,92,231,0.4)'
                }}
              >
                📊 Soumettre l'examen
              </button>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '16px 20px', borderRadius: 14,
                  border: '1px solid #6C5CE7', background: 'rgba(108,92,231,0.15)',
                  color: '#6C5CE7', fontSize: 16, fontWeight: 800, cursor: 'pointer'
                }}
              >
                🔄 Nouvel examen
              </button>
            )}
          </div>

          {!submitted && userAnswers.some(a => a === null) && (
            <div style={{textAlign: 'center', marginTop: 16, color: '#888', fontSize: 13}}>
              Répondez à toutes les questions pour soumettre
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN CHAT
// ═══════════════════════════════════════════════════════════════════════════════

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([{role: 'ai', text: "Bonjour ! 👋 Je suis ton assistant StudyMind AI propulsé par Groq. Pose-moi n'importe quelle question sur tes cours !"}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior: 'smooth'}); }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, {role: 'user', text: q}]);
    setLoading(true);
    
    const reply = await callGroq(
      "Tu es StudyMind AI, un assistant scolaire bienveillant et expert. Réponds en français, de façon claire, pédagogique et encourageante. Utilise des analogies et exemples concrets. Sois concis.",
      q
    );
    
    setMessages(m => [...m, {role: 'ai', text: reply}]);
    setLoading(false);
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>💬 Chat IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>Discute avec Groq AI</p>
      
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', paddingBottom: 12}}>
        {messages.map((m, i) => (
          <div key={i} style={{display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row'}}>
            <div style={{width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: m.role === 'ai' ? 'linear-gradient(135deg, #6C5CE7, #00cec9)' : 'linear-gradient(135deg, #fd79a8, #e17055)'}}>{m.role === 'ai' ? '🤖' : '👤'}</div>
            <div style={{maxWidth: '80%', padding: '10px 13px', fontSize: 12, lineHeight: 1.65, borderRadius: m.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: m.role === 'ai' ? '#0e0e1d' : 'linear-gradient(135deg, #6C5CE7, #5649c0)', border: m.role === 'ai' ? '1px solid #333' : 'none', color: '#fff'}}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{display: 'flex', gap: 10}}><div style={{width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7, #00cec9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13}}>🤖</div><div style={{padding: '11px 14px', background: '#0e0e1d', border: '1px solid #333', borderRadius: '4px 16px 16px 16px'}}><div style={{display: 'flex', gap: 4}}>{[0,1,2].map(i => <span key={i} style={{width: 6, height: 6, borderRadius: '50%', background: '#6C5CE7', animation: 'bounce 1s infinite', animationDelay: `${i*0.2}s`}}/>)}</div></div></div>}
        <div ref={bottomRef}/>
      </div>
      
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 12, borderTop: '1px solid #333', marginTop: 8}}>
        <textarea style={{flex: 1, background: '#1a1a2e', border: '1px solid #333', borderRadius: 13, padding: '10px 13px', color: '#fff', fontSize: 12, outline: 'none', resize: 'none', maxHeight: 90, lineHeight: 1.5}} placeholder="Pose ta question…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} rows={1}/>
        <button onClick={send} disabled={loading || !input.trim()} style={{width: 38, height: 38, background: loading || !input.trim() ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', border: 'none', borderRadius: '50%', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: '0 4px 12px rgba(108,92,231,0.35)'}}>➤</button>
      </div>
      
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: scale(1); opacity: 1; } 30% { transform: scale(1.4); opacity: 0.7; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN FICHES
// ═══════════════════════════════════════════════════════════════════════════════

function CardsScreen() {
  const [text, setText] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!text.trim()) { alert("Entre du texte"); return; }
    setLoading(true); setCards([]);
    const c = await generateCards(text);
    setCards(c); setLoading(false);
  };

  return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>📋 Fiches IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>Groq génère 6 fiches de révision</p>
      <textarea style={{width: '100%', minHeight: 100, padding: 14, borderRadius: 14, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none'}} placeholder="Colle ton cours…" value={text} onChange={e => setText(e.target.value)}/>
      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        {[["🧬 Bio", SAMPLES.bio], ["🏛️ Hist", SAMPLES.hist]].map(([l,s]) => <button key={l} onClick={() => setText(s as string)} style={{padding: '7px 14px', borderRadius: 20, border: '1px solid #444', background: '#1a1a2e', color: '#888', cursor: 'pointer', fontSize: 12}}>{l}</button>)}
      </div>
      <button onClick={generate} disabled={loading || !text.trim()} style={{width: '100%', marginTop: 16, padding: 16, borderRadius: 14, border: 'none', background: loading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'}}>{loading ? "⏳ IA génère…" : "📋 Générer les fiches IA"}</button>
      {loading && <div style={{textAlign: 'center', padding: 24, color: '#6C5CE7'}}>Groq crée vos fiches...</div>}
      {cards.length > 0 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16}}>
          {cards.map((c, i) => (
            <div key={i} style={{background: '#0e0e1d', border: '1px solid #333', borderRadius: 16, overflow: 'hidden'}}>
              <div style={{padding: '13px 15px', background: 'linear-gradient(135deg, rgba(108,92,231,0.09), rgba(253,121,168,0.04))', borderBottom: '1px solid #333'}}>
                <div style={{fontSize: 9, color: '#6C5CE7', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3}}>Fiche {i + 1}</div>
                <div style={{fontSize: 13, fontWeight: 700}}>{c.front}</div>
              </div>
              <div style={{padding: '13px 15px', fontSize: 12, lineHeight: 1.65, color: '#888'}}>{c.back}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉCRAN PLANNING
// ═══════════════════════════════════════════════════════════════════════════════

function PlanningScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([{name: "Mathématiques"}, {name: "Histoire"}]);
  const [newSubj, setNewSubj] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [phase, setPhase] = useState<'setup' | 'plan'>('setup');

  const addSubj = () => { if (newSubj.trim() && subjects.length < 5) { setSubjects(s => [...s, {name: newSubj.trim()}]); setNewSubj(''); } };
  const removeSubj = (i: number) => setSubjects(s => s.filter((_, idx) => idx !== i));

  const generate = async () => {
    if (!subjects.length) return;
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const sess = days.map((d, i) => ({day: d, subject: subjects[i % subjects.length].name, duration: "2h", done: false}));
    setSessions(sess);
    setPhase('plan');
  };

  const toggle = (i: number) => setSessions(s => s.map((sess, idx) => idx === i ? {...sess, done: !sess.done} : sess));

  if (phase === 'setup') return (
    <div style={{padding: 20}}>
      <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 22, fontWeight: 800}}>📅 Planning IA</h2>
      <p style={{color: '#888', fontSize: 13, marginBottom: 15}}>Crée ton planning de révisions</p>
      
      <div style={{marginBottom: 16}}>
        <div style={{fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase'}}>Tes matières</div>
        <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
          <input style={{flex: 1, background: '#1a1a2e', border: '1px solid #333', borderRadius: 11, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none'}} placeholder="Ajouter une matière…" value={newSubj} onChange={e => setNewSubj(e.target.value)} onKeyDown={e => {if(e.key==='Enter') addSubj();}}/>
          <button onClick={addSubj} disabled={!newSubj.trim() || subjects.length >= 5} style={{padding: '10px 16px', background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 12, fontWeight: 700, cursor: subjects.length >= 5 ? 'not-allowed' : 'pointer'}}>+ Ajouter</button>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
          {subjects.map((s, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.4)', color: '#6C5CE7'}}>
              {s.name}
              <button onClick={() => removeSubj(i)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.6, color: 'inherit'}}>×</button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={!subjects.length} style={{width: '100%', padding: 16, borderRadius: 14, border: 'none', background: !subjects.length ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: !subjects.length ? 'not-allowed' : 'pointer'}}>📅 Générer mon planning</button>
    </div>
  );

  const doneCount = sessions.filter(s => s.done).length;
  const pct = sessions.length > 0 ? Math.round((doneCount / sessions.length) * 100) : 0;

  return (
    <div style={{padding: 20}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <div><h2 style={{color: '#6C5CE7', fontSize: 22, fontWeight: 800, marginBottom: 4}}>Mon Planning</h2><p style={{color: '#888', fontSize: 13}}>Semaine de révisions</p></div>
        <button onClick={() => setPhase('setup')} style={{padding: '9px 18px', background: '#1a1a2e', border: '1px solid #333', borderRadius: 11, color: '#e8e8f8', fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>✏️ Modifier</button>
      </div>

      <div style={{background: '#0e0e1d', border: '1px solid #333', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16}}>
        <div style={{position: 'relative', width: 54, height: 54, flexShrink: 0}}>
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r="22" fill="none" stroke="#1a1a2e" strokeWidth="5"/>
            <circle cx="27" cy="27" r="22" fill="none" stroke="#6C5CE7" strokeWidth="5" strokeDasharray={2*Math.PI*22} strokeDashoffset={2*Math.PI*22*(1-pct/100)} strokeLinecap="round" transform="rotate(-90 27 27)" style={{transition: 'stroke-dashoffset 0.5s'}}/>
          </svg>
          <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 12, fontWeight: 800, color: '#6C5CE7'}}>{pct}%</div>
        </div>
        <div>
          <div style={{fontSize: 15, fontWeight: 800}}>{doneCount}/{sessions.length} sessions</div>
          <div style={{fontSize: 11, color: '#888', marginTop: 2}}>{pct === 100 ? "🏆 Semaine complète !" : pct >= 50 ? "💪 Continue !" : "🚀 C'est parti !"}</div>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {sessions.map((s, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, background: '#0e0e1d', border: '1px solid #333', borderRadius: 11, padding: '11px 13px', opacity: s.done ? 0.5 : 1}}>
            <div style={{width: 8, height: 8, borderRadius: '50%', background: '#6C5CE7', flexShrink: 0}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 10, color: '#888', fontWeight: 500}}>{s.day}</div>
              <div style={{fontSize: 13, fontWeight: 700, textDecoration: s.done ? 'line-through' : 'none'}}>{s.subject}</div>
            </div>
            <div style={{fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(108,92,231,0.15)', color: '#6C5CE7'}}>{s.duration}</div>
            <button onClick={() => toggle(i)} style={{width: 24, height: 24, borderRadius: '50%', border: s.done ? 'none' : '2px solid #333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: s.done ? '#00cec9' : 'transparent', color: s.done ? '#06060f' : 'transparent'}}>{s.done ? '✓' : ''}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

interface LearningPageProps {
  onBackToDashboard: () => void;
}

export default function LearningPage({ onBackToDashboard }: LearningPageProps) {
  const [tab, setTab] = useState<"summary" | "quiz" | "exam" | "chat" | "cards" | "planning">("summary");
  
  const tabs = [
    { id: "summary" as const, icon: "📄", label: "Résumé" },
    { id: "quiz" as const, icon: "🧩", label: "Quiz" },
    { id: "exam" as const, icon: "📝", label: "Examen" },
    { id: "chat" as const, icon: "💬", label: "Chat" },
    { id: "cards" as const, icon: "📋", label: "Fiches" },
    { id: "planning" as const, icon: "📅", label: "Planning" }
  ];

  return (
    <div style={{minHeight: '100vh', background: '#07070f', color: '#e8e8f8', fontFamily: 'system-ui'}}>
      <div style={{padding: '18px 20px', borderBottom: '1px solid rgba(108,92,231,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <button onClick={onBackToDashboard} style={{background: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.3)', padding: '8px 16px', borderRadius: 10, color: '#6C5CE7', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6}}>← Accueil</button>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 40, height: 40, background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 16px rgba(108,92,231,0.4)'}}>🧠</div>
            <div style={{fontWeight: 800, fontSize: 19, letterSpacing: '-0.4px'}}>Study<span style={{color: '#6C5CE7'}}>Mind</span> AI</div>
          </div>
        </div>
        <div style={{background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(253,121,168,0.1))', border: '1px solid rgba(108,92,231,0.3)', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#6C5CE7', display: 'flex', alignItems: 'center', gap: 6}}>⚡ <span>Groq AI</span></div>
      </div>

      <div style={{display: 'flex', padding: '12px 16px', gap: 6, borderBottom: '1px solid rgba(108,92,231,0.1)', overflowX: 'auto', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(12px)'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{flex: 1, minWidth: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', borderRadius: 13, border: tab === t.id ? '1px solid rgba(108,92,231,0.35)' : '1px solid transparent', background: tab === t.id ? 'rgba(108,92,231,0.12)' : 'transparent', color: tab === t.id ? '#6C5CE7' : '#666', cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'all 0.2s'}}>
            <span style={{fontSize: 19}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth: 850, margin: '0 auto'}}>
        {tab === "summary" && <SummaryScreen />}
        {tab === "quiz" && <QuizScreen />}
        {tab === "exam" && <ExamScreen />}
        {tab === "chat" && <ChatScreen />}
        {tab === "cards" && <CardsScreen />}
        {tab === "planning" && <PlanningScreen />}
      </div>
    </div>
  );
}
