import { useEffect, useRef } from "react";
import { Color } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";

export function Viewer({
  file,
  loadState,
  selectedElement,
  searchResultCount,
  onViewerReady,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return undefined;
    const viewerContainer = containerRef.current;

    const viewer = new IfcViewerAPI({
      container: viewerContainer,
      backgroundColor: new Color(0xf8fafc),
    });

    viewer.IFC.setWasmPath("/");
    viewer.grid.setGrid(40, 40);
    viewer.axes.setAxes(2);
    viewerRef.current = viewer;
    onViewerReady(viewer, viewerContainer);

    return () => {
      viewerRef.current = null;
      viewer.IFC.dispose?.();
      viewerContainer.replaceChildren();
      onViewerReady(null, null);
    };
  }, [onViewerReady]);

  return (
    <section className="viewer-shell">
      <div ref={containerRef} className="viewer-canvas" />
      {!file && (
        <div className="viewer-overlay">
          <p className="eyebrow">3D canvas</p>
          <strong>Load an IFC model to inspect elements</strong>
        </div>
      )}
      {loadState.status === "loading" && (
        <div className="load-panel">
          <span>Loading model</span>
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${loadState.progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="viewer-status">
        <span>
          {selectedElement
            ? `Express ID ${selectedElement.expressID}`
            : "No selection"}
        </span>
        <span>{searchResultCount} search hits</span>
      </div>
    </section>
  );
}
