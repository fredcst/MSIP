import { useCallback } from "react";
import JSZip from "jszip";

export interface CustomMetadata {
  [key: string]: string | undefined;
}

/**
 * Hook: useDocxCustomMetadata
 * 
 * @param onChange Callback triggered when metadata is read
 */
export const useDocxCustomMetadata = (
  onChange: (metadata: CustomMetadata | null) => void
) => {
  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const parser = new DOMParser();
      const customMetadata: CustomMetadata = {};

      const customXmlStr = await zip.file("docProps/custom.xml")?.async("string");
      if (customXmlStr) {
        const customXml = parser.parseFromString(customXmlStr, "application/xml");
        const properties = customXml.getElementsByTagName("property");
        for (let i = 0; i < properties.length; i++) {
          const prop = properties[i];
          const name = prop.getAttribute("name");
          const valueNode = prop.firstElementChild;
          if (name && valueNode) {
            customMetadata[name] = valueNode.textContent || undefined;
          }
        }
      }

      onChange(customMetadata);
    } catch (err) {
      console.error("Error reading DOCX custom metadata:", err);
      onChange(null);
    }
  }, [onChange]);

  return handleFile;
};