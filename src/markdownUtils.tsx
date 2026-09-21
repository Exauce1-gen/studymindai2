import React from 'react';

// Filet de sécurité : nettoie les résidus de syntaxe LaTeX si jamais l'IA
// en génère malgré la consigne (ex: \(u_n\), \mathbb{N}, \frac{a}{b}).
function stripLatexArtifacts(text: string): string {
  return text
    // \frac{a}{b} -> a/b
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
    // \mathbb{N}, \mathbb N -> N
    .replace(/\\mathbb\{?([A-Za-z])\}?/g, '$1')
    // indices LaTeX : u_n -> un, u_{n+1} -> un+1
    .replace(/([a-zA-Z])_\{([^{}]*)\}/g, '$1$2')
    .replace(/([a-zA-Z])_([a-zA-Z0-9])/g, '$1$2')
    // délimiteurs \( \) \[ \] $$ $ -> supprimés (le contenu reste)
    .replace(/\\[()\[\]]/g, '')
    .replace(/\$\$?/g, '')
    // commandes restantes type \in, \times, \leq... -> symbole ou rien
    .replace(/\\in\b/g, '∈')
    .replace(/\\times\b/g, '×')
    .replace(/\\div\b/g, '÷')
    .replace(/\\leq\b/g, '≤')
    .replace(/\\geq\b/g, '≥')
    .replace(/\\sqrt\b/g, '√')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\[a-zA-Z]+/g, ''); // toute autre commande LaTeX orpheline
}

// Rendu inline : gère **gras**, *italique*/_italique_, `code`
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++} style={{ color: '#fff' }}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          style={{ background: '#2a2a3e', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      // *italique* ou _italique_
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/**
 * Convertit un texte Markdown (généré par l'IA) en JSX lisible :
 * titres (#, ##, ###), listes à puces (-, *), listes numérotées (1.),
 * gras (**), italique (*), code (`).
 * Évite d'afficher les symboles Markdown bruts (**, *, #) à l'utilisateur.
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const cleaned = stripLatexArtifacts(text);
  const lines = cleaned.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol key={elements.length} style={{ paddingLeft: 24, marginBottom: 14 }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: 6, lineHeight: 1.6 }}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} style={{ paddingLeft: 24, marginBottom: 14 }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: 6, lineHeight: 1.6 }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  const headingSizes: Record<number, number> = { 1: 23, 2: 20, 3: 18, 4: 16 };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.*)/);

    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      elements.push(
        <div
          key={elements.length}
          style={{
            fontSize: headingSizes[level] || 16,
            fontWeight: 800,
            color: '#e8e8f8',
            marginTop: elements.length === 0 ? 0 : 18,
            marginBottom: 8
          }}
        >
          {renderInline(headingMatch[2])}
        </div>
      );
    } else if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(numberedMatch[1]);
    } else if (line === '') {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={elements.length} style={{ marginBottom: 10, lineHeight: 1.7 }}>
          {renderInline(line)}
        </p>
      );
    }
  });
  flushList();

  return <>{elements}</>;
}
