import { useExportJsonOnSelectionChange } from "../hooks/useExportJsonOnSelectionChange";

export function AutoExportSelectedJson({ selectionState }) {
  useExportJsonOnSelectionChange(selectionState);
  return null;
}
