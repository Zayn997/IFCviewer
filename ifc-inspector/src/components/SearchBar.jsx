export function SearchBar({ searchTerm, matchCount, onSearchTermChange }) {
  return (
    <label className="search-bar">
      <span>Search properties</span>
      <input
        type="search"
        value={searchTerm}
        placeholder="Fire rating, facade, IfcWall"
        onChange={(event) => onSearchTermChange(event.target.value)}
      />
      <small>
        {searchTerm ? `${matchCount} matches` : "Search the loaded model index"}
      </small>
    </label>
  );
}
