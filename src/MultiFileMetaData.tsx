import React, { useState } from "react";
import { usePdfMetadata, type PdfMetadata } from "./usePdfMetadata";
import { useDocxCustomMetadata, type CustomMetadata } from "./useDocxCustomMetadata";

interface Attachment {
  file: File;
  metadata: PdfMetadata | CustomMetadata;
}

const MultiFileMetadata: React.FC = () => {
  const { readPdfMetadata } = usePdfMetadata();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Hook llamado en el nivel superior del componente
  const handleDocx = useDocxCustomMetadata((metadata) => {
    if (!metadata || !currentFile) return;
    setAttachments(prev => [...prev, { file: currentFile, metadata }]);
    console.log("DOCX metadata:", metadata);
    setCurrentFile(null);
  });

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase();

      try {
        if (ext === "pdf") {
          const metadataJson = await readPdfMetadata(file);
          if (!metadataJson) continue;
          setAttachments(prev => [...prev, { file, metadata: metadataJson }]);
          console.log("PDF metadata:", metadataJson);

        } else if (ext === "docx") {
          // Guardamos el archivo temporal y llamamos al hook
          setCurrentFile(file);
          await handleDocx(file);

        } else {
          console.warn("Formato no soportado:", file.name);
        }
      } catch (err) {
        console.error(`Error procesando ${file.name}:`, err);
      }
    }
  };

  return (
    <div>
      <h2>Multi-file Metadata Reader (PDF + DOCX)</h2>
      <input type="file" accept=".pdf,.docx" multiple onChange={handleFilesChange} />

      {attachments.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Processed Attachments:</h3>
          <ul>
            {attachments.map((att, idx) => (
              <li key={idx}>
                <strong>{att.file.name}</strong>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(att.metadata, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiFileMetadata;