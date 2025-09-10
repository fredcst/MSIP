import { useMemo } from "react";
import type { PdfMetadata } from "./usePdfMetadata";

const FORBIDDEN_MIPS = ["mierda", "sexo"];

export const useFileContainsForbiddenMIP = (metadata: PdfMetadata | null) => {
  const containsForbiddenMIPS = useMemo(() => {
    if (!metadata) return false;

    for (const [key, value] of Object.entries(metadata)) {
      const keyLower = key.toLowerCase();
      const valueLower = (value || "").toLowerCase();

      if (FORBIDDEN_MIPS.some(word => keyLower.includes(word) || valueLower.includes(word))) {
        return true;
      }
    }

    return false;
  }, [metadata]);

  return containsForbiddenMIPS;
};