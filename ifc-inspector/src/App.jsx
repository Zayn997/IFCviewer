import { useCallback, useMemo, useState } from "react";
import { PropertyPanel } from "./components/PropertyPanel";
import { SearchBar } from "./components/SearchBar";
import { StoreyFilter } from "./components/StoreyFilter";
import { UploadZone } from "./components/UploadZone";
import { Viewer } from "./components/Viewer";
import { useElementPicker } from "./hooks/useElementPicker";
import { useIFCLoader } from "./hooks/useIFCLoader";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewerApi, setViewerApi] = useState(null);
  const [viewerElement, setViewerElement] = useState(null);
  const [model, setModel] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementIndex, setElementIndex] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    storeyNames: [],
    typeNames: [],
  });
  const [filters, setFilters] = useState({ storeys: [], types: [] });
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewerReady = useCallback((nextViewerApi, nextViewerElement) => {
    setViewerApi(nextViewerApi);
    setViewerElement(nextViewerElement);
  }, []);

  const handleModelLoaded = useCallback(
    ({
      model: loadedModel,
      elementIndex: nextIndex,
      filterOptions: nextFilterOptions,
    }) => {
      setModel(loadedModel);
      setElementIndex(nextIndex);
      setFilterOptions(nextFilterOptions);
      setSelectedElement(null);
      setFilters({ storeys: [], types: [] });
    },
    [],
  );

  const loadState = useIFCLoader({
    file: selectedFile,
    viewerApi,
    onModelLoaded: handleModelLoaded,
  });

  const { pickError } = useElementPicker({
    viewerApi,
    viewerElement,
    model,
    onElementSelected: setSelectedElement,
  });

  const searchResults = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    if (!normalizedSearchTerm) return [];
    return elementIndex.filter((row) =>
      row.searchText.includes(normalizedSearchTerm),
    );
  }, [elementIndex, searchTerm]);

  function toggleFilter(groupName, value) {
    setFilters((currentFilters) => {
      const selectedValues = currentFilters[groupName];
      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value];

      return { ...currentFilters, [groupName]: nextValues };
    });
  }

  return (
    <main className="app-shell">
      <aside className="left-panel">
        <div className="brand-block">
          <p className="eyebrow">React state example</p>
          <h1>IFC Element Inspector</h1>
        </div>
        <UploadZone file={selectedFile} onFileSelected={setSelectedFile} />
        <SearchBar
          searchTerm={searchTerm}
          matchCount={searchResults.length}
          onSearchTermChange={setSearchTerm}
        />
        <StoreyFilter
          filters={filters}
          filterOptions={filterOptions}
          onToggleFilter={toggleFilter}
          onResetFilters={() => setFilters({ storeys: [], types: [] })}
        />
      </aside>

      <Viewer
        file={selectedFile}
        loadState={loadState}
        selectedElement={selectedElement}
        searchResultCount={searchResults.length}
        onViewerReady={handleViewerReady}
      />

      <PropertyPanel
        selectedElement={selectedElement}
        pickError={pickError}
        loadError={loadState.error}
      />
    </main>
  );
}

export default App;
