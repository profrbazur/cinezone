// ==========================================
// GOOGLE ANALYTICS 4 EVENT TRACKING
// ==========================================

function trackEvent(eventName, eventParameters = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParameters);

    // Helpful while testing analytics.
    console.log("GA4 Event:", eventName, eventParameters);
  } else {
    console.warn(
      "Google Analytics has not loaded. Event not sent:",
      eventName,
      eventParameters
    );
  }
}

const global = {
  currentPage: window.location.pathname,

  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },

  api: {
    // Register your key at https://www.themoviedb.org/settings/api
    // and enter it here.
    //
    // Only use this for development or very small projects.
    // You should store your key and make requests from a server.
    apiKey: "e76d2381f0382657b3c2960253bbd771",
    apiUrl: "https://api.themoviedb.org/3/",
  },
};

// ==========================================
// DISPLAY 20 MOST POPULAR MOVIES
// ==========================================

async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");

  results.forEach((movie) => {
    const div = document.createElement("div");

    div.classList.add("card");

    div.innerHTML = `
      <a
        href="movie-details.html?id=${movie.id}"
        class="analytics-movie-link"
      >
        ${
          movie.poster_path
            ? `<img
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
              />`
            : `<img
                src="../images/no-image.jpg"
                class="card-img-top"
                alt="${movie.title}"
              />`
        }
      </a>

      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>

        <p class="card-text">
          <small class="text-muted">
            Release: ${movie.release_date}
          </small>
        </p>
      </div>
    `;

    document.querySelector("#popular-movies").appendChild(div);

    // GA4: Track clicks on popular movie cards.
    const movieLink = div.querySelector(".analytics-movie-link");

    if (movieLink) {
      movieLink.addEventListener("click", () => {
        trackEvent("select_content", {
          content_type: "movie",
          item_id: String(movie.id),
          item_name: movie.title || "Unknown Movie",
          source_section: "popular_movies",
        });
      });
    }
  });
}

// ==========================================
// DISPLAY 20 MOST POPULAR TV SHOWS
// ==========================================

async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");

  results.forEach((show) => {
    const div = document.createElement("div");

    div.classList.add("card");

    div.innerHTML = `
      <a
        href="tv-details.html?id=${show.id}"
        class="analytics-show-link"
      >
        ${
          show.poster_path
            ? `<img
                src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
              />`
            : `<img
                src="../images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
              />`
        }
      </a>

      <div class="card-body">
        <h5 class="card-title">${show.name}</h5>

        <p class="card-text">
          <small class="text-muted">
            Air Date: ${show.first_air_date}
          </small>
        </p>
      </div>
    `;

    document.querySelector("#popular-shows").appendChild(div);

    // GA4: Track clicks on popular TV show cards.
    const showLink = div.querySelector(".analytics-show-link");

    if (showLink) {
      showLink.addEventListener("click", () => {
        trackEvent("select_content", {
          content_type: "tv_show",
          item_id: String(show.id),
          item_name: show.name || "Unknown TV Show",
          source_section: "popular_shows",
        });
      });
    }
  });
}

// ==========================================
// DISPLAY MOVIE DETAILS
// ==========================================

async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1];

  const movie = await fetchAPIData(`movie/${movieId}`);

  // GA4: Track a movie detail view.
  trackEvent("view_item", {
    content_type: "movie",
    item_id: String(movie.id),
    item_name: movie.title || "Unknown Movie",
    release_date: movie.release_date || "unknown",
    vote_average: movie.vote_average || 0,
  });

  // Overlay for background image.
  displayBackgroundImage("movie", movie.backdrop_path);

  const div = document.createElement("div");

  div.innerHTML = `
    <div class="details-top">
      <div>
        ${
          movie.poster_path
            ? `<img
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
              />`
            : `<img
                src="../images/no-image.jpg"
                class="card-img-top"
                alt="${movie.title}"
              />`
        }
      </div>

      <div>
        <h2>${movie.title}</h2>

        <p>
          <i class="fas fa-star text-primary"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </p>

        <p class="text-muted">
          Release Date: ${movie.release_date}
        </p>

        <p>
          ${movie.overview}
        </p>

        <h5>Genres</h5>

        <ul class="list-group">
          ${movie.genres
            .map((genre) => `<li>${genre.name}</li>`)
            .join("")}
        </ul>

        <a
          href="${movie.homepage}"
          target="_blank"
          class="btn analytics-movie-homepage"
        >
          Visit Movie Homepage
        </a>
      </div>
    </div>

    <div class="details-bottom">
      <h2>Movie Info</h2>

      <ul>
        <li>
          <span class="text-secondary">Budget:</span>
          $${addCommasToNumber(movie.budget)}
        </li>

        <li>
          <span class="text-secondary">Revenue:</span>
          $${addCommasToNumber(movie.revenue)}
        </li>

        <li>
          <span class="text-secondary">Runtime:</span>
          ${movie.runtime} minutes
        </li>

        <li>
          <span class="text-secondary">Status:</span>
          ${movie.status}
        </li>
      </ul>

      <h4>Production Companies</h4>

      <div class="list-group">
        ${movie.production_companies
          .map((company) => `<span>${company.name}</span>`)
          .join(", ")}
      </div>
    </div>
  `;

  document.querySelector("#movie-details").appendChild(div);

  // GA4: Track external movie homepage clicks.
  const movieHomepageLink = div.querySelector(
    ".analytics-movie-homepage"
  );

  if (movieHomepageLink) {
    movieHomepageLink.addEventListener("click", () => {
      trackEvent("click_content_homepage", {
        content_type: "movie",
        item_id: String(movie.id),
        item_name: movie.title || "Unknown Movie",
        destination_url: movie.homepage || "unknown",
      });
    });
  }
}

