import React from "react";
import "./MovieCard.css";
import Star from "../../assets/star.png";

const MovieCard = ({ movie, onClick }) => {
  return (
    <div
      className="movie_card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && onClick?.()}
    >
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image"
        }
        alt={`${movie.original_title} poster`}
        className="movie_poster"
      />

      <div className="movie_overlay">
        <h3 className="movie_title">{movie.original_title}</h3>

        <div className="movie_meta">
          <span>{movie.release_date || "N/A"}</span>
          <span className="rating">
            {movie.vote_average?.toFixed(1) || "?"}
            <img src={Star} alt="rating icon" className="card_emoji" />
          </span>
        </div>

        <p className="movie_description">
          {movie.overview
            ? movie.overview.slice(0, 100) + "..."
            : "No description available."}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
