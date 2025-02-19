// Ensure script runs after the page loads
document.addEventListener("DOMContentLoaded", () => {
  renderLists(); // Load stored watchlists
  loadTheme(); // Apply the saved theme
});

/*
 **Security Notice:** Hardcoding API keys **is not a best practice**, this project is meant to run locally, as it exposes sensitive data. Instead, consider:*/
const API_KEY = "xxxxxx"; // Hardcoded API Key (Replace "YOUR_API_KEY" with your actual key)

// Event listeners for search, export, and import
document.getElementById("searchButton").addEventListener("click", searchMovie);
document.getElementById("exportButton").addEventListener("click", exportData);
document
  .getElementById("importButton")
  .addEventListener("click", () =>
    document.getElementById("importFile").click()
  );
document.getElementById("importFile").addEventListener("change", importData);

// Function to search for movies using the OMDb API
async function searchMovie() {
  const query = document.getElementById("search").value.trim();
  if (!query) return;

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();

    document.getElementById("results").innerHTML =
      data.Response === "False"
        ? `<p>${data.Error}</p>`
        : displayResults(data.Search);
  } catch {
    document.getElementById("results").innerHTML =
      "<p>Error fetching data. Please try again.</p>";
  }
}

// Function to display search results
function displayResults(results) {
  return results
    .map(
      (movie) => `
      <div class="movie-card">
          <img src="${
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://via.placeholder.com/250x370?text=No+Image"
          }"
              alt="${movie.Title}">
          <p><strong>${movie.Title}</strong> (${movie.Year})</p>
          <div class="button-group">
              <button onclick="addToList('${
                movie.imdbID
              }', 'wantToWatch')">Want to Watch</button>
              <button onclick="addToList('${
                movie.imdbID
              }', 'watched')">Watched</button>
          </div>
      </div>`
    )
    .join("");
}

// Function to add a movie to a watchlist
async function addToList(imdbID, listName) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`
    );
    const movie = await response.json();
    if (!movie.Title) return;

    let list = JSON.parse(localStorage.getItem(listName) || "[]");
    if (!list.some((m) => m.imdbID === movie.imdbID)) {
      list.push(movie);
      localStorage.setItem(listName, JSON.stringify(list));
      renderLists();
    }
  } catch (error) {
    console.error("Error adding movie:", error);
  }
}

// Function to render stored watchlists
function renderLists() {
  ["wantToWatch", "watched"].forEach((listName) => {
    document.getElementById(listName).innerHTML = JSON.parse(
      localStorage.getItem(listName) || "[]"
    )
      .map(
        (movie) => `<li>
                <img src="${movie.Poster}" alt="${movie.Title}" style="width:50px;">
                ${movie.Title} (${movie.Year})
                <button onclick="removeFromList('${movie.imdbID}', '${listName}')">Remove</button>
              </li>`
      )
      .join("");
  });
}

// Function to remove a movie from a watchlist
function removeFromList(imdbID, listName) {
  let list = JSON.parse(localStorage.getItem(listName) || "[]").filter(
    (movie) => movie.imdbID !== imdbID
  );
  localStorage.setItem(listName, JSON.stringify(list));
  renderLists();
}

// Function to export watchlist data
function exportData() {
  const data = {
    wantToWatch: JSON.parse(localStorage.getItem("wantToWatch") || "[]"),
    watched: JSON.parse(localStorage.getItem("watched") || "[]"),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "movie_watchlist.json";
  a.click();
}

// Function to import watchlist data
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem("wantToWatch", JSON.stringify(data.wantToWatch || []));
    localStorage.setItem("watched", JSON.stringify(data.watched || []));
    renderLists();
  };
  reader.readAsText(file);
}

// Dark Mode Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  let stylesheet = document.getElementById("themeStylesheet");
  let savedTheme = localStorage.getItem("theme");

  // Apply saved theme on page load
  if (savedTheme) {
    stylesheet.setAttribute("href", savedTheme);
  }
});

document
  .getElementById("toggleDarkMode")
  .addEventListener("click", function () {
    let stylesheet = document.getElementById("themeStylesheet");
    let currentTheme = stylesheet.getAttribute("href");

    let newTheme = currentTheme.includes("dark-style.css")
      ? "styles/style.css"
      : "styles/dark-style.css";

    stylesheet.setAttribute("href", newTheme);
    localStorage.setItem("theme", newTheme); // Save theme preference
  });
