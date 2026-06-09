# React Learning Map

This app keeps the main state in `App.jsx` so new React users can trace data flow without jumping through a state library.

## State Examples

- `selectedFile`: set by `UploadZone`, consumed by `useIFCLoader` and `Viewer`.
- `viewerApi` and `viewerElement`: set once by `Viewer`, consumed by the loading and picking hooks.
- `model`: set after a successful IFC load, used to enable element picking.
- `selectedElement`: set by `useElementPicker`, rendered by `PropertyPanel`.
- `searchTerm`: set by `SearchBar`, filtered with `useMemo` in `App.jsx`.
- `filters`: updated with the functional `setFilters(current => next)` form so checkbox toggles never read stale state.

## Hook Examples

- `useRef` in `Viewer.jsx` stores the DOM container and the long-lived IFC viewer instance.
- `useRef` in `UploadZone.jsx` clicks the hidden file input from a normal button.
- `useEffect` in `Viewer.jsx` creates and disposes the IFC viewer.
- `useEffect` in `useIFCLoader.js` reacts when `selectedFile` and `viewerApi` are both ready.
- `useEffect` in `useElementPicker.js` attaches a click listener and removes it during cleanup.
- `useCallback` in `App.jsx` keeps callbacks stable for effects that depend on them.
- `useMemo` in `App.jsx` recalculates search results only when the search text or index changes.

## Viewer Note

The app creates one `IfcViewerAPI` instance in `Viewer.jsx` and shares that same instance with the loader and picker hooks through `App.jsx` state. React Strict Mode is intentionally not used in `main.jsx` for this example because it mounts effects twice in development, which can confuse imperative libraries that create their own canvas.
