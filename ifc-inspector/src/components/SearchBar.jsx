import { useRecoilState, useRecoilValue } from "recoil";
import { searchResultsSelector, searchTermState } from "../state/ifcState";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
  const searchResults = useRecoilValue(searchResultsSelector);

  return (
    <label className="search-bar">
      <span>Search properties</span>
      <input
        type="search"
        value={searchTerm}
        placeholder="Fire rating, facade, IfcWall"
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <small>
        {searchTerm
          ? `${searchResults.length} matches`
          : "Search the loaded model index"}
      </small>
    </label>
  );
}
