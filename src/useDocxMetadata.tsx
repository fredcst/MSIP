import { useCallback } from "react";
import JSZip from "jszip";

export interface CustomMetadata {
  [key: string]: string;
}

/**
 * Hook para leer metadata custom de DOCX
 * 
 * @param onChange Callback que recibe la metadata (o null si falla)
 */
export const useDocxMetadata = (onChange: (metadata: CustomMetadata | null) => void) => {
  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    // Validar extensión
    if (!file.name.toLowerCase().endsWith(".docx")) {
      console.warn("El archivo no es un DOCX válido:", file.name);
      onChange(null);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Leer docProps/custom.xml
      const customXmlFile = zip.file("docProps/custom.xml");
      if (!customXmlFile) {
        console.warn("No se encontró metadata custom en:", file.name);
        onChange(null);
        return;
      }

      const customXmlStr = await customXmlFile.async("string");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(customXmlStr, "application/xml");

      const properties = xmlDoc.getElementsByTagName("property");
      const metadata: CustomMetadata = {};

      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const name = prop.getAttribute("name");
        if (!name) continue;

        const valueNode = prop.firstElementChild;
        if (valueNode?.textContent) {
          metadata[name] = valueNode.textContent;
        }
      }

      onChange(Object.keys(metadata).length > 0 ? metadata : null);
    } catch (err) {
      console.error("Error leyendo DOCX:", file.name, err);
      onChange(null);
    }
  }, [onChange]);

  return handleFile;
};