import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthToken } from '../AuthTokenContext';

export default function Favorites() {
    const location = useLocation();
    const navigate = useNavigate();
    const { accessToken } = useAuthToken();
    const { user } = useAuth0();
    const username = user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`];
    const { favorites, isEditing } = location.state || {};
    const [favoriteMovies, setFavoriteMovies] = useState(favorites);

    const checkRedirect = (movieId, movie) => {
        navigate(`/app/favorites/${movieId}`, { state: { movieDetails: movie }} );
    };

    const removeFavorite = async (movieId) => {
        setFavoriteMovies(favoriteMovies.filter((movie) => movie.id != movieId));
        fetch(`${process.env.REACT_APP_API_URL}/favorites/${username}/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    useEffect(() => {
        
    }, favoriteMovies);

    return (
        <div className="results-container">
            <h2>Your Favorite Movies</h2>
            <ul className="results-list">
                {favoriteMovies && favoriteMovies.length > 0 ? (
                    favoriteMovies.map((movie) => (
                        <li key={movie.id} className="result-item">
                            <img
                                className="movie-poster"
                                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                alt={`${movie.title} Poster`}
                            />
                            <div className="movie-info">
                                <h3 className="movie-title">
                                    {movie.title} ({movie.release_date.split('-')[0]})
                                </h3>
                                <h4 className="movie-director">
                                    Directed by: {movie.credits.crew.find(member => member.job === 'Director')?.name || 'N/A'}
                                </h4>
                                <p className="movie-overview">{movie.overview}</p>
                                { !isEditing ? <button className="movie-info-button" onClick={() => checkRedirect(movie.id, movie)}> More Info </button> 
                                : <button className="favorite-remove-button" onClick={() => removeFavorite(movie.id)}> Remove </button> }
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No favorites found.</p>
                )}
            </ul>
        </div>
    );
}