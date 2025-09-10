import { useState } from "react";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

export interface PdfMetadata {
  [key: string]: string;
}

export const usePdfMetadata = () => {
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const readPdfMetadata = async (file: File): Promise<PdfMetadata | null> => {
  setLoading(true);
  setError(null);
  setMetadata(null);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const xmpJson: PdfMetadata = {};
    const metadataRef = pdfDoc.catalog.get(PDFName.of("Metadata"));
    if (metadataRef) {
      const metadataStream = pdfDoc.context.lookup(metadataRef) as PDFRawStream;
      const metadataBytes = metadataStream?.getContents();
      if (metadataBytes) {
        const xmpString = new TextDecoder().decode(metadataBytes);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmpString, "application/xml");
        const allElements = xmlDoc.getElementsByTagName("*");
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i];
          const tagName = el.tagName;
          const textContent = el.textContent?.trim() || "";
          if (tagName.startsWith("MSIP_")) {
            xmpJson[tagName] = textContent;
          }
        }
      }
    }

    setMetadata(xmpJson);
    return xmpJson; // ✅ devolver JSON
  } catch (err) {
    console.error("Error reading PDF metadata:", err);
    setError("Error reading PDF metadata");
    return null;
  } finally {
    setLoading(false);
  }
};

  return { metadata, error, loading, readPdfMetadata };
};