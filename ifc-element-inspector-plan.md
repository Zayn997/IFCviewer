# IFC Element Inspector — Build Plan

## Overview

A lightweight, browser-based web app that lets users upload an IFC file, navigate a 3D model, click elements to inspect their properties, filter by storey or type, and export data — without needing heavy desktop software.

---

## Stack

| Layer | Technology |
|---|---|
| 3D Rendering & IFC parsing | `web-ifc-viewer` (Three.js + web-ifc) |
| UI Framework | React + Vite |
| Styling | Tailwind CSS |
| Export | Native browser download (JSON / CSV) |

---

## Layout

```
+------------------+-----------------------------+-------------------+
|   Left Sidebar   |       3D Canvas             |   Right Panel     |
|                  |                             |                   |
|  [ Search Bar ]  |   (IFC model rendered here) |  Element Type     |
|                  |                             |  Name             |
|  Storey Filters  |   Drag & drop overlay       |  GUID             |
|  [ ] Level 1     |   when no file loaded       |  Material         |
|  [ ] Level 2     |                             |  Dimensions       |
|  [ ] Roof        |                             |                   |
|                  |                             |  --- Psets ---    |
|  Type Filters    |                             |  Pset_WallCommon  |
|  [ ] IfcWall     |                             |  FireRating: ...  |
|  [ ] IfcDoor     |                             |  LoadBearing: ... |
|  [ ] IfcBeam     |                             |                   |
|  [ ] IfcColumn   |                             |  [ Export JSON ]  |
|  [ ] IfcSlab     |                             |  [ Export CSV  ]  |
+------------------+-----------------------------+-------------------+
```

---

## Phase 1 — Project Scaffold

**Goal:** Get a running Vite + React app with the right dependencies.

```bash
npm create vite@latest ifc-inspector -- --template react
cd ifc-inspector
npm install web-ifc-viewer three tailwindcss @tailwindcss/vite
```

- Set up Tailwind in `vite.config.js`
- Create the three-column layout shell in `App.jsx`
- Add placeholder components for each panel

---

## Phase 2 — 3D IFC Viewer

**Goal:** Load and render an IFC file in the browser.

### Tasks
- Create `UploadZone.jsx` — drag-and-drop or click-to-browse for `.ifc` files
- Create `Viewer.jsx` — initialize `web-ifc-viewer` on a `<canvas>` element
- Load the IFC file using `viewer.IFC.loadIfc(file)`
- Show a progress bar during loading (IFC files can be large)
- Enable default orbit controls (rotate, pan, zoom)

### Notes
- Use `web-ifc-viewer` v1.x — API differs significantly from v2
- Set `wasmPath` to point to the web-ifc WASM binary in `/public/`
- Copy `web-ifc.wasm` and `web-ifc-mt.wasm` to `/public/` after install

---

## Phase 3 — Click-to-Inspect

**Goal:** Click any element in the 3D view and display its properties.

### Tasks
- Enable raycasting via `viewer.IFC.selector.pickIfcItem()`
- On click: highlight the selected element with a distinct color (e.g. orange)
- Retrieve the element's Express ID from the pick result
- Fetch properties using `viewer.IFC.getProperties(modelID, expressID, true, true)`
- Parse and flatten nested Psets
- Display in `PropertyPanel.jsx`:
  - Element type (e.g. `IfcWall`)
  - Name, GUID
  - Material
  - Dimensions (if available)
  - All Pset key-value pairs

### Notes
- Psets are returned as nested objects — flatten them before rendering
- Use `viewer.IFC.selector.unpickIfcItems()` to deselect on empty click

---

## Phase 4 — Storey & Type Filter

**Goal:** Toggle element visibility by building level or IFC type.

### Tasks
- On model load, parse all `IfcBuildingStorey` entries
- Parse all unique IFC types present in the model
- Render toggle lists in `StoreyFilter.jsx`
- Use the `subset` API to show/hide elements:
  ```js
  viewer.IFC.selector.createSubset({ modelID, ids, removePrevious: true })
  viewer.IFC.selector.removeSubset(modelID, undefined, customID)
  ```
- Isolate: hide all other elements when one storey/type is selected
- Reset: restore full model visibility

### Notes
- Use subsets instead of toggling mesh visibility directly
- Allow multi-select for storeys (e.g. show Level 1 + Level 2 together)

---

## Phase 5 — Property Search

**Goal:** Search across all elements by property value.

### Tasks
- On model load, index all elements and their key Pset values into memory
- Add `SearchBar.jsx` at the top of the left sidebar
- On input: filter the index and return matching Express IDs
- Highlight matching elements in the 3D view using a colored subset
- Show match count in the sidebar (e.g. "12 elements found")

### Example use cases
- Find all walls with `FireRating = REI 120`
- Find all doors with `Width > 900`
- Find all elements named containing "Facade"

---

## Phase 6 — Export

**Goal:** Download element properties as JSON or CSV.

### Tasks
- Add export buttons to `PropertyPanel.jsx`
- **Export JSON**: serialize the current element's full Pset tree → download as `.json`
- **Export CSV**: flatten all Pset key-value pairs into rows → download as `.csv`
- Optional: "Export All Visible" button in the sidebar — bulk export all currently visible elements' properties

```js
// Example CSV download helper
function downloadCSV(data, filename) {
  const csv = data.map(row => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
```

---

## File Structure

```
ifc-inspector/
├── public/
│   ├── web-ifc.wasm              ← Required WASM binary
│   └── web-ifc-mt.wasm           ← Required WASM binary (multi-thread)
├── src/
│   ├── components/
│   │   ├── Viewer.jsx            ← Three.js canvas + web-ifc-viewer init
│   │   ├── PropertyPanel.jsx     ← Right panel: element attributes & export
│   │   ├── StoreyFilter.jsx      ← Left sidebar: storey & type toggles
│   │   ├── SearchBar.jsx         ← Property search input
│   │   └── UploadZone.jsx        ← Drag & drop IFC file input
│   ├── hooks/
│   │   ├── useIFCLoader.js       ← Load & parse IFC file logic
│   │   └── useElementPicker.js   ← Raycasting + property fetch logic
│   ├── utils/
│   │   └── exportUtils.js        ← JSON / CSV export helpers
│   ├── App.jsx                   ← Layout + global state
│   └── main.jsx                  ← Vite entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Sample IFC Files for Testing

| File | Source |
|---|---|
| Duplex Apartment | [buildingSMART](https://github.com/buildingSMART/Sample-Test-Files) |
| RAC Advanced Sample | Autodesk Revit sample files |
| IFC Wall with Psets | [IFC.js test models](https://github.com/IFCjs/test-ifc-files) |

---

## Agent Instructions Summary

1. Follow phases in order — each phase builds on the previous
2. Use `web-ifc-viewer` **v1.x** (not v2)
3. Copy WASM binaries to `/public/` after `npm install`
4. Flatten nested Pset objects before rendering in the UI
5. Use the `subset` API for all visibility toggling
6. Test with the Duplex IFC file from buildingSMART after each phase
7. Keep state in `App.jsx` and pass down via props (no need for Redux at this scale)
