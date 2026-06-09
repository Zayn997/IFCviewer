import { useMemo, useState } from "react";
import { toDisplayText } from "../utils/ifcUtils";

const IMPORTANT_KEYS = [
  "globalid",
  "name",
  "tag",
  "objecttype",
  "predefinedtype",
  "elementtype",
  "firerating",
  "loadbearing",
  "isexternal",
  "reference",
];

export function PropertyList({ rows }) {
  const [propertySearch, setPropertySearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const visibleRows = useMemo(() => {
    const normalizedSearch = propertySearch.trim().toLowerCase();
    const readableRows = rows.map((row) => ({
      ...row,
      label: formatPropertyLabel(row.key),
      group: getPropertyGroup(row.key),
      displayValue: toDisplayText(row.value),
    }));

    const filteredRows = normalizedSearch
      ? readableRows.filter((row) =>
          `${row.key} ${row.displayValue}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : readableRows;

    if (showAll || normalizedSearch) return filteredRows;

    const importantRows = filteredRows.filter((row) =>
      IMPORTANT_KEYS.some((key) => row.key.toLowerCase().includes(key)),
    );

    return importantRows.length > 0 ? importantRows : filteredRows.slice(0, 24);
  }, [propertySearch, rows, showAll]);

  const groupedRows = useMemo(() => groupRows(visibleRows), [visibleRows]);

  if (rows.length === 0) {
    return (
      <section className="property-browser property-browser--empty">
        <h3>Property sets</h3>
        <p className="muted">Select an element to see its IFC properties.</p>
      </section>
    );
  }

  return (
    <section className="property-browser">
      <div className="property-browser__topbar">
        <div>
          <h3>Property sets</h3>
          <p className="muted">
            {visibleRows.length} of {rows.length} properties
          </p>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Key fields" : "Show all"}
        </button>
      </div>

      <input
        className="property-search"
        type="search"
        value={propertySearch}
        placeholder="Filter properties"
        onChange={(event) => setPropertySearch(event.target.value)}
      />

      <div className="property-groups">
        {groupedRows.map((group, index) => (
          <details
            key={group.name}
            className="property-group"
            open={index < 2 || propertySearch !== ""}
          >
            <summary>
              <span>{formatPropertyLabel(group.name)}</span>
              <small>{group.rows.length}</small>
            </summary>
            <div className="property-table">
              {group.rows.map((row) => (
                <div
                  key={`${row.key}-${row.displayValue}`}
                  className="property-row"
                >
                  <span title={row.key}>{row.label}</span>
                  <strong title={row.displayValue}>{row.displayValue}</strong>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function groupRows(rows) {
  const groups = new Map();

  rows.forEach((row) => {
    const groupName = row.group;
    const groupRows = groups.get(groupName) ?? [];
    groupRows.push(row);
    groups.set(groupName, groupRows);
  });

  return [...groups.entries()].map(([name, groupRows]) => ({
    name,
    rows: groupRows,
  }));
}

function getPropertyGroup(key) {
  const parts = key.split(".").filter(Boolean);
  const usefulParts = parts[0] === "Element" ? parts.slice(1) : parts;
  return usefulParts[0] || "General";
}

function formatPropertyLabel(value) {
  const lastSegment = value.split(".").filter(Boolean).at(-1) || value;
  return lastSegment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}
