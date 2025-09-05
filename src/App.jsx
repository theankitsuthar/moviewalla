import React, { useState } from "react";
import MovieList from "./components/MovieList/MovieList";

const App = () => {
  const [category, setCategory] = useState("discover");

  return (
    <div>
      <MovieList category={category} setCategory={setCategory} />
    </div>
  );
};

export default App;
