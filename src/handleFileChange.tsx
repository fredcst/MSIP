import React, { useState } from "react";
import { usePdfMetadata } from "./usePdfMetadata";
import type { PdfMetadata } from "./usePdfMetadata";

interface Attachment {
  file: File;
  metadata: PdfMetadata;
}

const MultiPdfMetadataAttachments: React.FC = () => {
  const { readPdfMetadata } = usePdfMetadata();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`Processing file: ${file.name}`);

      // <-- Aquí usamos la versión del hook que devuelve el JSON
      const metadataJson = await readPdfMetadata(file);
      if (metadataJson) {
        const newAttachment: Attachment = { file, metadata: metadataJson };
        setAttachments(prev => [...prev, newAttachment]);
        console.log("Metadata JSON:", metadataJson);
      }

    } catch (err) {
      console.error(`Error processing ${file.name}:`, err);
    }
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Metadata Reader (Multiple PDFs with Attachments)</h2>
      <input type="file" accept="application/pdf" multiple onChange={handleFilesChange} />

      {attachments.length > 0 && (
        <div style={{ marginTop: "20px" }}>
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

export default MultiPdfMetadataAttachments;