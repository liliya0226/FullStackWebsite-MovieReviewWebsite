import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import Profile from "./components/Profile";
import AppLayout from "./components/AppLayout";
import SearchResults from "./components/SearchResults";
import MovieDetails from "./components/MovieDetails";
import Debug from "./components/Debug";
import UnauthedLayout from "./components/UnauthedLayout";
import Favorites from "./components/Favorites";
import MovieReviewForm from "./components/MovieReviewForm";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import { requestedScopes } from "./constants";
import './AuthTokenContext';
import './constants';

const container = document.getElementById("root");

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UnauthedLayout />}>
              <Route index element={<Home />} />
              <Route path="/search/:criteria" element={<SearchResults />} />
              <Route path="/search/:criteria/:id" element={<MovieDetails />} />
            </Route>
            <Route path="/verify-user" element={<VerifyUser />} />
            <Route
              path="app"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="debug" element={<Debug />} />
              <Route path="search/:criteria" element={<SearchResults />} />
              <Route path="search/:criteria/:id" element={<MovieDetails />} />
              <Route path="create/review/:id" element={<MovieReviewForm />} />
              <Route path="favorites/:id" element={<MovieDetails />} />
              <Route path=":user/favorites" element={<Favorites />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
