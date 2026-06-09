import { useEffect, useState } from "react";
import { buildSpatialIndex, getFilterOptions } from "../utils/ifcUtils";

export function useIFCLoader({ file, viewerApi, onModelLoaded }) {
  const [loadState, setLoadState] = useState({
    status: "idle",
    progress: 0,
    error: "",
  });

  useEffect(() => {
    if (!file || !viewerApi) return undefined;

    let cancelled = false;
    const fileUrl = URL.createObjectURL(file);

    async function loadModel() {
      setLoadState({ status: "loading", progress: 5, error: "" });

      try {
        const model = await viewerApi.IFC.loadIfcUrl(fileUrl, true, (event) => {
          if (!event?.total || cancelled) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setLoadState({ status: "loading", progress, error: "" });
        });

        if (!model || cancelled) return;

        const spatialStructure = viewerApi.IFC.getSpatialStructure(
          model.modelID,
          true,
        );
        const elementIndex = buildSpatialIndex(spatialStructure);
        const filterOptions = getFilterOptions(elementIndex);

        onModelLoaded({ model, spatialStructure, elementIndex, filterOptions });
        setLoadState({ status: "ready", progress: 100, error: "" });
      } catch (error) {
        if (!cancelled) {
          setLoadState({ status: "error", progress: 0, error: error.message });
        }
      } finally {
        URL.revokeObjectURL(fileUrl);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(fileUrl);
    };
  }, [file, viewerApi, onModelLoaded]);

  return loadState;
}
