import React, { useState } from "react";
import { usePdfMetadata } from "./usePdfMetadata";
import { useDocxMetadata, type CustomMetadata } from "./useDocxMetadata";

interface Attachment {
  file: File;
  metadata: Record<string, string>;
}

const forbiddenKeys = ["MIP_sdfsdf", "MIP_asdsd"];

const FileUploader: React.FC = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // PDF hook
  const { readPdfMetadata } = usePdfMetadata();

  // DOCX hook
  const handleDocx = useDocxMetadata((metadata: CustomMetadata | null) => {
    if (!metadata || !currentFile) return;

    const forbidden = Object.keys(metadata).some((key) =>
      forbiddenKeys.some((fk) => key.includes(fk))
    );

    if (forbidden) {
      alert(`El archivo "${currentFile.name}" contiene keys prohibidas y no se puede añadir.`);
      return;
    }

    // Añadir attachment
    const typedMetadata: Record<string, string> = {};
    Object.entries(metadata).forEach(([k, v]) => {
      if (v !== undefined) typedMetadata[k] = v;
    });

    setAttachments((prev: Attachment[]) => [
      ...prev,
      { file: currentFile, metadata: typedMetadata },
    ]);

    console.log("Metadata DOCX:", typedMetadata);
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file);

      if (file.name.toLowerCase().endsWith(".docx")) {
        handleDocx(file);
      } else if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
          const metadataJson: Record<string, string> | null = await readPdfMetadata(file);
          if (!metadataJson) continue;

          const forbidden = Object.keys(metadataJson).some((key) =>
            forbiddenKeys.some((fk) => key.includes(fk))
          );

          if (forbidden) {
            alert(`El archivo "${file.name}" contiene keys prohibidas y no se puede añadir.`);
            continue;
          }

          setAttachments((prev: Attachment[]) => [
            ...prev,
            { file, metadata: metadataJson },
          ]);

          console.log("Metadata PDF:", metadataJson);
        } catch (err) {
          console.error("Error leyendo PDF:", file.name, err);
        }
      } else {
        alert(`Archivo "${file.name}" no soportado`);
      }
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx"
        multiple
        onChange={handleChange}
      />
      <h3>Archivos cargados:</h3>
      <pre>{JSON.stringify(attachments, null, 2)}</pre>
    </div>
  );
};

export default FileUploader;