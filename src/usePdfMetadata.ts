import { useState } from "react";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

export interface PdfMetadata {
  [key: string]: string;
}

export const usePdfMetadata = () => {
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const readPdfMetadata = async (file: File) => {
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const info: PdfMetadata = {
        title: pdfDoc.getTitle() || "N/A",
        author: pdfDoc.getAuthor() || "N/A",
        subject: pdfDoc.getSubject() || "N/A",
        keywords: pdfDoc.getKeywords() || "N/A",
        creator: pdfDoc.getCreator() || "N/A",
        producer: pdfDoc.getProducer() || "N/A",
        creationDate: pdfDoc.getCreationDate()?.toISOString() || "N/A",
        modificationDate: pdfDoc.getModificationDate()?.toISOString() || "N/A",
      };

      // Leer Metadata XMP
      const metadataRef = pdfDoc.catalog.get(PDFName.of("Metadata"));
      if (metadataRef) {
        const metadataStream = pdfDoc.context.lookup(metadataRef) as PDFRawStream;
        const metadataBytes = metadataStream?.getContents();
        if (metadataBytes) {
          const xmpString = new TextDecoder().decode(metadataBytes);
          info["XMP_RAW"] = xmpString; // XML completo, incluye MSIP_Target y otros campos
        }
      }

      setMetadata(info);
    } catch (err) {
      console.error("Error reading PDF metadata:", err);
      setError("Error reading PDF metadata");
    } finally {
      setLoading(false);
    }
  };

  return { metadata, error, loading, readPdfMetadata };
};