document.addEventListener("DOMContentLoaded", () => {
  // Function to fetch and display the first movie's details
  function fetchFirstMovieDetails() {
    fetch("http://localhost:3000/films/1")
      .then((response) => response.json())
      .then((data) => displayMovieDetails(data))
      .catch((error) => console.error("Error fetching movie details:", error));
  }

  // Function to display the movie's details
  function displayMovieDetails(movie) {
    const availableTickets = movie.capacity - movie.tickets_sold;

    // Update DOM elements with movie data
    document.getElementById("poster").src = movie.poster;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("runtime").textContent = `${movie.runtime} minutes`;
    document.getElementById("film-info").textContent = movie.description;
    document.getElementById("showtime").textContent = movie.showtime;
    document.getElementById(
      "ticket-num"
    ).textContent = `${availableTickets} remaining tickets`;

    // Handle ticket purchase logic
    handleTicketPurchase(movie);
  }

  // Function to handle ticket purchase
  function handleTicketPurchase(movie) {
    const buyButton = document.getElementById("buy-ticket");
    buyButton.addEventListener("click", () => {
      let availableTickets = movie.capacity - movie.tickets_sold;

      if (availableTickets > 0) {
        movie.tickets_sold += 1; // Increase tickets sold
        availableTickets -= 1;

        // Update DOM for available tickets
        document.getElementById(
          "ticket-num"
        ).textContent = `${availableTickets} remaining tickets`;

        // Persist the updated tickets_sold count to the server
        fetch(`http://localhost:3000/films/${movie.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
        })
          .then((response) => response.json())
          .then((updatedMovie) =>
            console.log("Updated tickets sold:", updatedMovie)
          )
          .catch((error) => console.error("Error:", error));

        // Post a new ticket entry to the tickets endpoint
        fetch("http://localhost:3000/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            film_id: movie.id,
            number_of_tickets: 1,
          }),
        })
          .then((response) => response.json())
          .then((ticket) => console.log("New ticket:", ticket))
          .catch((error) => console.error("Error posting ticket:", error));
      } else {
        buyButton.textContent = "Sold Out"; // Disable further purchases
      }
    });
  }

  // Function to fetch and display all films in the menu
  function fetchAllFilms() {
    const filmList = document.getElementById("films");

    // Remove the hardcoded placeholder <li>
    const placeholder = document.querySelector(".film.item");
    if (placeholder) {
      placeholder.remove();
    }

    // Fetch the list of films from the server
    fetch("http://localhost:3000/films")
      .then((response) => response.json())
      .then((films) => {
        films.forEach((film) => {
          // Create a new <li> element for each film
          const filmItem = document.createElement("li");
          filmItem.textContent = film.title;
          filmItem.classList.add("film", "item");

          // Append each <li> to the <ul#films>
          filmList.appendChild(filmItem);

          // Add delete button and handle deletion
          addDeleteButton(filmItem, film);

          // Add event listener to show selected movie details
          filmItem.addEventListener("click", () => fetchMovieDetails(film.id));
        });
      })
      .catch((error) => console.error("Error fetching films:", error));
  }

  // Function to fetch and display the selected movie's details
  function fetchMovieDetails(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`)
      .then((response) => response.json())
      .then((selectedFilm) => displayMovieDetails(selectedFilm))
      .catch((error) => console.error("Error fetching film details:", error));
  }

  // Function to add a delete button to a film and handle its deletion
  function addDeleteButton(filmItem, film) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    filmItem.appendChild(deleteButton);

    deleteButton.addEventListener("click", () => {
      fetch(`http://localhost:3000/films/${film.id}`, {
        method: "DELETE",
      })
        .then(() => {
          filmItem.remove(); // Remove film from the DOM
          console.log(`Deleted film: ${film.title}`);
        })
        .catch((error) => console.error("Error deleting film:", error));
    });
  }

  // Fetch the first movie's details on page load
  fetchFirstMovieDetails();

// Fetch all films for the menu on page load
fetchAllFilms();
});