// ==========================================
// DISPLAY TV SHOW DETAILS
// ==========================================

async function displayShowDetails() {
  const showId = window.location.search.split("=")[1];

  const show = await fetchAPIData(`tv/${showId}`);

  // GA4: Track a TV show detail view.
  trackEvent("view_item", {
    content_type: "tv_show",
    item_id: String(show.id),
    item_name: show.name || "Unknown TV Show",
    first_air_date: show.first_air_date || "unknown",
    last_air_date: show.last_air_date || "unknown",
    vote_average: show.vote_average || 0,
  });

  // Overlay for background image.
  displayBackgroundImage("tv", show.backdrop_path);

  const div = document.createElement("div");

  div.innerHTML = `
    <div class="details-top">
      <div>
        ${
          show.poster_path
            ? `<img
                src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
              />`
            : `<img
                src="../images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
              />`
        }
      </div>

      <div>
        <h2>${show.name}</h2>

        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)} / 10
        </p>

        <p class="text-muted">
          Last Air Date: ${show.last_air_date}
        </p>

        <p>
          ${show.overview}
        </p>

        <h5>Genres</h5>

        <ul class="list-group">
          ${show.genres
            .map((genre) => `<li>${genre.name}</li>`)
            .join("")}
        </ul>

        <a
          href="${show.homepage}"
          target="_blank"
          class="btn analytics-show-homepage"
        >
          Visit Show Homepage
        </a>
      </div>
    </div>

    <div class="details-bottom">
      <h2>Show Info</h2>

      <ul>
        <li>
          <span class="text-secondary">
            Number of Episodes:
          </span>
          ${show.number_of_episodes}
        </li>

        <li>
          <span class="text-secondary">
            Last Episode To Air:
          </span>
          ${
            show.last_episode_to_air
              ? show.last_episode_to_air.name
              : "Not Available"
          }
        </li>

        <li>
          <span class="text-secondary">Status:</span>
          ${show.status}
        </li>
      </ul>

      <h4>Production Companies</h4>

      <div class="list-group">
        ${show.production_companies
          .map((company) => `<span>${company.name}</span>`)
          .join(", ")}
      </div>
    </div>
  `;

  document.querySelector("#show-details").appendChild(div);

  // GA4: Track external show homepage clicks.
  const showHomepageLink = div.querySelector(
    ".analytics-show-homepage"
  );

  if (showHomepageLink) {
    showHomepageLink.addEventListener("click", () => {
      trackEvent("click_content_homepage", {
        content_type: "tv_show",
        item_id: String(show.id),
        item_name: show.name || "Unknown TV Show",
        destination_url: show.homepage || "unknown",
      });
    });
  }
}

// ==========================================
// DISPLAY BACKDROP ON DETAILS PAGES
// ==========================================

