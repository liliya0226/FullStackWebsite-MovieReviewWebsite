import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../styles/header.css";

export default function AppLayout() {
  const { user, isLoading, logout, isAuthenticated } = useAuth0();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const handleSearch = async () => {
    if (searchValue.length === 0) {
      alert("Search paramters cannot be empty.");
      return;
    }
    let query = encodeURIComponent(searchValue);
    let apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&query=${query}&language=en-US&page=1`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results) {
        navigate(`/app/search/${query}`, {
          state: { results: data },
        });
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

  const handleHomeNavigation = () => {
    if (isAuthenticated) {
      navigate("/app");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="app">
      <div className="header">
        <div className="title">
          <h3 className="header-title" onClick={handleHomeNavigation}>
            MoiveIQ
          </h3>
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
        <div className="header-button-container">
          <button
            className="header-logout-button"
            onClick={() => navigate("/app/debug")}
          >
            Debug
          </button>
          <button
            className="header-logout-button"
            onClick={() => navigate("/app/profile")}
          >
            Profile
          </button>
          <button
            className="header-logout-button"
            onClick={() => handleLogout()}
          >
            {" "}
            Logout{" "}
          </button>
        </div>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
