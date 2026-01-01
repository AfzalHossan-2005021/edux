import React from "react";

const SearchResultsList = ({ results, setResults }) => {
  return (
    <div
      className="relative left-[308px] w-[480px] bg-white flex-col shadow-md max-h-80 overflow-auto"
      role="listbox"
      aria-label="Search results"
    >
      <ul>
        {results.map((result, id) => (
          <li key={id} role="option">
            <a
              href={`/courses/${result.c_id}`}
              className="block py-5 px-2 hover:bg-zinc-300 text-sky-600 w-full"
              onClick={() => setResults([])}
            >
              {result.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResultsList;
