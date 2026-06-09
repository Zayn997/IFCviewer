import { useRecoilState, useRecoilValue } from "recoil";
import { filterOptionsState, filtersState } from "../state/ifcState";

export function StoreyFilter() {
  const [filters, setFilters] = useRecoilState(filtersState);
  const filterOptions = useRecoilValue(filterOptionsState);

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
    <div className="filter-stack">
      <FilterGroup
        title="Storeys"
        emptyText="Storeys appear after loading a model"
        options={filterOptions.storeyNames}
        selected={filters.storeys}
        onToggle={(value) => toggleFilter("storeys", value)}
      />
      <FilterGroup
        title="Element types"
        emptyText="Types appear after loading a model"
        options={filterOptions.typeNames}
        selected={filters.types}
        onToggle={(value) => toggleFilter("types", value)}
      />
      <button
        className="secondary-button"
        type="button"
        onClick={() => setFilters({ storeys: [], types: [] })}
      >
        Reset filters
      </button>
    </div>
  );
}

function FilterGroup({ title, emptyText, options, selected, onToggle }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {options.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        options.slice(0, 12).map((option) => (
          <label key={option} className="check-row">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))
      )}
    </fieldset>
  );
}
