import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../styles/header.css";

export default function UnauthedLayout() {
  const { user, isLoading, logout, isAuthenticated, loginWithRedirect } =
    useAuth0();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    let query = encodeURIComponent(searchValue);
    let apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&query=${query}&language=en-US&page=1`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results) {
        navigate(`/search/${query}`, { state: { results: data } });
      } else {
        console.error("Error in API call...");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="title">
          <h3 onClick={() => navigate("/")}>MovieIQ</h3>
        </div>
        <div className="search-container">
          <FaSearch />
          <div className="header-search">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        {isAuthenticated ? (
          <button
            className="header-logout-button"
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            {" "}
            Logout{" "}
          </button>
        ) : (
          <button className="header-logout-button" onClick={loginWithRedirect}>
            {" "}
            Login{" "}
          </button>
        )}
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
