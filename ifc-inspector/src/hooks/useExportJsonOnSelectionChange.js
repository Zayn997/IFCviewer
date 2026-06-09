import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

export function useExportJsonOnSelectionChange(selectionState) {
  const selectedElement = useRecoilValue(selectionState);
  const lastExportedSelectionRef = useRef(null);

  useEffect(() => {
    if (!selectedElement) return;
    // console.log("useEffect triggered");

    const selectionKey = `${selectedElement.modelID}:${selectedElement.expressID}`;
    if (selectionKey === lastExportedSelectionRef.current) return;

    lastExportedSelectionRef.current = selectionKey;
    // exportElementAsJSON(selectedElement);
  }, [selectedElement]);
}
