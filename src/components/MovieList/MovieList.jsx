import React, { useEffect, useState, useCallback, useRef } from "react";

const API_KEY = "b7d73f4dee16391d7c1148f8df404ffa";

// MovieCard Component
const MovieCard = ({ movie }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  // Fetch trailer when the trailer button is clicked
  const fetchTrailer = async (movieId) => {
    setLoadingTrailer(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      
      // Find the first trailer
      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      
      if (trailer) {
        setTrailerKey(trailer.key);
        // Open the trailer in a new tab
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        alert("No trailer available for this movie.");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      alert("Failed to load trailer. Please try again.");
    } finally {
      setLoadingTrailer(false);
    }
  };

  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="movie-poster-container">
        {!imageLoaded && !imageError && (
          <div className="movie-poster-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={`movie-poster ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span>🎬</span>
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className={`movie-overlay ${isHovered ? 'active' : ''}`}>
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </span>
          <div className="rating">
            <span className="star-icon">⭐</span>
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        <p className="movie-description">
          {movie.overview || 'No description available.'}
        </p>
        <div className="movie-actions">
          <button 
            className="watch-trailer-btn"
            onClick={() => fetchTrailer(movie.id)}
            disabled={loadingTrailer}
          >
            <span className="btn-icon">▶️</span>
            {loadingTrailer ? 'Loading...' : 'Trailer'}
          </button>
          <button className="add-favorite-btn">
            <span className="btn-icon">❤️</span>
            Favorite
          </button>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ setCategory, activeCategory, setShowAbout }) => {
  const navItems = [
    { id: "all_bollywood", label: "All Bollywood", icon: "🎬" },
    { id: "now_playing", label: "Now Playing", icon: "🎭" },
    { id: "popular", label: "Popular", icon: "🔥" },
    { id: "top_rated", label: "Top Rated", icon: "⭐" },
    { id: "upcoming", label: "Upcoming", icon: "🎉" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>MovieWalla</h1>
        <span className="brand-tagline">Experience Indian Cinema</span>
      </div>
      
      <div className="navbar-links">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCategory(item.id)} 
            className={`navbar-btn ${activeCategory === item.id ? 'active' : ''}`}
          >
            <span className="btn-icon">{item.icon}</span>
            <span className="btn-text">{item.label}</span>
          </button>
        ))}
        <button 
          className="navbar-btn about-btn"
          onClick={() => setShowAbout(true)}
        >
          <span className="btn-icon">👤</span>
          <span className="btn-text">About</span>
        </button>
      </div>
    </nav>
  );
};

