import { useRecoilValue } from "recoil";
import { exportElementAsCSV, exportElementAsJSON } from "../utils/exportUtils";
import { getElementSummary } from "../utils/ifcUtils";
import { selectedElementState } from "../state/ifcState";
import { PropertyList } from "./PropertyList";

export function PropertyPanel({ pickError, loadError }) {
  const selectedElement = useRecoilValue(selectedElementState);
  const summary = getElementSummary(selectedElement?.properties);
  const propertyRows = selectedElement?.flattenedProperties ?? [];

  return (
    <aside className="property-panel">
      <div className="property-panel__header">
        <div>
          <p className="eyebrow">Element inspector</p>
          <h2>{summary.type}</h2>
          <p className="muted">{summary.name}</p>
        </div>

        {(pickError || loadError) && (
          <p className="error-text">{pickError || loadError}</p>
        )}

        <dl className="summary-list">
          <div>
            <dt>GUID</dt>
            <dd>{summary.guid || "Not selected"}</dd>
          </div>
          <div>
            <dt>Material</dt>
            <dd>{summary.material || "Not available"}</dd>
          </div>
          <div>
            <dt>Express ID</dt>
            <dd>{selectedElement?.expressID ?? "Not selected"}</dd>
          </div>
        </dl>

        <div className="button-row">
          <button
            type="button"
            disabled={!selectedElement}
            onClick={() => exportElementAsJSON(selectedElement)}
          >
            Export JSON
          </button>
          <button
            type="button"
            disabled={!selectedElement}
            onClick={() => exportElementAsCSV(selectedElement)}
          >
            Export CSV
          </button>
        </div>
      </div>

      <PropertyList rows={propertyRows} />
    </aside>
  );
}
