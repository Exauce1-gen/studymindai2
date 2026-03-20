
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
- Génère EXACTEMENT 5 questions différentes`;

  const userMessage = `Cours à transformer en quiz :\n\n${text}`;

  try {
    const raw = await callGroq(systemPrompt, userMessage);
    
    let cleanedResponse = raw.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(cleanedResponse);
    
    if (parsed.questions && parsed.questions.length > 0) {
      return parsed.questions.map((q: any) => ({
        question: q.question,
        options: q.options || ["Réponse 1", "Réponse 2", "Réponse 3", "Réponse 4"],
        correct: q.correct || 0,
        explanation: q.explanation || "Bonne réponse !"
      }));
    }
  } catch (error) {
    console.error('Erreur parsing quiz:', error);
  }
  
  return [
    {
      question: "Quelle est l'idée principale de ce cours ?",
      options: [
        "Premier concept important du cours",
        "Deuxième concept du cours",
        "Troisième concept du cours",
        "Quatrième concept du cours"
      ],
      correct: 0,
      explanation: "Cette réponse correspond au concept principal développé dans le cours."
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

import { useState } from 'react';

// Types d'épreuves disponibles
const examTypes = [
  { id: 'maths', name: 'Mathématiques', duration: '3h', icon: '🔢', color: '#6C5CE7' },
  { id: 'physique', name: 'Physique-Chimie', duration: '3h', icon: '⚗️', color: '#00b894' },
  { id: 'philo', name: 'Philosophie', duration: '4h', icon: '🤔', color: '#fd79a8' },
  { id: 'svt', name: 'Sciences de la Vie', duration: '3h30', icon: '🧬', color: '#00cec9' },
  { id: 'histoire', name: 'Histoire-Géographie', duration: '4h', icon: '🌍', color: '#fdcb6e' },
  { id: 'francais', name: 'Français', duration: '4h', icon: '📚', color: '#e17055' },
  { id: 'anglais', name: 'Anglais', duration: '3h', icon: '🗣️', color: '#0984e3' }
];

interface Question {
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
    questions: Question[];
  }[];
}

export default function ExamScreen() {
  const [step, setStep] = useState<'select' | 'config' | 'exam' | 'results'>('select');
  const [selectedType, setSelectedType] = useState('');
  const [subject, setSubject] = useState('');
  const [courseText, setCourseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  // Générer l'examen avec Groq
  const generateExam = async () => {
    setLoading(true);
    
    const type = examTypes.find(t => t.id === selectedType);
    
    const systemPrompt = `Tu es un professeur créant une VRAIE épreuve d'examen type BAC/BEPC.

MATIÈRE : ${type?.name}
SUJET : ${subject}

STRUCTURE OBLIGATOIRE :

Tu dois créer un examen avec EXACTEMENT ce format JSON :

{
  "title": "Épreuve de ${type?.name} - ${subject}",
  "duration": "${type?.duration}",
  "totalPoints": 20,
  "parts": [
    {
      "title": "PARTIE I : [Nom de la partie]",
      "points": 8,
      "questions": [
        {
          "id": 1,
          "question": "[Énoncé complet et détaillé de la question]",
          "options": [
            "[Option A - réponse complète]",
            "[Option B - réponse complète]",
            "[Option C - réponse complète]",
            "[Option D - réponse complète]"
          ],
          "correctAnswer": 0,
          "points": 2,
          "explanation": "[Explication détaillée de pourquoi c'est A]"
        }
      ]
    },
    {
      "title": "PARTIE II : [Nom de la partie]",
      "points": 12,
      "questions": [...]
    }
  ]
}

RÈGLES IMPORTANTES :
1. Crée 2-3 parties différentes
2. Chaque partie a 3-5 questions
3. Total : 10-15 questions
4. Les questions doivent être DÉTAILLÉES et RÉALISTES
5. Les options doivent être COMPLÈTES (pas juste A, B, C, D)
6. correctAnswer est l'INDEX (0=A, 1=B, 2=C, 3=D)
7. Total des points = 20

