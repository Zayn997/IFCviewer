import { useCallback, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AutoExportSelectedJson } from "./components/AutoExportSelectedJson";
import { PropertyPanel } from "./components/PropertyPanel";
import { SearchBar } from "./components/SearchBar";
import { StoreyFilter } from "./components/StoreyFilter";
import { UploadZone } from "./components/UploadZone";
import { Viewer } from "./components/Viewer";
import { useElementPicker } from "./hooks/useElementPicker";
import { useIFCLoader } from "./hooks/useIFCLoader";
import {
  elementIndexState,
  filterOptionsState,
  filtersState,
  searchResultsSelector,
  searchTermState,
  selectedElementState,
  selectedFileState,
} from "./state/ifcState";

function App() {
  const [viewerApi, setViewerApi] = useState(null);
  const [viewerElement, setViewerElement] = useState(null);
  const [model, setModel] = useState(null);
  const selectedFile = useRecoilValue(selectedFileState);
  const selectedElement = useRecoilValue(selectedElementState);
  const searchResults = useRecoilValue(searchResultsSelector);
  const setSelectedElement = useSetRecoilState(selectedElementState);
  const setElementIndex = useSetRecoilState(elementIndexState);
  const setFilterOptions = useSetRecoilState(filterOptionsState);
  const setFilters = useSetRecoilState(filtersState);
  const setSearchTerm = useSetRecoilState(searchTermState);

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
      setSearchTerm("");
    },
    [
      setElementIndex,
      setFilterOptions,
      setFilters,
      setSearchTerm,
      setSelectedElement,
    ],
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

  return (
    <main className="app-shell">
      <aside className="left-panel">
        <div className="brand-block">
          {/* <p className="eyebrow">React state example</p> */}
          <h1>IFC Element Inspector</h1>
        </div>
        <UploadZone />
        <SearchBar />
        <StoreyFilter />
      </aside>

      <AutoExportSelectedJson selectionState={selectedElementState} />

      <Viewer
        file={selectedFile}
        loadState={loadState}
        selectedElement={selectedElement}
        searchResultCount={searchResults.length}
        onViewerReady={handleViewerReady}
      />

      <PropertyPanel pickError={pickError} loadError={loadState.error} />
    </main>
  );
}

export default App;