// About Component
const About = ({ setShowAbout }) => {
  return (
    <div className="about-modal">
      <div className="about-content">
        <button className="close-btn" onClick={() => setShowAbout(false)}>✕</button>
        <h2>About Me</h2>
        <div className="about-body">
          <div className="profile-section">
            <div className="profile-image">
              <span>👨‍💻</span>
            </div>
            <div className="profile-info">
              <h3>Ankit Kumar</h3>
              <p className="title">Machine Learning Engineer & AI Enthusiast</p>
              <div className="social-links">
                <a href="#" className="social-link">GitHub</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">Twitter</a>
              </div>
            </div>
          </div>
          
          <div className="about-text">
            <p>
              Passionate about building intelligent systems, data-driven solutions, 
    and innovative AI applications. Skilled in Python, TensorFlow, PyTorch, 
    and deploying ML models in real-world scenarios.
            </p>
            <p>
              I built this app using React and the TMDB API to showcase the latest and greatest 
              Bollywood movies. My goal was to create an immersive experience for users to discover, 
              explore, and enjoy Indian cinema.
            </p>
            
            <div className="skills">
              <h4>Technologies Used:</h4>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">JavaScript</span>
                <span className="tech-tag">CSS3</span>
                <span className="tech-tag">HTML5</span>
                <span className="tech-tag">TMDB API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main MovieList Component
const MovieList = ({ category }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch Bollywood movies specifically
  const fetchMovies = async (pageNum, type = category) => {
    setLoading(true);
    setError(null);
    try {
      let url = "";

      // Use Discover API for all_bollywood category
      if (type === "all_bollywood") {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&page=${pageNum}`;
      } 
      // Other categories use standard endpoints
      else if (type === "now_playing") {
        url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${pageNum}&region=IN`;
      } else {
        url = `https://api.themoviedb.org/3/movie/${type}?api_key=${API_KEY}&language=en-US&page=${pageNum}&region=IN`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // Additional filtering for Indian movies for non-all_bollywood categories
      let filteredMovies = data.results;
      if (type !== "all_bollywood") {
        filteredMovies = data.results.filter(movie => 
          movie.original_language === 'hi' || 
          (movie.origin_country && movie.origin_country.includes('IN'))
        );
      }

      if (pageNum === 1) {
        setMovies(filteredMovies || []);
      } else {
        setMovies((prev) => [...prev, ...(filteredMovies || [])]);
      }
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // On category change
  useEffect(() => {
    fetchMovies(1, category);
    setPage(1);
    setMinRating(null);
    setSearchTerm("");
    setSortBy("");
    setSortOrder("desc");
  }, [category]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    // Show/hide scroll to top button
    setShowScrollTop(window.scrollY > 300);
    
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch more pages
  useEffect(() => {
    if (page > 1) fetchMovies(page, category);
  }, [page]);

  // Filter and sort functions
  const handleFilter = (rate) => {
    setMinRating(minRating === rate ? null : rate);
  };
  
  const handleReset = () => {
    setMinRating(null);
    setSearchTerm("");
    setSortBy("");
    setSortOrder("desc");
  };

  // Apply filters/search/sort
  const getFilteredAndSortedMovies = () => {
    let filtered = [...movies];

    if (minRating !== null) {
      filtered = filtered.filter(
        (movie) => Math.floor(movie.vote_average) >= minRating
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // Handle different data types
        if (sortBy === 'release_date') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        } else if (sortBy === 'title') {
          aVal = aVal || '';
          bVal = bVal || '';
        } else {
          aVal = aVal || 0;
          bVal = bVal || 0;
        }
        
        return sortOrder === "asc"
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });
    }

    return filtered;
  };

  const filteredMovies = getFilteredAndSortedMovies();

  return (
    <div className="app-container">
      <section className="movie-list">
        <header className="movie-list-header">
          <div className="header-content">
            <h2 className="section-title">
              {category === 'all_bollywood' ? 'All Bollywood Movies' :
               category === 'now_playing' ? 'Now Playing' :
               category === 'popular' ? 'Popular Bollywood' :
               category === 'top_rated' ? 'Top Rated Bollywood' :
               category === 'upcoming' ? 'Upcoming Bollywood' : 'Bollywood Movies'}
            </h2>
            <p className="section-subtitle">
              Experience the magic of Indian cinema
            </p>
          </div>

          <div className="movie-controls">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search Bollywood movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-container">
              <span className="filter-icon">🎯</span>
              <div className="filter-buttons">
                {[8, 7, 6].map((rating) => (
                  <button
                    key={rating}
                    className={`filter-btn ${minRating === rating ? 'active' : ''}`}
                    onClick={() => handleFilter(rating)}
                  >
                    {rating}+ ⭐
                  </button>
                ))}
                <button
                  className={`filter-btn reset ${minRating === null && searchTerm === "" && !sortBy ? 'active' : ''}`}
                  onClick={handleReset}
                >
                  All
                </button>
              </div>
            </div>

            <div className="sort-container">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="release_date">Release Date</option>
                <option value="vote_average">Rating</option>
                <option value="title">Title</option>
                <option value="popularity">Popularity</option>
              </select>

              <button
                className={`sort-order-btn ${sortBy ? 'active' : 'disabled'}`}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                disabled={!sortBy}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => fetchMovies(1, category)} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        <div className="movie-grid">
          {loading && page === 1 ? (
            <div className="loading-container">
              <div className="loading-spinner large"></div>
              <p className="loading-text">Loading amazing Bollywood movies...</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <MovieCard key={`${movie.id}-${Math.random()}`} movie={movie} />
            ))
          ) : (
            <div className="no-results">
              <p>🎭 No Bollywood movies found matching your criteria.</p>
              <button onClick={handleReset} className="reset-btn">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {loading && page > 1 && (
          <div className="load-more-container">
            <div className="loading-spinner"></div>
            <span>Loading more movies...</span>
          </div>
        )}

        {showScrollTop && (
          <button className="scroll-top-btn" onClick={scrollToTop}>
            ↑
          </button>
        )}
      </section>
    </div>
  );
};

// Main App Component
const App = () => {
  const [category, setCategory] = useState("all_bollywood");
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app">
      <Navbar setCategory={setCategory} activeCategory={category} setShowAbout={setShowAbout} />
      <MovieList category={category} />
      {showAbout && <About setShowAbout={setShowAbout} />}
      
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Enhanced Navbar Styles */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(229, 9, 127, 0.3);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }

        .navbar-brand h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(45deg, #e5097f, #ff9d6c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-tagline {
          font-size: 0.8rem;
          color: rgba(229, 9, 127, 0.7);
          font-weight: 400;
          margin-top: -5px;
          display: block;
        }

        .navbar-links {
          display: flex;
          gap: 12px;
        }

        .navbar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 0.95rem;
          font-weight: 600;
          border: 2px solid transparent;
          border-radius: 30px;
          background: rgba(229, 9, 127, 0.1);
          color: #e5097f;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .navbar-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(229, 9, 127, 0.2), transparent);
          transition: left 0.5s;
        }

        .navbar-btn:hover::before {
          left: 100%;
        }

        .navbar-btn:hover,
        .navbar-btn.active {
          background: #e5097f;
          color: #fff;
          border-color: #e5097f;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(229, 9, 127, 0.3);
        }

        .about-btn {
          background: rgba(255, 157, 108, 0.1);
          color: #ff9d6c;
        }

        .about-btn:hover,
        .about-btn.active {
          background: #ff9d6c;
          color: #fff;
          border-color: #ff9d6c;
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        /* About Modal Styles */
        .about-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(5px);
        }

        .about-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(229, 9, 127, 0.3);
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(229, 9, 127, 0.1);
          border: none;
          color: #e5097f;
          font-size: 1.5rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #e5097f;
          color: #fff;
        }

        .about-content h2 {
          text-align: center;
          margin-bottom: 25px;
          background: linear-gradient(45deg, #e5097f, #ff9d6c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-section {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(229, 9, 127, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin-right: 20px;
          border: 2px solid rgba(229, 9, 127, 0.3);
        }

        .profile-info h3 {
          font-size: 1.5rem;
          margin-bottom: 5px;
          color: #ff9d6c;
        }

        .title {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
        }

        .social-links {
          display: flex;
          gap: 10px;
        }

        .social-link {
          color: #e5097f;
          text-decoration: none;
          font-size: 0.9rem;
          padding: 5px 10px;
          border: 1px solid rgba(229, 9, 127, 0.3);
          border-radius: 15px;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #e5097f;
          color: #fff;
        }

        .about-text p {
          margin-bottom: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }

        .skills {
          margin-top: 20px;
        }

        .skills h4 {
          color: #ff9d6c;
          margin-bottom: 10px;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tech-tag {
          background: rgba(229, 9, 127, 0.1);
          color: #e5097f;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
          border: 1px solid rgba(229, 9, 127, 0.3);
        }

        /* Movie List Styles */
        .movie-list {
          padding: 40px 0;
          position: relative;
        }

        .movie-list-header {
          margin-bottom: 40px;
        }

        .header-content {
          text-align: center;
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #e5097f, #ff9d6c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          font-weight: 400;
        }

        .movie-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          align-items: center;
        }

        .search-container {
          position: relative;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          pointer-events: none;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 14px 20px 14px 50px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(229, 9, 127, 0.3);
          border-radius: 25px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search-input:focus {
          border-color: #e5097f;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 20px rgba(229, 9, 127, 0.2);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .clear-search:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #e5097f;
        }

        .filter-container,
        .sort-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-icon {
          font-size: 1.2rem;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(229, 9, 127, 0.3);
          border-radius: 20px;
          color: #e5097f;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: #e5097f;
          color: #fff;
          transform: translateY(-2px);
        }

        .filter-btn.reset.active {
          background: #4CAF50;
          border-color: #4CAF50;
        }

        .sort-select {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(229, 9, 127, 0.3);
          border-radius: 20px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }

        .sort-select:focus {
          border-color: #e5097f;
          background: rgba(255, 255, 255, 0.15);
        }

        .sort-order-btn {
          padding: 12px;
          background: rgba(229, 9, 127, 0.1);
          border: 2px solid rgba(229, 9, 127, 0.3);
          border-radius: 50%;
          color: #e5097f;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          width: 45px;
          height: 45px;
        }

        .sort-order-btn:hover:not(.disabled),
        .sort-order-btn.active {
          background: #e5097f;
          color: #fff;
          transform: scale(1.1);
        }

        .sort-order-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Movie Grid */
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        /* Enhanced Movie Card */
        .movie-card {
          position: relative;
          aspect-ratio: 2/3;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: center;
        }

        .movie-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(229, 9, 127, 0.1) 0%,
            transparent 50%,
            rgba(229, 9, 127, 0.05) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }

        .movie-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.6),
            0 10px 20px rgba(229, 9, 127, 0.2);
        }

        .movie-card:hover::before {
          opacity: 1;
        }

        .movie-poster-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease, opacity 0.3s ease;
          opacity: 0;
        }

        .movie-poster.loaded {
          opacity: 1;
        }

        .movie-card:hover .movie-poster {
          transform: scale(1.08);
        }

        .movie-poster-loading,
        .movie-poster-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          gap: 10px;
        }

        .movie-poster-placeholder span:first-child {
          font-size: 2rem;
        }

        .movie-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 12px 12px;
          background: linear-gradient(
            to top,
            rgba(26, 26, 46, 0.95) 0%,
            rgba(26, 26, 46, 0.8) 50%,
            rgba(26, 26, 46, 0.4) 80%,
            transparent 100%
          );
          opacity: 0;
          transform: translateY(100%);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          z-index: 2;
          backdrop-filter: blur(8px);
        }

        .movie-overlay.active {
          opacity: 1;
          transform: translateY(0);
        }

        .movie-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ff9d6c;
          margin-bottom: 8px;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .movie-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
          color: #ff9d6c;
          margin-bottom: 10px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          background: rgba(229, 9, 127, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(229, 9, 127, 0.3);
        }

        .star-icon {
          font-size: 0.9rem;
        }

        .movie-description {
          font-size: 0.85rem;
          line-height: 1.4;
          color: #e0e0e0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .movie-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .watch-trailer-btn,
        .add-favorite-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .watch-trailer-btn {
          background: rgba(229, 9, 127, 0.9);
          color: #fff;
        }

        .watch-trailer-btn:hover:not(:disabled) {
          background: #e5097f;
          transform: translateY(-2px);
        }

        .watch-trailer-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .add-favorite-btn {
          background: rgba(255, 157, 108, 0.2);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .add-favorite-btn:hover {
          background: rgba(255, 157, 108, 0.3);
          transform: translateY(-2px);
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(229, 9, 127, 0.3);
          border-radius: 50%;
          border-top-color: #e5097f;
          animation: spin 1s ease-in-out infinite;
        }

        .loading-spinner.large {
          width: 48px;
          height: 48px;
          border-width: 4px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Loading and No Results */
        .loading-container,
        .no-results,
        .error-message {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .loading-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin-top: 16px;
        }

        .load-more-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          color: rgba(255, 255, 255, 0.7);
        }

        .reset-btn,
        .retry-btn {
          margin-top: 16px;
          padding: 12px 24px;
          background: #e5097f;
          color: #fff;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reset-btn:hover,
        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(229, 9, 127, 0.3);
        }

        .retry-btn {
          background: #ff6b6b;
          color: white;
        }

        /* Scroll to top button */
        .scroll-top-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #e5097f;
          color: #fff;
          border: none;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(229, 9, 127, 0.4);
          transition: all 0.3s ease;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scroll-top-btn:hover {
          transform: translateY(-5px) scale(1.1);
          box-shadow: 0 8px 25px rgba(229, 9, 127, 0.6);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .navbar-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .navbar-btn {
            font-size: 0.85rem;
            padding: 10px 16px;
          }

          .section-title {
            font-size: 2rem;
          }

          .movie-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: 100%;
          }

          .movie-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
          }

          .filter-container,
          .sort-container {
            justify-content: center;
          }

          .movie-overlay {
            padding: 12px 10px 10px;
          }

          .movie-title {
            font-size: 1rem;
          }

          .movie-meta {
            font-size: 0.8rem;
          }

          .movie-description {
            font-size: 0.8rem;
            -webkit-line-clamp: 2;
          }

          .movie-actions {
            flex-direction: column;
            gap: 8px;
          }

          .watch-trailer-btn,
          .add-favorite-btn {
            font-size: 0.75rem;
            padding: 6px 10px;
          }

          .profile-section {
            flex-direction: column;
            text-align: center;
          }

          .profile-image {
            margin-right: 0;
            margin-bottom: 15px;
          }

          .about-content {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .movie-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 16px;
          }

          .scroll-top-btn {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .tech-tags {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default App;