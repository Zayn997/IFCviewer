import { atom, selector } from "recoil";

export const selectedFileState = atom({
  key: "selectedFileState",
  default: null,
  dangerouslyAllowMutability: true,
});

export const selectedElementState = atom({
  key: "selectedElementState",
  default: null,
  dangerouslyAllowMutability: true,
});

export const elementIndexState = atom({
  key: "elementIndexState",
  default: [],
});

export const filterOptionsState = atom({
  key: "filterOptionsState",
  default: { storeyNames: [], typeNames: [] },
});

export const filtersState = atom({
  key: "filtersState",
  default: { storeys: [], types: [] },
});

export const searchTermState = atom({
  key: "searchTermState",
  default: "",
});

export const searchResultsSelector = selector({
  key: "searchResultsSelector",
  get: ({ get }) => {
    const elementIndex = get(elementIndexState);
    const searchTerm = get(searchTermState).trim().toLowerCase();

    if (!searchTerm) return [];

    return elementIndex.filter((row) => row.searchText.includes(searchTerm));
  },
});
