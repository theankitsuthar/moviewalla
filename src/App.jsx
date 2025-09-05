import React from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import MovieList from "./components/MovieList/MovieList.jsx";  // 👈 Import MovieList

const App = () => {
    return (
        <div className="app">
            <Navbar />
            
            <main>
                <MovieList />   {/* 👈 Render MovieList here */}
            </main>
        </div>
    );
};

export default App;