function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");

  overlayDiv.style.backgroundImage =
    `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;

  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document
      .querySelector("#movie-details")
      .appendChild(overlayDiv);
  } else {
    document
      .querySelector("#show-details")
      .appendChild(overlayDiv);
  }
}

// ==========================================
// SEARCH MOVIES AND TV SHOWS
// ==========================================

async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.type = urlParams.get("type");
  global.search.term = urlParams.get("search-term");

  if (
    global.search.term !== "" &&
    global.search.term !== null
  ) {
    // GA4: Track the search term and selected search type.
    trackEvent("search", {
      search_term: global.search.term.trim(),
      search_type: global.search.type || "unknown",
    });

    const {
      results,
      total_pages,
      page,
      total_results,
    } = await searchAPIData();

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    // GA4: Track the number of returned search results.
    trackEvent("view_search_results", {
      search_term: global.search.term.trim(),
      search_type: global.search.type || "unknown",
      results_count: total_results,
      search_page: page,
    });

    if (results.length === 0) {
      trackEvent("search_no_results", {
        search_term: global.search.term.trim(),
        search_type: global.search.type || "unknown",
      });

      showAlert("No results found");

      return;
    }

    displaySearchResults(results);

    document.querySelector("#search-term").value = "";
  } else {
    showAlert("Please enter a search term");
  }
}

// ==========================================
// DISPLAY SEARCH RESULTS
// ==========================================

function displaySearchResults(results) {
  // Clear previous results.
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");

    const contentName =
      global.search.type === "movie"
        ? result.title
        : result.name;

    const contentType =
      global.search.type === "movie"
        ? "movie"
        : "tv_show";

    div.classList.add("card");

    div.innerHTML = `
      <a
        href="${global.search.type}-details.html?id=${result.id}"
        class="analytics-search-result"
      >
        ${
          result.poster_path
            ? `<img
                src="https://image.tmdb.org/t/p/w500${result.poster_path}"
                class="card-img-top"
                alt="${contentName}"
              />`
            : `<img
                src="../images/no-image.jpg"
                class="card-img-top"
                alt="${contentName}"
              />`
        }
      </a>

      <div class="card-body">
        <h5 class="card-title">
          ${contentName}
        </h5>

        <p class="card-text">
          <small class="text-muted">
            Release:
            ${
              global.search.type === "movie"
                ? result.release_date
                : result.first_air_date
            }
          </small>
        </p>
      </div>
    `;

    document.querySelector(
      "#search-results-heading"
    ).innerHTML = `
      <h2>
        ${results.length} of
        ${global.search.totalResults}
        Results for ${global.search.term}
      </h2>
    `;

    document.querySelector("#search-results").appendChild(div);

    // GA4: Track clicks on individual search results.
    const resultLink = div.querySelector(
      ".analytics-search-result"
    );

    if (resultLink) {
      resultLink.addEventListener("click", () => {
        trackEvent("select_content", {
          content_type: contentType,
          item_id: String(result.id),
          item_name: contentName || "Unknown Content",
          search_term: global.search.term,
          search_type: global.search.type,
          search_page: global.search.page,
          source_section: "search_results",
        });
      });
    }
  });

  displayPagination();
}

// ==========================================
// CREATE AND DISPLAY SEARCH PAGINATION
// ==========================================

function displayPagination() {
  const div = document.createElement("div");

  div.classList.add("pagination");

  div.innerHTML = `
    <button class="btn btn-primary" id="prev">
      Prev
    </button>

    <button class="btn btn-primary" id="next">
      Next
    </button>

    <div class="page-counter">
      Page ${global.search.page} of
      ${global.search.totalPages}
    </div>
  `;

  document.querySelector("#pagination").appendChild(div);

  // Disable previous button if on first page.
  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }

  // Disable next button if on last page.
  if (global.search.page === global.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  // Next page.
  document
    .querySelector("#next")
    .addEventListener("click", async () => {
      global.search.page++;

      // GA4: Track the Next pagination button.
      trackEvent("pagination_click", {
        direction: "next",
        destination_page: global.search.page,
        search_term: global.search.term,
        search_type: global.search.type,
      });

      const { results, total_pages } =
        await searchAPIData();

      global.search.totalPages = total_pages;

      displaySearchResults(results);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

  // Previous page.
  document
    .querySelector("#prev")
    .addEventListener("click", async () => {
      global.search.page--;

      // GA4: Track the Previous pagination button.
      trackEvent("pagination_click", {
        direction: "previous",
        destination_page: global.search.page,
        search_term: global.search.term,
        search_type: global.search.type,
      });

      const { results, total_pages } =
        await searchAPIData();

      global.search.totalPages = total_pages;

      displaySearchResults(results);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
}

// ==========================================
// DISPLAY MOVIES IN THE SLIDER
// ==========================================

async function displaySlider() {
  const { results } = await fetchAPIData(
    "movie/now_playing"
  );

  results.forEach((movie) => {
    const div = document.createElement("div");

    div.classList.add("swiper-slide");

    div.innerHTML = `
      <a
        href="movie-details.html?id=${movie.id}"
        class="analytics-slider-link"
      >
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title}"
        />
      </a>

      <h4 class="swiper-rating">
        <i class="fas fa-star text-secondary"></i>
        ${movie.vote_average} / 10
      </h4>
    `;

    document.querySelector(".swiper-wrapper").appendChild(div);

    // GA4: Track clicks on movies in the homepage slider.
    const sliderLink = div.querySelector(
      ".analytics-slider-link"
    );

    if (sliderLink) {
      sliderLink.addEventListener("click", () => {
        trackEvent("select_content", {
          content_type: "movie",
          item_id: String(movie.id),
          item_name: movie.title || "Unknown Movie",
          source_section: "now_playing_slider",
        });
      });
    }
  });

  // Initialize Swiper only after all slides are added.
  initSwiper();
}

// ==========================================
// INITIALIZE SWIPER
// ==========================================

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,

    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },

    breakpoints: {
      500: {
        slidesPerView: 2,
      },

      700: {
        slidesPerView: 3,
      },

      1200: {
        slidesPerView: 4,
      },
    },
  });
}

// ==========================================
// FETCH DATA FROM THE TMDB API
// ==========================================

async function fetchAPIData(endpoint) {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();

  try {
    const response = await fetch(
      `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(
        `TMDB request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("TMDB API error:", error);

    trackEvent("api_error", {
      api_name: "TMDB",
      endpoint,
      error_message: error.message,
    });

    throw error;
  } finally {
    hideSpinner();
  }
}

// ==========================================
// MAKE SEARCH REQUEST TO THE TMDB API
// ==========================================

async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();

  try {
    const encodedSearchTerm = encodeURIComponent(
      global.search.term
    );

    const response = await fetch(
      `${API_URL}search/${global.search.type}` +
        `?api_key=${API_KEY}` +
        `&language=en-US` +
        `&query=${encodedSearchTerm}` +
        `&page=${global.search.page}`
    );

    if (!response.ok) {
      throw new Error(
        `TMDB search request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("TMDB Search API error:", error);

    trackEvent("api_error", {
      api_name: "TMDB",
      endpoint: `search/${global.search.type}`,
      error_message: error.message,
    });

    throw error;
  } finally {
    hideSpinner();
  }
}

