export function StoreyFilter({
  filters,
  filterOptions,
  onToggleFilter,
  onResetFilters,
}) {
  return (
    <div className="filter-stack">
      <FilterGroup
        title="Storeys"
        emptyText="Storeys appear after loading a model"
        options={filterOptions.storeyNames}
        selected={filters.storeys}
        onToggle={(value) => onToggleFilter("storeys", value)}
      />
      <FilterGroup
        title="Element types"
        emptyText="Types appear after loading a model"
        options={filterOptions.typeNames}
        selected={filters.types}
        onToggle={(value) => onToggleFilter("types", value)}
      />
      <button
        className="secondary-button"
        type="button"
        onClick={onResetFilters}
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
