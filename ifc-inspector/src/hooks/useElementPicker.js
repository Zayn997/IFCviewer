import { useEffect, useRef, useState } from "react";
import { flattenIfcProperties } from "../utils/ifcUtils";

const CLICK_DRAG_THRESHOLD_PX = 5;

export function useElementPicker({
  viewerApi,
  viewerElement,
  model,
  onElementSelected,
}) {
  const [pickError, setPickError] = useState("");
  const pointerStartRef = useRef(null);

  useEffect(() => {
    if (!viewerApi || !viewerElement || !model) return undefined;

    function handlePointerDown(event) {
      if (event.button !== 0) return;

      pointerStartRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    }

    function handlePointerCancel() {
      pointerStartRef.current = null;
    }

    async function handlePointerUp(event) {
      const pointerStart = pointerStartRef.current;
      pointerStartRef.current = null;

      if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;

      const dragDistance = Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      );

      if (dragDistance > CLICK_DRAG_THRESHOLD_PX) return;

      try {
        setPickError("");
        updateViewerMousePosition(viewerApi, event);
        const pickedItem = await viewerApi.IFC.selector.pickIfcItem(true);

        if (!pickedItem) {
          viewerApi.IFC.selector.unpickIfcItems();
          onElementSelected(null);
          return;
        }

        const properties = await viewerApi.IFC.getProperties(
          pickedItem.modelID,
          pickedItem.id,
          true,
          true,
        );

        onElementSelected({
          modelID: pickedItem.modelID,
          expressID: pickedItem.id,
          properties,
          flattenedProperties: flattenIfcProperties(properties),
        });
      } catch (error) {
        setPickError(error.message);
      }
    }

    viewerElement.addEventListener("pointerdown", handlePointerDown);
    viewerElement.addEventListener("pointerup", handlePointerUp);
    viewerElement.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      viewerElement.removeEventListener("pointerdown", handlePointerDown);
      viewerElement.removeEventListener("pointerup", handlePointerUp);
      viewerElement.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [viewerApi, viewerElement, model, onElementSelected]);

  return { pickError };
}

function updateViewerMousePosition(viewerApi, event) {
  const domElement = viewerApi.context?.renderer?.renderer?.domElement;
  const mouse = viewerApi.context?.mouse;

  if (!domElement || !mouse) return;

  const bounds = domElement.getBoundingClientRect();
  mouse.rawPosition.x = event.clientX;
  mouse.rawPosition.y = event.clientY;
  mouse.position.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  mouse.position.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
}
