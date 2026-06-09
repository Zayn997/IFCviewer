import { flattenIfcProperties, getElementSummary } from "./ifcUtils";

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

export function downloadCSV(rows, filename) {
  const header = ["key", "value"];
  const body = rows.map((row) =>
    [escapeCSV(row.key), escapeCSV(row.value)].join(","),
  );
  const blob = new Blob([[header.join(","), ...body].join("\n")], {
    type: "text/csv",
  });
  downloadBlob(blob, filename);
}

export function exportElementAsJSON(selectedElement) {
  if (!selectedElement?.properties) return;
  const summary = getElementSummary(selectedElement.properties);
  downloadJSON(
    selectedElement.properties,
    `${summary.name || "ifc-element"}.json`,
  );
}

export function exportElementAsCSV(selectedElement) {
  if (!selectedElement?.properties) return;
  const summary = getElementSummary(selectedElement.properties);
  const rows = flattenIfcProperties(selectedElement.properties);
  downloadCSV(rows, `${summary.name || "ifc-element"}.csv`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.replace(/[\\/:*?"<>|]/g, "-");
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
