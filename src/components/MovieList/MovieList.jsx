import React, { useEffect, useState, useCallback } from "react";
import "./MovieList.css";
import Fire from "../../assets/fire.png";
import MovieCard from "./MovieCard";

const API_KEY = "b7d73f4dee16391d7c1148f8df404ffa";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null); // For modal
  const [trailerKey, setTrailerKey] = useState(null); // For trailer youtube key
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch movies on initial load and when page changes
  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !loading &&
      page < totalPages
    ) {
      setPage((prev) => prev + 1);
    }
  }, [loading, page, totalPages]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Fetch movies from TMDB Discover API
  const fetchMovies = async (pageNum) => {
    setLoading(true);
    try {
      const url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}` +
        `&with_original_language=hi&with_origin_country=IN&release_date.lte=2025-12-31` +
        `&sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(url);
      const data = await response.json();

      if (pageNum === 1) {
        setMovies(data.results);
      } else {
        setMovies((prevMovies) => [...prevMovies, ...data.results]);
      }
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching Bollywood movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rating click handler
  const handleFilter = (rate) => {
    setMinRating(rate);
  };

  // Reset filters
  const handleReset = () => {
    setMinRating(null);
    setSearchTerm("");
    setSortBy("");
    setSortOrder("asc");
  };

  // Filter + search + sort combined
  const getFilteredAndSortedMovies = () => {
    let filtered = [...movies];

    if (minRating !== null) {
      filtered = filtered.filter(
        (movie) => Math.floor(movie.vote_average) === minRating
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((movie) =>
        movie.original_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
        else return aVal < bVal ? 1 : -1;
      });
    }

    return filtered;
  };

  // Fetch trailer for selected movie
  const fetchTrailer = async (movieId) => {
    setModalLoading(true);
    setTrailerKey(null);
    try {
      const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      // Look for official trailer or any YouTube video
      const trailer = data.results.find(
        (vid) =>
          vid.site === "YouTube" &&
          (vid.type === "Trailer" || vid.type === "Teaser")
      );

      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        setTrailerKey(null);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      setTrailerKey(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Open modal with movie details + fetch trailer
  const openModal = (movie) => {
    setSelectedMovie(movie);
    fetchTrailer(movie.id);
    // Lock scroll
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeModal = () => {
    setSelectedMovie(null);
    setTrailerKey(null);
    // Unlock scroll
    document.body.style.overflow = "auto";
  };

  const filteredMovies = getFilteredAndSortedMovies();

  return (
    <section className="movie_list">
      <header className="align_center movie_list_header">
        <h2 className="align center movie_list_heading">
          Bollywood Movies{" "}
          <img src={Fire} alt="fire emoji" className="navbar_emoji" />
        </h2>

        <div className="align_center movie_list_fs">
          {/* Search */}
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="movie_search"
          />

          {/* Rating Filters */}
          <ul className="align_center movie_filter">
            <li
              className={`movie_filter_item ${minRating === 8 ? "active" : ""}`}
              onClick={() => handleFilter(8)}
            >
              8 Star
            </li>
            <li
              className={`movie_filter_item ${minRating === 7 ? "active" : ""}`}
              onClick={() => handleFilter(7)}
            >
              7 Star
            </li>
            <li
              className={`movie_filter_item ${minRating === 6 ? "active" : ""}`}
              onClick={() => handleFilter(6)}
            >
              6 Star
            </li>
            <li
              className={`movie_filter_item ${
                minRating === null && searchTerm === "" ? "active" : ""
              }`}
              onClick={handleReset}
            >
              All
            </li>
          </ul>

          {/* Sort By */}
          <select
            className="movie_sorting"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="release_date">Date</option>
            <option value="vote_average">Rating</option>
          </select>

          {/* Sort Order */}
          <select
            className="movie_sorting"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </header>

      {/* Movie Cards */}
      <div className="movie_cards">
        {loading && page === 1 ? (
          <p className="loading_text">Loading movies...</p>
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => openModal(movie)} // Added onClick for modal
            />
          ))
        ) : (
          <p className="no_results">No Bollywood movies found.</p>
        )}
      </div>

      {loading && page > 1 && <p className="loading_text">Loading more movies...</p>}

      {/* Modal */}
      {selectedMovie && (
        <div className="modal_overlay" onClick={closeModal}>
          <div
            className="modal_content"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
          >
            <button className="modal_close" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedMovie.original_title}</h2>
            <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
            <p><strong>Rating:</strong> {selectedMovie.vote_average}</p>
            <p className="modal_overview">{selectedMovie.overview || "No description available."}</p>

            {modalLoading ? (
              <p>Loading trailer...</p>
            ) : trailerKey ? (
              <div className="modal_trailer">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p>No trailer available.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MovieList;
