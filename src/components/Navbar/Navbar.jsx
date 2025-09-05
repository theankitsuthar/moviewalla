import React from "react";
import "./Navbar.css";

import Fire from "../../assets/fire.png";
import Star from "../../assets/glowing-star.png";
import Party from "../../assets/partying-face.png";

const Navbar = ({ setCategory }) => {
  return (
    <nav className="navbar">
      <h1>Moviewalla</h1>

      <div className="navbar_links">
        <button onClick={() => setCategory("discover")} className="navbar_btn">
          Bollywood 🎬
        </button>
        <button onClick={() => setCategory("popular")} className="navbar_btn">
          Popular <img src={Fire} alt="fire emoji" className="navbar_emoji" />
        </button>
        <button onClick={() => setCategory("top_rated")} className="navbar_btn">
          Top Rated <img src={Star} alt="star emoji" className="navbar_emoji" />
        </button>
        <button onClick={() => setCategory("upcoming")} className="navbar_btn">
          Upcoming <img src={Party} alt="party emoji" className="navbar_emoji" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
