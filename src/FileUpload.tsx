import { useState } from 'react';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ 
  onTextExtracted, 
  acceptedTypes = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 10 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

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
    try {
      // Utiliser Tesseract.js pour OCR
      const Tesseract = (window as any).Tesseract;
      
      if (!Tesseract) {
        throw new Error('Tesseract.js non chargé');
      }

      const result = await Tesseract.recognize(file, 'fra', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      return result.data.text.trim();
    } catch (error) {
      console.error('Erreur OCR:', error);
      throw new Error('Impossible de lire le texte de l\'image');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

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

      if (!extractedText || extractedText.length < 10) {
        throw new Error('Aucun texte détecté dans le fichier');
      }

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
