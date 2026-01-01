import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ allCourses, setResults, containerRef }) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchData = () => {
      const results = allCourses.filter((course) => {
        return (
          input &&
          course &&
          course.title &&
          course.title.toLowerCase().includes(input)
        );
      });
      setResults(results);
    };

    fetchData();
  }, [input, allCourses, setResults]);

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current.contains(e.target)) {
        setInput("");
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [containerRef]);

  const handleChange = (value) => {
    setInput(value);
  };

  return (
    <div className="absolute left-[340px] bg-white w-[498px] h-10 rounded-r-lg shadow-lg px-0 flex items-center">
      <label htmlFor="search_input" className="sr-only">
        Search courses
      </label>
      <input
        id="search_input"
        aria-label="Search courses"
        className="bg-transparent h-full w-[440px] text-xl ml-1.5 outline-none"
        placeholder="Type to search..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
      <button
        type="button"
        aria-label="Submit search"
        className="absolute left-[450px] bg-blue-600 hover:bg-blue-700 border-none w-12 h-10 rounded-r-lg p-3"
      >
        <FaSearch color="white" size="20px" />
      </button>
    </div>
  );
};

export default SearchBar;
