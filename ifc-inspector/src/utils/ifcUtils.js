export function readIfcValue(value) {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  if ("value" in value) return readIfcValue(value.value);
  if ("Name" in value) return readIfcValue(value.Name);
  if ("ElementType" in value) return readIfcValue(value.ElementType);
  if ("PredefinedType" in value) return readIfcValue(value.PredefinedType);
  if ("type" in value && Object.keys(value).length === 1)
    return String(value.type);
  return "";
}

export function toDisplayText(value, fallback = "Not available") {
  const readableValue = readIfcValue(value);
  if (readableValue) return readableValue;

  if (Array.isArray(value))
    return `${value.length} item${value.length === 1 ? "" : "s"}`;

  if (value && typeof value === "object") {
    if (Number.isInteger(value.expressID) && value.type) {
      return `${toDisplayText(value.type, "IFC object")} #${value.expressID}`;
    }

    return fallback;
  }

  return fallback;
}

export function getElementSummary(properties) {
  if (!properties) {
    return {
      type: "No element selected",
      name: "Select an IFC element in the viewer",
      guid: "",
      material: "",
    };
  }

  return {
    type: getElementTypeLabel(properties),
    name:
      readIfcValue(properties.Name) ||
      readIfcValue(properties.LongName) ||
      "Unnamed element",
    guid: readIfcValue(properties.GlobalId),
    material: getMaterialLabel(properties),
  };
}

export function flattenIfcProperties(value, prefix = "Element", rows = []) {
  if (value == null) return rows;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenIfcProperties(item, `${prefix}.${index + 1}`, rows);
    });
    return rows;
  }

  if (typeof value !== "object") {
    rows.push({ key: prefix, value: String(value) });
    return rows;
  }

  if ("value" in value && Object.keys(value).length <= 3) {
    const unwrappedValue = toDisplayText(value, "");
    if (unwrappedValue) rows.push({ key: prefix, value: unwrappedValue });
    return rows;
  }

  Object.entries(value).forEach(([key, childValue]) => {
    if (key === "expressID" || key === "type") return;
    flattenIfcProperties(childValue, `${prefix}.${key}`, rows);
  });

  return rows;
}

export function buildSpatialIndex(spatialNode, rows = [], parentPath = []) {
  if (!spatialNode) return rows;

  const label =
    readIfcValue(spatialNode.Name) || spatialNode.type || "IFC Node";
  const nextPath = [...parentPath, label];

  if (Number.isInteger(spatialNode.expressID)) {
    rows.push({
      expressID: spatialNode.expressID,
      type: spatialNode.type || "IFC Element",
      name: label,
      path: nextPath.join(" / "),
      searchText:
        `${spatialNode.type || ""} ${label} ${nextPath.join(" ")}`.toLowerCase(),
    });
  }

  spatialNode.children?.forEach((child) =>
    buildSpatialIndex(child, rows, nextPath),
  );
  return rows;
}

export function getFilterOptions(indexRows) {
  const typeNames = [
    ...new Set(indexRows.map((row) => row.type).filter(Boolean)),
  ].sort();
  const storeyNames = [
    ...new Set(
      indexRows
        .map((row) =>
          row.path
            .split(" / ")
            .find((part) => /level|storey|floor|roof/i.test(part)),
        )
        .filter(Boolean),
    ),
  ].sort();

  return { storeyNames, typeNames };
}

function getMaterialLabel(properties) {
  const materialRows = flattenIfcProperties(properties?.mats || [], "Material");
  const namedMaterial = materialRows.find(
    (row) => /name$/i.test(row.key) && row.value,
  );
  return namedMaterial?.value || "";
}

function getElementTypeLabel(properties) {
  if (!properties) return "No element selected";

  if (typeof properties.type === "string") return properties.type;
  if (typeof properties.type === "number") return `IFC type ${properties.type}`;

  const typeProperties = Array.isArray(properties.type)
    ? properties.type[0]
    : properties.type;

  return (
    readIfcValue(typeProperties?.ElementType) ||
    readIfcValue(typeProperties?.Name) ||
    readIfcValue(typeProperties?.PredefinedType) ||
    readIfcValue(properties.ObjectType) ||
    "IFC Element"
  );
}