RÉPONDS UNIQUEMENT AVEC LE JSON, RIEN D'AUTRE.`;

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
            { role: 'user', content: `Cours de référence :\n\n${courseText}` }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      const data = await response.json();
      let examText = data.choices[0].message.content;
      
      // Nettoyer le JSON (enlever markdown si présent)
      examText = examText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const exam = JSON.parse(examText);
      setExamData(exam);
      setStep('exam');
      
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre l'examen et calculer la note
  const submitExam = () => {
    if (!examData) return;
    
    let totalQuestions = 0;
    examData.parts.forEach(part => {
      totalQuestions += part.questions.length;
    });

    if (Object.keys(userAnswers).length < totalQuestions) {
      if (!confirm('Vous n\'avez pas répondu à toutes les questions. Voulez-vous quand même soumettre ?')) {
        return;
      }
    }

    setShowResults(true);
  };

  // Calculer la note
  const calculateScore = () => {
    if (!examData) return 0;
    
    let score = 0;
    examData.parts.forEach(part => {
      part.questions.forEach(q => {
        const answer = userAnswers[`${part.title}-${q.id}`];
        if (answer === q.correctAnswer) {
          score += q.points;
        }
      });
    });
    
    return score;
  };

  // Écran de sélection du type
  if (step === 'select') {
    return (
      <div style={{padding: 20}}>
        <h2 style={{color: '#6C5CE7', marginBottom: 10, fontSize: 24, fontWeight: 800}}>
          📝 Épreuves d'Examen
        </h2>
        <p style={{color: '#888', fontSize: 14, marginBottom: 24}}>
          Entraînez-vous avec de vraies épreuves type BAC/BEPC
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16
        }}>
          {examTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                setStep('config');
              }}
              style={{
                padding: 20,
                borderRadius: 16,
                border: '1px solid #333',
                background: '#1a1a2e',
                color: '#e8e8f8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = type.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{fontSize: 32, marginBottom: 8}}>{type.icon}</div>
              <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>{type.name}</div>
              <div style={{fontSize: 12, color: '#888'}}>Durée : {type.duration}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Écran de configuration
  if (step === 'config') {
    const type = examTypes.find(t => t.id === selectedType);
    
    return (
      <div style={{padding: 20}}>
        <button
          onClick={() => setStep('select')}
          style={{
            marginBottom: 20,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#888',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          ← Retour
        </button>

        <div style={{
          padding: 20,
          background: `linear-gradient(135deg, ${type?.color}15, ${type?.color}05)`,
          border: `1px solid ${type?.color}30`,
          borderRadius: 16,
          marginBottom: 24
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>{type?.icon}</div>
          <h2 style={{fontSize: 24, fontWeight: 800, color: type?.color, marginBottom: 8}}>
            {type?.name}
          </h2>
          <p style={{fontSize: 14, color: '#888'}}>
            Durée : {type?.duration} • Format : QCM • Total : 20 points
          </p>
        </div>

        <input
          style={{
            width: '100%',
            marginBottom: 16,
            padding: 14,
            borderRadius: 14,
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 15,
            outline: 'none'
          }}
          placeholder="Sujet précis (ex: Les suites numériques, La Seconde Guerre mondiale...)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />

        <textarea
          style={{
            width: '100%',
            minHeight: 150,
            padding: 14,
            borderRadius: 14,
            border: '1px solid #333',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            marginBottom: 20,
            resize: 'vertical'
          }}
          placeholder="Collez votre cours de référence ici..."
          value={courseText}
          onChange={e => setCourseText(e.target.value)}
        />

        <button
          onClick={generateExam}
          disabled={loading || !subject.trim() || !courseText.trim()}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: loading ? '#444' : `linear-gradient(135deg, ${type?.color}, ${type?.color}dd)`,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : `0 8px 24px ${type?.color}40`
          }}
        >
          {loading ? '⏳ Création de l\'épreuve...' : '🚀 Générer l\'épreuve'}
        </button>
      </div>
    );
  }

  // Écran de l'examen
  if (step === 'exam' && examData) {
    return (
      <div style={{padding: 20}}>
        {/* En-tête de l'épreuve */}
        <div style={{
          padding: 24,
          background: '#1a1a2e',
          border: '2px solid #6C5CE7',
          borderRadius: 16,
          marginBottom: 32,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#888',
            marginBottom: 8,
            letterSpacing: 2
          }}>
            ÉPREUVE D'EXAMEN
          </div>
          <h1 style={{fontSize: 24, fontWeight: 900, color: '#e8e8f8', marginBottom: 8}}>
            {examData.title}
          </h1>
          <div style={{fontSize: 14, color: '#888'}}>
            Durée : {examData.duration} • Total : {examData.totalPoints} points
          </div>
        </div>

        {/* Consignes */}
        <div style={{
          padding: 16,
          background: 'rgba(108,92,231,0.1)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: 12,
          marginBottom: 32
        }}>
          <div style={{fontSize: 14, fontWeight: 700, color: '#6C5CE7', marginBottom: 8}}>
            📋 CONSIGNES
          </div>
          <ul style={{fontSize: 13, color: '#888', paddingLeft: 20, margin: 0}}>
            <li>Lisez attentivement chaque question</li>
            <li>Une seule réponse correcte par question</li>
            <li>Cliquez sur votre choix pour le sélectionner</li>
            <li>Vous pouvez modifier vos réponses avant de soumettre</li>
          </ul>
        </div>

        {/* Les parties */}
        {examData.parts.map((part, partIdx) => (
          <div key={partIdx} style={{marginBottom: 40}}>
            <div style={{
              padding: 16,
              background: 'linear-gradient(135deg, #6C5CE720, #6C5CE710)',
              borderLeft: '4px solid #6C5CE7',
              borderRadius: 8,
              marginBottom: 24
            }}>
              <h3 style={{fontSize: 18, fontWeight: 800, color: '#6C5CE7', marginBottom: 4}}>
                {part.title}
              </h3>
              <div style={{fontSize: 13, color: '#888'}}>
                {part.points} points • {part.questions.length} questions
              </div>
            </div>

            {/* Les questions */}
            {part.questions.map((q, qIdx) => {
              const questionKey = `${part.title}-${q.id}`;
              const selected = userAnswers[questionKey];
              
              return (
                <div key={qIdx} style={{
                  marginBottom: 32,
                  padding: 20,
                  background: '#0e0e1d',
                  border: '1px solid #333',
                  borderRadius: 12
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{
                        fontSize: 12,
                        color: '#6C5CE7',
                        fontWeight: 700,
                        marginBottom: 8
                      }}>
                        Question {qIdx + 1}
                      </div>
                      <div style={{fontSize: 15, color: '#e8e8f8', lineHeight: 1.6}}>
                        {q.question}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      background: 'rgba(108,92,231,0.15)',
                      border: '1px solid rgba(108,92,231,0.3)',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#6C5CE7',
                      whiteSpace: 'nowrap',
                      marginLeft: 16
                    }}>
                      {q.points} pts
                    </div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                    {q.options.map((option, optIdx) => {
                      const isSelected = selected === optIdx;
                      const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                      
                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            setUserAnswers(prev => ({
                              ...prev,
                              [questionKey]: optIdx
                            }));
                          }}
                          style={{
                            padding: '14px 16px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid #6C5CE7' : '1px solid #333',
                            background: isSelected ? 'rgba(108,92,231,0.15)' : '#1a1a2e',
                            color: '#e8e8f8',
                            fontSize: 14,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12
                          }}
                        >
                          <div style={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #6C5CE7' : '2px solid #333',
                            background: isSelected ? '#6C5CE7' : 'transparent',
                            color: isSelected ? '#fff' : '#888',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {letter}
                          </div>
                          <div style={{flex: 1, paddingTop: 4}}>
                            {option}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Bouton soumettre */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          padding: '20px 0',
          background: 'linear-gradient(to top, #07070f 70%, transparent)',
          marginTop: 40
        }}>
          <button
            onClick={submitExam}
            style={{
              width: '100%',
              padding: 18,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(108,92,231,0.4)'
            }}
          >
            📝 Soumettre l'examen
          </button>
        </div>

        {/* Résultats */}
        {showResults && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            overflowY: 'auto'
          }}>
            <div style={{
              maxWidth: 700,
              width: '100%',
              background: '#0e0e1d',
              border: '2px solid #6C5CE7',
              borderRadius: 20,
              padding: 40,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{textAlign: 'center', marginBottom: 32}}>
                <div style={{fontSize: 64, marginBottom: 16}}>
                  {calculateScore() >= 10 ? '🎉' : '📚'}
                </div>
                <h2 style={{fontSize: 28, fontWeight: 900, color: '#e8e8f8', marginBottom: 8}}>
                  {calculateScore() >= 10 ? 'Félicitations !' : 'Bon travail !'}
                </h2>
                <div style={{fontSize: 48, fontWeight: 900, color: '#6C5CE7', marginBottom: 8}}>
                  {calculateScore()}/20
                </div>
                <div style={{fontSize: 14, color: '#888'}}>
                  {calculateScore() >= 16 ? 'Excellent !' :
                   calculateScore() >= 14 ? 'Très bien !' :
                   calculateScore() >= 12 ? 'Bien !' :
                   calculateScore() >= 10 ? 'Passable' :
                   'À réviser'}
                </div>
              </div>

              {/* Corrections détaillées */}
              <div style={{marginBottom: 24}}>
                <h3 style={{fontSize: 18, fontWeight: 700, color: '#6C5CE7', marginBottom: 16}}>
                  📋 Corrections
                </h3>
                {examData.parts.map((part, partIdx) => (
                  <div key={partIdx} style={{marginBottom: 24}}>
                    <div style={{fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 12}}>
                      {part.title}
                    </div>
                    {part.questions.map((q, qIdx) => {
                      const questionKey = `${part.title}-${q.id}`;
                      const userAnswer = userAnswers[questionKey];
                      const isCorrect = userAnswer === q.correctAnswer;
                      
                      return (
                        <div key={qIdx} style={{
                          marginBottom: 16,
                          padding: 16,
                          background: isCorrect ? 'rgba(0,184,148,0.1)' : 'rgba(255,107,107,0.1)',
                          border: `1px solid ${isCorrect ? '#00b894' : '#ff6b6b'}`,
                          borderRadius: 10
                        }}>
                          <div style={{fontSize: 13, fontWeight: 700, marginBottom: 8}}>
                            {isCorrect ? '✅' : '❌'} Question {qIdx + 1}
                          </div>
                          <div style={{fontSize: 13, color: '#888', marginBottom: 8}}>
                            Votre réponse : {userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : 'Non répondu'}
                            {' • '}
                            Bonne réponse : {String.fromCharCode(65 + q.correctAnswer)}
                          </div>
                          <div style={{fontSize: 13, color: '#e8e8f8', lineHeight: 1.5}}>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep('select');
                  setExamData(null);
                  setUserAnswers({});
                  setShowResults(false);
                  setSubject('');
                  setCourseText('');
                }}
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Nouvelle épreuve
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
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
