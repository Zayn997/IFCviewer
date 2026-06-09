import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
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

      <TableContainer className="property-table" component="div">
        <Table stickyHeader aria-label="Property sets" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Property set</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => (
              <TableRow key={`${row.key}-${row.displayValue}-${index}`}>
                <TableCell className="property-table__set" title={row.group}>
                  {formatPropertyLabel(row.group)}
                </TableCell>
                <TableCell className="property-table__label" title={row.key}>
                  {row.label}
                </TableCell>
                <TableCell
                  className="property-table__value"
                  title={row.displayValue}
                >
                  {row.displayValue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
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