// ==========================================
// SHOW SPINNER
// ==========================================

function showSpinner() {
  const spinner = document.querySelector(".spinner");

  if (spinner) {
    spinner.classList.add("show");
  }
}

// ==========================================
// HIDE SPINNER
// ==========================================

function hideSpinner() {
  const spinner = document.querySelector(".spinner");

  if (spinner) {
    spinner.classList.remove("show");
  }
}

// ==========================================
// HIGHLIGHT ACTIVE NAVIGATION LINK
// ==========================================

function highlightActiveLink() {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const linkPath = new URL(
      link.href,
      window.location.origin
    ).pathname;

    if (
      link.getAttribute("href") === global.currentPage ||
      linkPath === global.currentPage
    ) {
      link.classList.add("active");
    }
  });
}

// ==========================================
// SHOW ALERT
// ==========================================

function showAlert(message, className = "error") {
  const alertContainer = document.querySelector("#alert");

  if (!alertContainer) {
    console.error(message);
    return;
  }

  const alertEl = document.createElement("div");

  alertEl.classList.add("alert", className);
  alertEl.appendChild(document.createTextNode(message));

  alertContainer.appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

// ==========================================
// FORMAT NUMBERS WITH COMMAS
// ==========================================

function addCommasToNumber(number) {
  return number
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ==========================================
// TRACK BASIC PAGE INFORMATION
// ==========================================

function trackCineZonePage() {
  let pageType = "unknown";

  switch (global.currentPage) {
    case "/":
    case "/index.html":
      pageType = "home";
      break;

    case "/shows.html":
      pageType = "popular_tv_shows";
      break;

    case "/movie-details.html":
      pageType = "movie_details";
      break;

    case "/tv-details.html":
      pageType = "tv_details";
      break;

    case "/search.html":
      pageType = "search_results";
      break;
  }

  trackEvent("cinezone_page_view", {
    page_type: pageType,
    page_path: global.currentPage,
    page_title: document.title,
  });
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function init() {
  // Custom page classification event.
  trackCineZonePage();

  switch (global.currentPage) {
    case "/":
    case "/index.html":
      displaySlider();
      displayPopularMovies();
      break;

    case "/shows.html":
      displayPopularShows();
      break;

    case "/movie-details.html":
      displayMovieDetails();
      break;

    case "/tv-details.html":
      displayShowDetails();
      break;

    case "/search.html":
      search();
      break;
  }

  highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);