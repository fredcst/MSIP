import React from "react";
import { usePdfMetadata } from "./usePdfMetadata";

const PdfMetadataViewer: React.FC = () => {
  const { metadata, error, loading, readPdfMetadata } = usePdfMetadata();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readPdfMetadata(file);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Metadata Reader</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {loading && <p>Loading metadata...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {metadata && (
        <div style={{ marginTop: "20px" }}>
          <h3>Metadata:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PdfMetadataViewer;