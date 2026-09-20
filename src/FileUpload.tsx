import { useState } from 'react';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

// Détecte si le texte extrait est en réalité corrompu (données binaires mal
// interprétées, échec silencieux d'OCR/parsing) plutôt qu'un vrai texte lisible.
function isTextGarbage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;

  // Caractères "normaux" attendus dans un texte français lisible
  const goodCharsRegex = /[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s.,;:!?'"()\-%€]/g;
  const goodCount = (trimmed.match(goodCharsRegex) || []).length;
  const ratio = goodCount / trimmed.length;

  // Si moins de 80% des caractères sont "normaux", c'est probablement corrompu
  return ratio < 0.8;
}

export default function FileUpload({ 
  onTextExtracted, 
  acceptedTypes = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 10 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Utiliser PDF.js pour extraire le texte
      const pdfjsLib = (window as any).pdfjsLib;
      
      if (!pdfjsLib) {
        throw new Error('PDF.js non chargé');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Parcourir toutes les pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Erreur extraction PDF:', error);
      throw new Error('Impossible d\'extraire le texte du PDF');
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    let worker: any = null;
    try {
      // Utiliser Tesseract.js (API worker moderne, v5+)
      const Tesseract = (window as any).Tesseract;

      if (!Tesseract) {
        throw new Error('Tesseract.js non chargé');
      }

      worker = await Tesseract.createWorker('fra', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Timeout de sécurité : sur connexion très lente, le téléchargement du
      // moteur OCR / dictionnaire peut se corrompre silencieusement plutôt
      // que d'échouer proprement. On préfère un échec net après 60s.
      const recognizePromise = worker.recognize(file);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_OCR')), 60000)
      );

      const { data } = (await Promise.race([recognizePromise, timeoutPromise])) as any;
      await worker.terminate();

      return data.text.trim();
    } catch (error: any) {
      console.error('Erreur OCR:', error);
      if (worker) {
        try { await worker.terminate(); } catch { /* déjà terminé */ }
      }
      if (error?.message === 'TIMEOUT_OCR') {
        throw new Error('La reconnaissance de texte a pris trop de temps (connexion internet lente). Réessayez avec une meilleure connexion.');
      }
      throw new Error('Impossible de lire le texte de l\'image');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);
    setExtractedPreview('');

    // Vérifier la taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Le fichier est trop volumineux (max ${maxSizeMB}MB)`);
      return;
    }

    setUploading(true);

    try {
      let extractedText = '';

      // Déterminer le type de fichier
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        extractedText = await extractTextFromImage(file);
      } else {
        throw new Error('Type de fichier non supporté');
      }

      console.log(`[FileUpload] Texte extrait (${extractedText.length} caractères):`, extractedText.slice(0, 300));

      // Seuil relevé : un texte trop court est probablement du bruit (OCR raté, PDF vide, etc.)
      if (!extractedText || extractedText.trim().length < 40) {
        throw new Error(
          extractedText.trim().length > 0
            ? `Texte extrait trop court (${extractedText.trim().length} caractères) — probablement illisible. Essayez une photo plus nette ou un autre fichier.`
            : 'Aucun texte détecté dans le fichier.'
        );
      }

      // Détection de texte corrompu (données binaires mal interprétées,
      // souvent causé par une connexion internet trop lente pendant l'OCR)
      if (isTextGarbage(extractedText)) {
        throw new Error(
          'Le texte extrait semble corrompu (souvent dû à une connexion internet lente pendant le traitement). Réessayez avec une meilleure connexion, ou collez le texte manuellement.'
        );
      }

      setExtractedPreview(extractedText.slice(0, 200));
      onTextExtracted(extractedText);
      setUploading(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement du fichier');
      setUploading(false);
    }
  };

  return (
    <div style={{
      marginBottom: 20,
      padding: 20,
      background: '#1a1a2e',
      border: '2px dashed #333',
      borderRadius: 12,
      textAlign: 'center'
    }}>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ display: 'none' }}
        id="file-upload"
      />
      
      <label
        htmlFor="file-upload"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 28px',
          background: uploading ? '#444' : 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {uploading ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            Traitement...
          </>
        ) : (
          <>
            📎 Importer PDF ou Photo
          </>
        )}
      </label>

      {fileName && !error && (
        <div style={{
          marginTop: 12,
          fontSize: 13,
          color: '#6C5CE7',
          fontWeight: 600
        }}>
          ✅ {fileName}
        </div>
      )}

      {extractedPreview && !error && (
        <div style={{
          marginTop: 10,
          padding: 12,
          background: '#0e0e1d',
          border: '1px solid #333',
          borderRadius: 8,
          textAlign: 'left',
          fontSize: 12,
          color: '#aaa',
          maxHeight: 100,
          overflow: 'auto'
        }}>
          <strong style={{ color: '#00b894' }}>Aperçu du texte capturé :</strong>
          <br />
          {extractedPreview}...
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid #ff6b6b',
          borderRadius: 8,
          color: '#ff6b6b',
          fontSize: 13
        }}>
          ❌ {error}
        </div>
      )}

      <p style={{
        marginTop: 12,
        fontSize: 12,
        color: '#888'
      }}>
        PDF, JPG, PNG acceptés • Max {maxSizeMB}MB
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
