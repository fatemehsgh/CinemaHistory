// ========================================================
// CINELOG - APPLICATION CONTROLLER (REFINED VERSION)
// ========================================================

const STATE = {
  token: localStorage.getItem('cinelog_token') || '',
  user: null,
  movies: [],
  filteredMovies: [],
  activeGenre: 'all',
  currentRating: 9,
  viewMode: 'grid',
  selectedMovieForView: null,
  isEditMode: false
};

// Rating descriptors
const RATING_DESCRIPTORS = {
  10: "۱۰ / ۱۰ (شاهکار تکرارنشدنی)",
  9: "۹ / ۱۰ (فوق‌العاده و به‌یادماندنی)",
  8: "۸ / ۱۰ (بسیار عالی و دیدنی)",
  7: "۷ / ۱۰ (خیلی خوب و جذاب)",
  6: "۶ / ۱۰ (ارزش دیدن دارد)",
  5: "۵ / ۱۰ (متوسط و معمولی)",
  4: "۴ / ۱۰ (ضعیف)",
  3: "۳ / ۱۰ (خیلی ضعیف)",
  2: "۲ / ۱۰ (اتلاف وقت)",
  1: "۱ / ۱۰ (فاجعه)"
};

// DOM References
const DOM = {
  userProfileBtn: document.getElementById('userProfileBtn'),
  navUserName: document.getElementById('navUserName'),
  navUserAvatar: document.getElementById('navUserAvatar'),
  btnOpenAddMovie: document.getElementById('btnOpenAddMovie'),
  btnOpenStats: document.getElementById('btnOpenStats'),
  btnExportData: document.getElementById('btnExportData'),
  btnCreateDesktopShortcut: document.getElementById('btnCreateDesktopShortcut'),

  // Stats
  statTotalCount: document.getElementById('statTotalCount'),
  statAvgRating: document.getElementById('statAvgRating'),
  statThisYearCount: document.getElementById('statThisYearCount'),
  statFavoritesCount: document.getElementById('statFavoritesCount'),

  // Toolbar
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  filterWatchYear: document.getElementById('filterWatchYear'),
  filterRating: document.getElementById('filterRating'),
  sortBy: document.getElementById('sortBy'),
  btnViewGrid: document.getElementById('btnViewGrid'),
  btnViewList: document.getElementById('btnViewList'),
  genrePillsContainer: document.getElementById('genrePillsContainer'),

  // Main list
  moviesContainer: document.getElementById('moviesContainer'),
  moviesCountBadge: document.getElementById('moviesCountBadge'),
  emptyState: document.getElementById('emptyState'),
  btnEmptyAdd: document.getElementById('btnEmptyAdd'),

  // Add / Edit Modal
  movieModal: document.getElementById('movieModal'),
  movieModalTitle: document.getElementById('movieModalTitle'),
  btnCloseMovieModal: document.getElementById('btnCloseMovieModal'),
  btnCancelMovieModal: document.getElementById('btnCancelMovieModal'),
  movieForm: document.getElementById('movieForm'),
  editMovieId: document.getElementById('editMovieId'),
  movieTitle: document.getElementById('movieTitle'),
  btnSearchOnline: document.getElementById('btnSearchOnline'),
  searchBtnText: document.getElementById('searchBtnText'),
  searchBtnSpinner: document.getElementById('searchBtnSpinner'),
  fetchResultsDropdown: document.getElementById('fetchResultsDropdown'),
  movieReleaseYear: document.getElementById('movieReleaseYear'),
  movieWatchYear: document.getElementById('movieWatchYear'),
  movieGenres: document.getElementById('movieGenres'),
  starRatingContainer: document.getElementById('starRatingContainer'),
  ratingDisplayBadge: document.getElementById('ratingDisplayBadge'),
  movieSynopsis: document.getElementById('movieSynopsis'),
  moviePoster: document.getElementById('moviePoster'),
  posterPreviewImg: document.getElementById('posterPreviewImg'),
  posterPlaceholderText: document.getElementById('posterPlaceholderText'),
  movieReview: document.getElementById('movieReview'),
  movieIsFavorite: document.getElementById('movieIsFavorite'),
  btnSubmitMovieText: document.getElementById('btnSubmitMovieText'),

  // View Modal
  viewModal: document.getElementById('viewModal'),
  btnCloseViewModal: document.getElementById('btnCloseViewModal'),
  viewModalHero: document.getElementById('viewModalHero'),
  viewPosterImg: document.getElementById('viewPosterImg'),
  viewFavoriteBadge: document.getElementById('viewFavoriteBadge'),
  viewReleaseYearBadge: document.getElementById('viewReleaseYearBadge'),
  viewWatchYearBadge: document.getElementById('viewWatchYearBadge'),
  viewMovieTitle: document.getElementById('viewMovieTitle'),
  viewGenresContainer: document.getElementById('viewGenresContainer'),
  viewRatingNumber: document.getElementById('viewRatingNumber'),
  viewStarsContainer: document.getElementById('viewStarsContainer'),
  viewRatingDescriptor: document.getElementById('viewRatingDescriptor'),
  viewSynopsis: document.getElementById('viewSynopsis'),
  viewReviewSection: document.getElementById('viewReviewSection'),
  viewReviewText: document.getElementById('viewReviewText'),
  btnViewEdit: document.getElementById('btnViewEdit'),
  btnViewDelete: document.getElementById('btnViewDelete'),

  // Auth Modal
  authModal: document.getElementById('authModal'),
  btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
  authLoggedInView: document.getElementById('authLoggedInView'),
  authFormView: document.getElementById('authFormView'),
  authCurrentAvatar: document.getElementById('authCurrentAvatar'),
  authCurrentName: document.getElementById('authCurrentName'),
  authCurrentUsername: document.getElementById('authCurrentUsername'),
  authCurrentBio: document.getElementById('authCurrentBio'),
  tabLogin: document.getElementById('tabLogin'),
  tabRegister: document.getElementById('tabRegister'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  regName: document.getElementById('regName'),
  regEmail: document.getElementById('regEmail'),
  regUsername: document.getElementById('regUsername'),
  regPassword: document.getElementById('regPassword'),
  avatarPickerGrid: document.getElementById('avatarPickerGrid'),
  btnSwitchAccount: document.getElementById('btnSwitchAccount'),
  btnLogout: document.getElementById('btnLogout'),
  btnGoogleLogin: document.getElementById('btnGoogleLogin'),
  authGoogleView: document.getElementById('authGoogleView'),
  btnBackFromGoogle: document.getElementById('btnBackFromGoogle'),
  googleOfficialSection: document.getElementById('googleOfficialSection'),
  googleOfficialButtonContainer: document.getElementById('googleOfficialButtonContainer'),
  googleSavedAccountsSection: document.getElementById('googleSavedAccountsSection'),
  googleSavedAccountsList: document.getElementById('googleSavedAccountsList'),
  googleDirectForm: document.getElementById('googleDirectForm'),
  googleDirectEmail: document.getElementById('googleDirectEmail'),
  googleDirectName: document.getElementById('googleDirectName'),
  btnSubmitGoogleDirect: document.getElementById('btnSubmitGoogleDirect'),
  btnToggleGoogleAdvanced: document.getElementById('btnToggleGoogleAdvanced'),
  googleAdvancedPanel: document.getElementById('googleAdvancedPanel'),
  googleClientIdInput: document.getElementById('googleClientIdInput'),
  btnSaveGoogleClientId: document.getElementById('btnSaveGoogleClientId'),
  btnClearGoogleClientId: document.getElementById('btnClearGoogleClientId'),
  quickSavedAccountBar: document.getElementById('quickSavedAccountBar'),

  // Stats Modal
  statsModal: document.getElementById('statsModal'),
  btnCloseStatsModal: document.getElementById('btnCloseStatsModal'),
  ratingBarsContainer: document.getElementById('ratingBarsContainer'),
  yearsBarsContainer: document.getElementById('yearsBarsContainer'),
  topGenresContainer: document.getElementById('topGenresContainer'),

  toastContainer: document.getElementById('toastContainer')
};

// ========================================================
// TOAST NOTIFICATIONS
// ========================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
    <span>${message}</span>
  `;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function toPersianDigits(num) {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
}

// ========================================================
// AUTH & API (WITH LOCALSTORAGE STATIC HOST FALLBACK)
// ========================================================
const IS_STATIC_HOST = window.location.hostname.includes('github.io') || 
                       window.location.protocol === 'file:' || 
                       window.location.hostname === '';

function localApiFallback(endpoint, method = 'GET', body = null) {
  const cleanEndpoint = endpoint.split('?')[0];

  // GET /api/me
  if (cleanEndpoint === '/api/me' && method === 'GET') {
    const userStr = localStorage.getItem('cinelog_user');
    if (userStr) {
      try {
        return { user: JSON.parse(userStr) };
      } catch (e) {}
    }
    const defaultUser = {
      id: 'usr-guest',
      name: 'کاربر سینما',
      username: 'cinema_lover',
      avatar: '🎬',
      bio: 'دفترچه خاطرات سینمایی من'
    };
    localStorage.setItem('cinelog_user', JSON.stringify(defaultUser));
    localStorage.setItem('cinelog_token', 'local-token-guest');
    return { user: defaultUser };
  }

  // POST /api/login
  if (cleanEndpoint === '/api/login' && method === 'POST') {
    const { username } = body || {};
    const users = JSON.parse(localStorage.getItem('cinelog_users') || '[]');
    let user = users.find(u => u.username?.toLowerCase() === (username || '').toLowerCase());
    if (!user) {
      user = {
        id: 'usr-' + Date.now(),
        name: username || 'کاربر سینما',
        username: username || 'user',
        avatar: '🎬',
        bio: 'علاقه‌مند به سینما'
      };
      users.push(user);
      localStorage.setItem('cinelog_users', JSON.stringify(users));
    }
    const token = 'local-token-' + Date.now();
    localStorage.setItem('cinelog_token', token);
    localStorage.setItem('cinelog_user', JSON.stringify(user));
    return { token, user };
  }

  // POST /api/register
  if (cleanEndpoint === '/api/register' && method === 'POST') {
    const { name, username, avatar } = body || {};
    const user = {
      id: 'usr-' + Date.now(),
      name: name || username || 'کاربر سینما',
      username: username || 'user',
      avatar: avatar || '🎬',
      bio: 'دفترچه خاطرات سینمایی من'
    };
    const users = JSON.parse(localStorage.getItem('cinelog_users') || '[]');
    users.push(user);
    localStorage.setItem('cinelog_users', JSON.stringify(users));
    const token = 'local-token-' + Date.now();
    localStorage.setItem('cinelog_token', token);
    localStorage.setItem('cinelog_user', JSON.stringify(user));
    return { token, user };
  }

  // POST /api/logout
  if (cleanEndpoint === '/api/logout') {
    localStorage.removeItem('cinelog_token');
    localStorage.removeItem('cinelog_user');
    return { success: true };
  }

  // GET /api/movies
  if (cleanEndpoint === '/api/movies' && method === 'GET') {
    let movies = JSON.parse(localStorage.getItem('cinelog_movies') || '[]');
    if (movies.length === 0 && window.CURATED_MOVIES && window.CURATED_MOVIES.length) {
      movies = window.CURATED_MOVIES.slice(0, 4).map((m, idx) => ({
        id: 'mov-init-' + (idx + 1),
        title: m.title,
        persianTitle: m.persianTitle || '',
        releaseYear: m.releaseYear || 2020,
        watchYear: 1403,
        genres: m.genres || ['درام'],
        rating: 10 - idx,
        synopsis: m.synopsis || '',
        poster: m.poster || '',
        review: idx === 0 ? 'یکی از تاثیرگذارترین و زیباترین فیلم‌هایی که تا به حال دیدم.' : '',
        isFavorite: idx < 2,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem('cinelog_movies', JSON.stringify(movies));
    }
    return { movies };
  }

  // POST /api/movies
  if (cleanEndpoint === '/api/movies' && method === 'POST') {
    const movies = JSON.parse(localStorage.getItem('cinelog_movies') || '[]');
    const newMovie = {
      id: 'mov-' + Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };
    movies.unshift(newMovie);
    localStorage.setItem('cinelog_movies', JSON.stringify(movies));
    return { success: true, movie: newMovie };
  }

  // PUT /api/movies/:id
  if (cleanEndpoint.startsWith('/api/movies/') && method === 'PUT') {
    const id = cleanEndpoint.replace('/api/movies/', '');
    const movies = JSON.parse(localStorage.getItem('cinelog_movies') || '[]');
    const idx = movies.findIndex(m => m.id === id);
    if (idx !== -1) {
      movies[idx] = { ...movies[idx], ...body };
      localStorage.setItem('cinelog_movies', JSON.stringify(movies));
      return { success: true, movie: movies[idx] };
    }
    return { success: true };
  }

  // DELETE /api/movies/:id
  if (cleanEndpoint.startsWith('/api/movies/') && method === 'DELETE') {
    const id = cleanEndpoint.replace('/api/movies/', '');
    let movies = JSON.parse(localStorage.getItem('cinelog_movies') || '[]');
    movies = movies.filter(m => m.id !== id);
    localStorage.setItem('cinelog_movies', JSON.stringify(movies));
    return { success: true };
  }

  // GET /api/google-accounts
  if (cleanEndpoint === '/api/google-accounts') {
    return { accounts: [] };
  }

  // GET /api/google-config
  if (cleanEndpoint === '/api/google-config') {
    return { clientId: '' };
  }

  // POST /api/google-login
  if (cleanEndpoint === '/api/google-login') {
    const user = {
      id: 'usr-google-' + Date.now(),
      name: body?.name || 'کاربر گوگل',
      username: body?.email ? body.email.split('@')[0] : 'google_user',
      avatar: '🌟',
      bio: 'ورود از طریق حساب گوگل'
    };
    const token = 'local-google-token-' + Date.now();
    localStorage.setItem('cinelog_token', token);
    localStorage.setItem('cinelog_user', JSON.stringify(user));
    return { token, user };
  }

  // POST /api/create-desktop-shortcut
  if (cleanEndpoint === '/api/create-desktop-shortcut') {
    return { success: false, message: 'در نسخه وب می‌توانید این صفحه را بوکمارک کنید یا گزینه Install App را بزنید.' };
  }

  return { success: true };
}

async function apiCall(endpoint, method = 'GET', body = null) {
  if (IS_STATIC_HOST) {
    return localApiFallback(endpoint, method, body);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (STATE.token) {
    headers['Authorization'] = `Bearer ${STATE.token}`;
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return localApiFallback(endpoint, method, body);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return localApiFallback(endpoint, method, body);
  }
}

async function initAuth() {
  const storedLocalUser = JSON.parse(localStorage.getItem('cinelog_local_user') || 'null');
  if (storedLocalUser && (storedLocalUser.username === 'cinema' || storedLocalUser.id === 'local-1')) {
    localStorage.removeItem('cinelog_local_user');
  }

  if (STATE.token) {
    try {
      const data = await apiCall('/api/me');
      STATE.user = data.user;
      updateUserUI();
      await loadMovies();
      return;
    } catch (err) {
      STATE.token = '';
      localStorage.removeItem('cinelog_token');
    }
  }

  if (IS_STATIC_HOST) {
    const res = localApiFallback('/api/me', 'GET');
    STATE.user = res.user;
    STATE.token = localStorage.getItem('cinelog_token') || 'local-token-guest';
    updateUserUI();
    await loadMovies();
    return;
  }

  STATE.token = '';
  STATE.user = null;
  updateUserUI();
  await loadMovies();
}

function updateUserUI() {
  if (STATE.user) {
    DOM.navUserName.textContent = STATE.user.name || STATE.user.username;
    DOM.navUserAvatar.textContent = STATE.user.avatar || '🎬';

    DOM.authCurrentName.textContent = STATE.user.name;
    DOM.authCurrentUsername.textContent = '@' + STATE.user.username;
    DOM.authCurrentAvatar.textContent = STATE.user.avatar || '🎬';
    DOM.authCurrentBio.textContent = STATE.user.bio || 'دفترچه خاطرات سینمایی من';

    DOM.authLoggedInView.style.display = 'block';
    DOM.authFormView.style.display = 'none';
    if (DOM.authGoogleView) DOM.authGoogleView.style.display = 'none';
  } else {
    DOM.navUserName.textContent = 'ورود / ثبت‌نام';
    DOM.navUserAvatar.textContent = '👤';
    DOM.authLoggedInView.style.display = 'none';
    DOM.authFormView.style.display = 'block';
    if (DOM.authGoogleView) DOM.authGoogleView.style.display = 'none';
  }
}

// ========================================================
// MOVIES DATA
// ========================================================
async function loadMovies() {
  if (!STATE.user) {
    STATE.movies = [];
    applyFiltersAndSort();
    updateStatsSummary();
    return;
  }

  try {
    const data = await apiCall('/api/movies');
    STATE.movies = data.movies || [];
    applyFiltersAndSort();
    updateStatsSummary();
  } catch (e) {
    STATE.movies = JSON.parse(localStorage.getItem('cinelog_local_movies') || '[]');
    applyFiltersAndSort();
    updateStatsSummary();
  }
}

function saveLocalMovies() {
  localStorage.setItem('cinelog_local_movies', JSON.stringify(STATE.movies));
}

// ========================================================
// RENDERING MOVIES
// ========================================================
function renderMovies() {
  const container = DOM.moviesContainer;
  container.innerHTML = '';

  const movies = STATE.filteredMovies;
  DOM.moviesCountBadge.textContent = toPersianDigits(movies.length);

  if (movies.length === 0) {
    container.style.display = 'none';
    DOM.emptyState.style.display = 'flex';
    return;
  }

  container.style.display = STATE.viewMode === 'list' ? 'flex' : 'grid';
  DOM.emptyState.style.display = 'none';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;

    const posterUrl = movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
    const genresHtml = (movie.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('');
    const reviewHtml = movie.review ? `<div class="movie-card-review">💬 "${movie.review}"</div>` : '';

    // Star representation
    const starsCount = Math.round(movie.rating || 0);

    card.innerHTML = `
      <div class="movie-poster-box">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'">
        <div class="poster-overlay">
          <div class="top-badges">
            <span class="badge badge-year">${movie.releaseYear}</span>
            <button class="fav-star-btn ${movie.isFavorite ? 'is-fav' : ''}" title="نشان کردن به عنوان برگزیده" data-fav-id="${movie.id}">
              ${movie.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="card-rating-badge">
            <span>★</span>
            <span>${movie.rating} / ۱۰</span>
          </div>
        </div>
      </div>

      <div class="movie-card-content">
        <div class="movie-titles">
          <h3 class="movie-title-fa">${movie.title}</h3>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="movie-genres-row">${genresHtml}</div>
          <span class="badge badge-watch">سالی که دیدم: ${toPersianDigits(movie.watchYear || '۱۴۰۳')}</span>
        </div>

        <p class="movie-synopsis-preview">${movie.synopsis || 'بدون خلاصه'}</p>
        ${reviewHtml}
      </div>

      <div class="movie-card-actions">
        <button class="action-btn-small btn-view-card" data-view-id="${movie.id}">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          مشاهده جزئیات
        </button>

        <div style="display: flex; gap: 8px;">
          <button class="action-btn-small btn-edit-card" data-edit-id="${movie.id}" title="ویرایش">
            ✏️
          </button>
          <button class="action-btn-small btn-del-card" data-del-id="${movie.id}" title="حذف">
            🗑️
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openViewModal(movie);
    });

    container.appendChild(card);
  });

  // Action listeners
  container.querySelectorAll('.fav-star-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
    });
  });

  container.querySelectorAll('.btn-view-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const movie = STATE.movies.find(m => m.id === btn.dataset.viewId);
      if (movie) openViewModal(movie);
    });
  });

  container.querySelectorAll('.btn-edit-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const movie = STATE.movies.find(m => m.id === btn.dataset.editId);
      if (movie) openEditModal(movie);
    });
  });

  container.querySelectorAll('.btn-del-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMovie(btn.dataset.delId);
    });
  });
}

// ========================================================
// FILTERS & SEARCH
// ========================================================
function applyFiltersAndSort() {
  const query = (DOM.searchInput.value || '').trim().toLowerCase();
  const watchYearFilter = DOM.filterWatchYear.value;
  const ratingFilter = DOM.filterRating.value;
  const sort = DOM.sortBy.value;
  const genre = STATE.activeGenre;

  DOM.btnClearSearch.style.display = query ? 'block' : 'none';

  let list = [...STATE.movies];

  if (query) {
    list = list.filter(m => {
      const matchTitle = (m.title || '').toLowerCase().includes(query);
      const matchReview = (m.review || '').toLowerCase().includes(query);
      const matchSynopsis = (m.synopsis || '').toLowerCase().includes(query);
      return matchTitle || matchReview || matchSynopsis;
    });
  }

  if (watchYearFilter !== 'all') {
    if (watchYearFilter === 'older') {
      list = list.filter(m => (m.watchYear || 1403) < 1400);
    } else {
      list = list.filter(m => (m.watchYear || '').toString() === watchYearFilter);
    }
  }

  if (ratingFilter !== 'all') {
    if (ratingFilter === 'fav') {
      list = list.filter(m => m.isFavorite);
    } else {
      const minRating = parseFloat(ratingFilter);
      list = list.filter(m => (m.rating || 0) >= minRating);
    }
  }

  if (genre !== 'all') {
    list = list.filter(m => (m.genres || []).some(g => g.includes(genre)));
  }

  list.sort((a, b) => {
    switch (sort) {
      case 'watchDateDesc':
        return (b.watchYear || 0) - (a.watchYear || 0);
      case 'watchDateAsc':
        return (a.watchYear || 0) - (b.watchYear || 0);
      case 'ratingDesc':
        return (b.rating || 0) - (a.rating || 0);
      case 'ratingAsc':
        return (a.rating || 0) - (b.rating || 0);
      case 'releaseYearDesc':
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      case 'releaseYearAsc':
        return (a.releaseYear || 0) - (b.releaseYear || 0);
      case 'titleAsc':
        return (a.title || '').localeCompare(b.title || '', 'fa');
      default:
        return 0;
    }
  });

  STATE.filteredMovies = list;
  renderMovies();
}

function updateStatsSummary() {
  const movies = STATE.movies;
  const total = movies.length;
  DOM.statTotalCount.textContent = toPersianDigits(total);

  if (total === 0) {
    DOM.statAvgRating.textContent = '۰.۰';
    DOM.statThisYearCount.textContent = '۰';
    DOM.statFavoritesCount.textContent = '۰';
    return;
  }

  const sumRating = movies.reduce((acc, m) => acc + (parseFloat(m.rating) || 0), 0);
  const avg = (sumRating / total).toFixed(1);
  DOM.statAvgRating.textContent = toPersianDigits(avg);

  const thisYearCount = movies.filter(m => (m.watchYear || 1403) === 1403).length;
  DOM.statThisYearCount.textContent = toPersianDigits(thisYearCount);

  const favCount = movies.filter(m => m.isFavorite).length;
  DOM.statFavoritesCount.textContent = toPersianDigits(favCount);
}

// ========================================================
// LIVE INTERNET AUTO-FETCH ON TYPING MOVIE NAME
// ========================================================
let searchDebounceTimer = null;

function setupLiveMovieSearch() {
  DOM.movieTitle.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    const q = e.target.value.trim();
    if (!q || q.length < 2) {
      DOM.fetchResultsDropdown.style.display = 'none';
      return;
    }

    // Instant local curated check
    const localMatches = searchLocalMovies(q);
    if (localMatches.length > 0) {
      renderSearchDropdown(localMatches);
    }

    // Debounce live internet search
    searchDebounceTimer = setTimeout(() => {
      fetchMovieFromInternet(q);
    }, 400);
  });

  DOM.btnSearchOnline.addEventListener('click', () => {
    const q = DOM.movieTitle.value.trim();
    if (!q) {
      showToast('لطفاً نام فیلم را وارد کنید.', 'error');
      return;
    }
    fetchMovieFromInternet(q, true);
  });
}

function searchLocalMovies(query) {
  if (!window.CURATED_MOVIES) return [];
  const q = query.toLowerCase();
  return window.CURATED_MOVIES.filter(m => {
    return (m.title && m.title.toLowerCase().includes(q)) ||
           (m.persianTitle && m.persianTitle.toLowerCase().includes(q));
  }).map(m => ({
    title: m.persianTitle || m.title,
    releaseYear: m.releaseYear,
    synopsis: m.synopsis,
    genres: m.genres,
    poster: m.poster
  }));
}

async function fetchMovieFromInternet(query, autoApplyFirst = false) {
  DOM.searchBtnSpinner.style.display = 'inline-block';
  DOM.searchBtnText.style.display = 'none';

  let results = searchLocalMovies(query);

  try {
    if (!IS_STATIC_HOST) {
      const res = await fetch(`/api/search-movie?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length) {
          data.results.forEach(item => {
            if (!results.some(r => r.title?.toLowerCase() === item.title?.toLowerCase())) {
              results.push(item);
            }
          });
        }
      }
    }
  } catch (err) {
    console.log('Search error:', err);
  } finally {
    DOM.searchBtnSpinner.style.display = 'none';
    DOM.searchBtnText.style.display = 'inline';
  }

  if (results.length > 0) {
    renderSearchDropdown(results);
    if (autoApplyFirst) {
      applyMovieDetails(results[0]);
      DOM.fetchResultsDropdown.style.display = 'none';
      showToast(`اطلاعات فیلم «${results[0].title}» از اینترنت دریافت شد!`, 'success');
    }
  } else {
    DOM.fetchResultsDropdown.innerHTML = `
      <div style="padding: 12px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
        اطلاعاتی در اینترنت پیدا نشد؛ می‌توانید خلاصه و سال ساخت را دستی بنویسید.
      </div>
    `;
    DOM.fetchResultsDropdown.style.display = 'block';
  }
}

function renderSearchDropdown(results) {
  const dropdown = DOM.fetchResultsDropdown;
  dropdown.innerHTML = '';
  dropdown.style.display = 'block';

  results.slice(0, 5).forEach(item => {
    const div = document.createElement('div');
    div.className = 'fetch-item';
    const thumb = item.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=60';
    div.innerHTML = `
      <img src="${thumb}" class="fetch-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=60'">
      <div class="fetch-info">
        <span class="fetch-title">${item.title}</span>
        <span class="fetch-meta">سال ساخت: ${item.releaseYear || 'نامشخص'} • ژانر: ${(item.genres || []).join('، ')}</span>
      </div>
    `;
    div.addEventListener('click', () => {
      applyMovieDetails(item);
      dropdown.style.display = 'none';
      showToast(`خلاصه داستان، سال ساخت و پوستر فیلم «${item.title}» خودکار پر شد!`, 'success');
    });
    dropdown.appendChild(div);
  });
}

function applyMovieDetails(data) {
  DOM.movieTitle.value = data.title || '';
  DOM.movieReleaseYear.value = data.releaseYear || 2020;
  DOM.movieSynopsis.value = data.synopsis || '';
  if (data.genres && data.genres.length) {
    DOM.movieGenres.value = Array.isArray(data.genres) ? data.genres.join('، ') : data.genres;
  }
  if (data.poster) {
    DOM.moviePoster.value = data.poster;
    updatePosterPreview(data.poster);
  }
}

function updatePosterPreview(url) {
  if (url && url.trim()) {
    DOM.posterPreviewImg.src = url.trim();
    DOM.posterPreviewImg.style.display = 'block';
    DOM.posterPlaceholderText.style.display = 'none';
  } else {
    DOM.posterPreviewImg.style.display = 'none';
    DOM.posterPlaceholderText.style.display = 'block';
  }
}

// ========================================================
// RATING SYSTEM ONLY VIA CLICKABLE STARS
// ========================================================
function setupStarRating() {
  const container = DOM.starRatingContainer;
  container.innerHTML = '';

  for (let i = 1; i <= 10; i++) {
    const star = document.createElement('span');
    star.className = 'star-interactive';
    star.textContent = '★';
    star.dataset.score = i;
    star.title = `${i} ستاره`;

    star.addEventListener('mouseenter', () => updateStarDisplay(i));
    star.addEventListener('mouseleave', () => updateStarDisplay(STATE.currentRating));
    star.addEventListener('click', () => {
      setRating(i);
    });

    container.appendChild(star);
  }

  setRating(9);
}

function setRating(score) {
  STATE.currentRating = score;
  updateStarDisplay(score);
  DOM.ratingDisplayBadge.textContent = `★ ${score} / ۱۰`;
}

function updateStarDisplay(score) {
  const stars = DOM.starRatingContainer.querySelectorAll('.star-interactive');
  stars.forEach((star, idx) => {
    if (idx < score) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// ========================================================
// MODAL CONTROLS & SUBMIT
// ========================================================
function openAddModal() {
  if (!STATE.user) {
    showToast('برای ثبت فیلم، لطفاً ابتدا وارد حساب کاربری خود شوید یا حساب جدید بسازید.', 'info');
    DOM.authModal.classList.add('open');
    return;
  }
  STATE.isEditMode = false;
  DOM.editMovieId.value = '';
  DOM.movieModalTitle.textContent = 'ثبت فیلم در تاریخچه';
  DOM.btnSubmitMovieText.textContent = 'ذخیره در تاریخچه';
  DOM.movieForm.reset();

  DOM.movieWatchYear.value = 1403;
  setRating(9);
  updatePosterPreview('');
  DOM.fetchResultsDropdown.style.display = 'none';

  DOM.movieModal.classList.add('open');
  DOM.movieTitle.focus();
}

function openEditModal(movie) {
  STATE.isEditMode = true;
  DOM.editMovieId.value = movie.id;
  DOM.movieModalTitle.textContent = 'ویرایش فیلم';
  DOM.btnSubmitMovieText.textContent = 'ذخیره تغییرات';

  DOM.movieTitle.value = movie.title || '';
  DOM.movieReleaseYear.value = movie.releaseYear || 2020;
  DOM.movieWatchYear.value = movie.watchYear || 1403;
  DOM.movieGenres.value = (movie.genres || []).join('، ');
  DOM.movieSynopsis.value = movie.synopsis || '';
  DOM.moviePoster.value = movie.poster || '';
  DOM.movieReview.value = movie.review || '';
  DOM.movieIsFavorite.checked = !!movie.isFavorite;

  setRating(movie.rating || 9);
  updatePosterPreview(movie.poster);

  DOM.movieModal.classList.add('open');
}

function closeMovieModal() {
  DOM.movieModal.classList.remove('open');
  DOM.fetchResultsDropdown.style.display = 'none';
}

async function handleMovieFormSubmit(e) {
  e.preventDefault();

  const title = DOM.movieTitle.value.trim();
  const releaseYear = parseInt(DOM.movieReleaseYear.value) || 2020;
  const watchYear = parseInt(DOM.movieWatchYear.value) || 1403;
  const synopsis = DOM.movieSynopsis.value.trim();
  const genresStr = DOM.movieGenres.value.trim();
  const genres = genresStr ? genresStr.split(/[,،]+/).map(g => g.trim()).filter(Boolean) : ['سینما'];
  const rating = STATE.currentRating;
  const poster = DOM.moviePoster.value.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
  const review = DOM.movieReview.value.trim();
  const isFavorite = DOM.movieIsFavorite.checked;

  const payload = {
    title,
    releaseYear,
    watchYear,
    synopsis,
    genres,
    rating,
    poster,
    review,
    isFavorite
  };

  try {
    if (STATE.isEditMode) {
      const id = DOM.editMovieId.value;
      try {
        await apiCall(`/api/movies/${id}`, 'PUT', payload);
      } catch (err) {
        const idx = STATE.movies.findIndex(m => m.id === id);
        if (idx !== -1) {
          STATE.movies[idx] = { ...STATE.movies[idx], ...payload };
          saveLocalMovies();
        }
      }
      showToast('مشخصات فیلم با موفقیت ویرایش شد.', 'success');
    } else {
      try {
        await apiCall('/api/movies', 'POST', payload);
      } catch (err) {
        const newMovie = {
          id: 'mov-local-' + Date.now(),
          userId: STATE.user?.id || 'local-1',
          ...payload,
          createdAt: new Date().toISOString()
        };
        STATE.movies.unshift(newMovie);
        saveLocalMovies();
      }
      showToast(`فیلم «${title}» با موفقیت در تاریخچه ذخیره شد!`, 'success');
    }

    closeMovieModal();
    await loadMovies();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ========================================================
// VIEW DETAILS MODAL
// ========================================================
function openViewModal(movie) {
  STATE.selectedMovieForView = movie;

  DOM.viewModalHero.style.backgroundImage = `url('${movie.poster || ''}')`;
  DOM.viewPosterImg.src = movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
  DOM.viewFavoriteBadge.style.display = movie.isFavorite ? 'block' : 'none';

  DOM.viewReleaseYearBadge.textContent = `سال ساخت: ${movie.releaseYear || 'نامشخص'}`;
  DOM.viewWatchYearBadge.textContent = `سالی که دیدم: ${toPersianDigits(movie.watchYear || '۱۴۰۳')}`;
  DOM.viewMovieTitle.textContent = movie.title;

  DOM.viewGenresContainer.innerHTML = (movie.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('');

  DOM.viewRatingNumber.textContent = movie.rating;
  const numStars = Math.round(movie.rating || 0);
  DOM.viewStarsContainer.textContent = '★'.repeat(numStars) + '☆'.repeat(10 - numStars);
  DOM.viewRatingDescriptor.textContent = RATING_DESCRIPTORS[movie.rating] || `${movie.rating} از ۱۰`;

  DOM.viewSynopsis.textContent = movie.synopsis || 'خلاصه داستانی ثبت نشده است.';

  if (movie.review) {
    DOM.viewReviewSection.style.display = 'flex';
    DOM.viewReviewText.textContent = `"${movie.review}"`;
  } else {
    DOM.viewReviewSection.style.display = 'none';
  }

  DOM.viewModal.classList.add('open');
}

function closeViewModal() {
  DOM.viewModal.classList.remove('open');
}

// ========================================================
// FAVORITE & DELETE
// ========================================================
async function toggleFavorite(id) {
  const movie = STATE.movies.find(m => m.id === id);
  if (!movie) return;

  const newFavState = !movie.isFavorite;
  movie.isFavorite = newFavState;

  try {
    await apiCall(`/api/movies/${id}`, 'PUT', { isFavorite: newFavState });
  } catch (e) {
    saveLocalMovies();
  }

  showToast(newFavState ? `«${movie.title}» به برگزیده‌ها اضافه شد.` : 'از برگزیده‌ها حذف شد.', 'info');
  applyFiltersAndSort();
  updateStatsSummary();
}

async function deleteMovie(id) {
  const movie = STATE.movies.find(m => m.id === id);
  const title = movie ? movie.title : 'این فیلم';

  if (!confirm(`آیا از حذف فیلم «${title}» از تاریخچه مطمئن هستید؟`)) {
    return;
  }

  try {
    await apiCall(`/api/movies/${id}`, 'DELETE');
  } catch (e) {
    STATE.movies = STATE.movies.filter(m => m.id !== id);
    saveLocalMovies();
  }

  showToast(`فیلم «${title}» از تاریخچه حذف شد.`, 'info');
  closeViewModal();
  await loadMovies();
}

// ========================================================
// AUTH MODAL
// ========================================================
function setupAuthModal() {
  async function loadQuickSavedAccount() {
    if (!DOM.quickSavedAccountBar) return;
    try {
      const data = await apiCall('/api/google-accounts');
      const accounts = data.accounts || [];
      if (accounts.length > 0) {
        const primary = accounts[0];
        DOM.quickSavedAccountBar.style.display = 'block';
        DOM.quickSavedAccountBar.innerHTML = `
          <button type="button" class="quick-account-btn full-width" id="btnQuickAccountLogin">
            <span class="quick-account-avatar">${primary.avatar || '🪐'}</span>
            <div class="quick-account-text">
              <span class="quick-account-title">ورود با ۱ کلیک: <strong>${escapeHTML(primary.name || primary.username)}</strong></span>
              <span class="quick-account-email">${escapeHTML(primary.email || primary.username)}</span>
            </div>
            <span class="quick-account-arrow">➔</span>
          </button>
        `;
        document.getElementById('btnQuickAccountLogin')?.addEventListener('click', async () => {
          await executeDirectGoogleLogin(primary.email || primary.username, primary.name);
        });
      } else {
        DOM.quickSavedAccountBar.style.display = 'none';
      }
    } catch (e) {
      if (DOM.quickSavedAccountBar) DOM.quickSavedAccountBar.style.display = 'none';
    }
  }

  DOM.userProfileBtn.addEventListener('click', async () => {
    updateUserUI();
    DOM.authModal.classList.add('open');
    if (!STATE.user) {
      await loadQuickSavedAccount();
    }
  });

  DOM.btnCloseAuthModal.addEventListener('click', () => {
    DOM.authModal.classList.remove('open');
  });

  DOM.tabLogin.addEventListener('click', () => {
    DOM.tabLogin.classList.add('active');
    DOM.tabRegister.classList.remove('active');
    DOM.loginForm.style.display = 'block';
    DOM.registerForm.style.display = 'none';
  });

  DOM.tabRegister.addEventListener('click', () => {
    DOM.tabRegister.classList.add('active');
    DOM.tabLogin.classList.remove('active');
    DOM.loginForm.style.display = 'none';
    DOM.registerForm.style.display = 'block';
  });

  DOM.avatarPickerGrid.querySelectorAll('.avatar-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.avatarPickerGrid.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = DOM.loginUsername.value.trim();
    const password = DOM.loginPassword.value.trim();

    if (!username) {
      showToast('لطفاً نام کاربری یا آدرس ایمیل را وارد کنید.', 'error');
      return;
    }

    // Direct passwordless sign-in if email entered without password
    if (username.includes('@') && !password) {
      await executeDirectGoogleLogin(username);
      return;
    }

    try {
      const data = await apiCall('/api/login', 'POST', { username, password });
      STATE.token = data.token;
      STATE.user = data.user;
      localStorage.setItem('cinelog_token', data.token);
      updateUserUI();
      DOM.authModal.classList.remove('open');
      showToast(`خوش آمدید، ${STATE.user.name}! 🎬`, 'success');
      await loadMovies();
    } catch (err) {
      // If error occurred and input is an email, seamlessly fall back to email login
      if (username.includes('@')) {
        showToast('ورود با ایمیل در حال پردازش...', 'info');
        await executeDirectGoogleLogin(username);
      } else {
        showToast(err.message, 'error');
      }
    }
  });

  DOM.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = DOM.regName.value.trim();
    const email = DOM.regEmail ? DOM.regEmail.value.trim() : '';
    const username = DOM.regUsername.value.trim();
    const password = DOM.regPassword.value.trim();
    const activeAvatar = DOM.avatarPickerGrid.querySelector('.avatar-opt.active')?.dataset.avatar || '🎬';

    try {
      const data = await apiCall('/api/register', 'POST', {
        name,
        email,
        username,
        password,
        avatar: activeAvatar
      });
      STATE.token = data.token;
      STATE.user = data.user;
      localStorage.setItem('cinelog_token', data.token);
      updateUserUI();
      DOM.authModal.classList.remove('open');
      showToast(`حساب شما با موفقیت ساخته شد! خوش آمدید، ${STATE.user.name}.`, 'success');
      await loadMovies();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // HTML escape helper
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Direct Google Login Executor
  async function executeDirectGoogleLogin(email, name = '') {
    if (!email || !email.trim()) {
      showToast('لطفاً ایمیل جیمیل خود را وارد کنید.', 'error');
      return;
    }

    let cleanEmail = email.trim();
    if (!cleanEmail.includes('@')) {
      cleanEmail = cleanEmail + '@gmail.com';
    }

    try {
      showToast('در حال بررسی و ورود با حساب گوگل...', 'info');
      const data = await apiCall('/api/google-login', 'POST', {
        email: cleanEmail,
        name: name ? name.trim() : undefined
      });

      STATE.token = data.token;
      STATE.user = data.user;
      localStorage.setItem('cinelog_token', data.token);
      updateUserUI();
      DOM.authModal.classList.remove('open');
      showToast(`با حساب گوگل با موفقیت وارد شدید! خوش آمدید، ${STATE.user.name || STATE.user.username} 🎬`, 'success');
      await loadMovies();
    } catch (err) {
      showToast(err.message || 'خطا در ورود با گوگل', 'error');
    }
  }

  // Render & setup Google Auth View
  async function renderGoogleAuthView() {
    // 1. Fetch available accounts from /api/google-accounts
    try {
      const data = await apiCall('/api/google-accounts');
      const accounts = data.accounts || [];
      if (accounts.length > 0) {
        DOM.googleSavedAccountsSection.style.display = 'block';
        DOM.googleSavedAccountsList.innerHTML = accounts.map(acc => `
          <div class="google-account-card" data-email="${escapeHTML(acc.email || acc.username)}" data-name="${escapeHTML(acc.name || acc.username)}">
            <div class="google-account-user-info">
              <div class="google-account-avatar">${acc.avatar || '🎬'}</div>
              <div class="google-account-details">
                <span class="google-account-name">${escapeHTML(acc.name || acc.username)}</span>
                <span class="google-account-email">${escapeHTML(acc.email || acc.username)}</span>
              </div>
            </div>
            <div class="google-account-btn-badge">ورود سریع ➔</div>
          </div>
        `).join('');

        DOM.googleSavedAccountsList.querySelectorAll('.google-account-card').forEach(card => {
          card.addEventListener('click', async () => {
            const email = card.dataset.email;
            const name = card.dataset.name;
            await executeDirectGoogleLogin(email, name);
          });
        });
      } else {
        DOM.googleSavedAccountsSection.style.display = 'none';
      }
    } catch (e) {
      console.warn('Failed to load google accounts:', e);
      if (DOM.googleSavedAccountsSection) {
        DOM.googleSavedAccountsSection.style.display = 'none';
      }
    }

    // 2. Fetch Google Client ID and configure official Google button if available
    let clientId = localStorage.getItem('cinelog_google_client_id') || '';
    try {
      const cfg = await apiCall('/api/google-config');
      if (cfg && cfg.clientId && !clientId) {
        clientId = cfg.clientId;
      }
    } catch (e) {}

    if (DOM.googleClientIdInput) {
      DOM.googleClientIdInput.value = clientId;
    }

    if (clientId && window.google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleCredentialResponse,
          auto_select: false
        });
        if (DOM.googleOfficialSection) {
          DOM.googleOfficialSection.style.display = 'block';
          DOM.googleOfficialButtonContainer.innerHTML = '';
          google.accounts.id.renderButton(DOM.googleOfficialButtonContainer, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 320
          });
          google.accounts.id.prompt();
        }
      } catch (err) {
        console.warn('Google Identity Services Init:', err);
        if (DOM.googleOfficialSection) DOM.googleOfficialSection.style.display = 'none';
      }
    } else {
      if (DOM.googleOfficialSection) DOM.googleOfficialSection.style.display = 'none';
    }

    // Focus email input
    if (DOM.googleDirectEmail) {
      setTimeout(() => DOM.googleDirectEmail.focus(), 80);
    }
  }

  // Google Login Navigation Handlers
  if (DOM.btnGoogleLogin) {
    DOM.btnGoogleLogin.addEventListener('click', async () => {
      DOM.authFormView.style.display = 'none';
      DOM.authGoogleView.style.display = 'block';
      await renderGoogleAuthView();
    });
  }

  if (DOM.btnBackFromGoogle) {
    DOM.btnBackFromGoogle.addEventListener('click', () => {
      DOM.authGoogleView.style.display = 'none';
      DOM.authFormView.style.display = 'block';
    });
  }

  // Direct Google / Gmail form submission
  if (DOM.googleDirectForm) {
    DOM.googleDirectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = DOM.googleDirectEmail.value.trim();
      const name = DOM.googleDirectName.value.trim();
      await executeDirectGoogleLogin(email, name);
    });
  }

  // Advanced Google Client ID panel toggles
  if (DOM.btnToggleGoogleAdvanced && DOM.googleAdvancedPanel) {
    DOM.btnToggleGoogleAdvanced.addEventListener('click', () => {
      const isHidden = DOM.googleAdvancedPanel.style.display === 'none';
      DOM.googleAdvancedPanel.style.display = isHidden ? 'block' : 'none';
    });
  }

  if (DOM.btnSaveGoogleClientId) {
    DOM.btnSaveGoogleClientId.addEventListener('click', async () => {
      const id = (DOM.googleClientIdInput.value || '').trim();
      if (!id) {
        showToast('شناسه Client ID نباید خالی باشد.', 'error');
        return;
      }
      localStorage.setItem('cinelog_google_client_id', id);
      try {
        await apiCall('/api/google-config', 'POST', { clientId: id });
      } catch (e) {}
      showToast('شناسه Client ID با موفقیت ذخیره شد.', 'success');
      await renderGoogleAuthView();
    });
  }

  if (DOM.btnClearGoogleClientId) {
    DOM.btnClearGoogleClientId.addEventListener('click', async () => {
      localStorage.removeItem('cinelog_google_client_id');
      if (DOM.googleClientIdInput) DOM.googleClientIdInput.value = '';
      try {
        await apiCall('/api/google-config', 'POST', { clientId: '' });
      } catch (e) {}
      if (DOM.googleOfficialSection) DOM.googleOfficialSection.style.display = 'none';
      showToast('شناسه Client ID حذف شد.', 'info');
    });
  }

  DOM.btnSwitchAccount.addEventListener('click', () => {
    DOM.authLoggedInView.style.display = 'none';
    DOM.authFormView.style.display = 'block';
    if (DOM.authGoogleView) DOM.authGoogleView.style.display = 'none';
  });

  DOM.btnLogout.addEventListener('click', async () => {
    try {
      await apiCall('/api/logout', 'POST');
    } catch (e) {}

    STATE.token = '';
    STATE.user = null;
    localStorage.removeItem('cinelog_token');
    localStorage.removeItem('cinelog_local_user');
    updateUserUI();
    showToast('از حساب خارج شدید.', 'info');
    await loadMovies();
  });
}

// Google Identity Services Credential Handler
window.handleGoogleCredentialResponse = async function(response) {
  try {
    showToast('در حال تایید ورود با سرورهای گوگل...', 'info');
    const data = await apiCall('/api/google-login', 'POST', { credential: response.credential });
    STATE.token = data.token;
    STATE.user = data.user;
    localStorage.setItem('cinelog_token', data.token);
    updateUserUI();
    DOM.authModal.classList.remove('open');
    showToast(`با حساب گوگل با موفقیت وارد شدید! خوش آمدید، ${STATE.user.name || STATE.user.username} 🎬`, 'success');
    await loadMovies();
  } catch (err) {
    showToast(err.message || 'خطا در ورود با گوگل', 'error');
  }
};

// ========================================================
// STATS & CHARTS MODAL
// ========================================================
function openStatsModal() {
  const movies = STATE.movies;

  const ratingBuckets = { '۱۰ ستاره (شاهکار)': 0, '۹ ستاره (عالی)': 0, '۸ ستاره (خیلی خوب)': 0, '۷ ستاره (خوب)': 0, 'کمتر از ۷ ستاره': 0 };
  movies.forEach(m => {
    const r = m.rating || 0;
    if (r >= 10) ratingBuckets['۱۰ ستاره (شاهکار)']++;
    else if (r >= 9) ratingBuckets['۹ ستاره (عالی)']++;
    else if (r >= 8) ratingBuckets['۸ ستاره (خیلی خوب)']++;
    else if (r >= 7) ratingBuckets['۷ ستاره (خوب)']++;
    else ratingBuckets['کمتر از ۷ ستاره']++;
  });

  const maxRatingCount = Math.max(...Object.values(ratingBuckets), 1);
  DOM.ratingBarsContainer.innerHTML = Object.entries(ratingBuckets).map(([label, count]) => {
    const pct = ((count / maxRatingCount) * 100).toFixed(0);
    return `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${label}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="chart-bar-count">${toPersianDigits(count)}</span>
      </div>
    `;
  }).join('');

  const yearCounts = {};
  movies.forEach(m => {
    const y = m.watchYear || 'نامشخص';
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  const sortedYears = Object.entries(yearCounts).sort((a, b) => b[0] - a[0]);
  const maxYearCount = Math.max(...Object.values(yearCounts), 1);
  DOM.yearsBarsContainer.innerHTML = sortedYears.map(([year, count]) => {
    const pct = ((count / maxYearCount) * 100).toFixed(0);
    return `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${toPersianDigits(year)}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, #8b5cf6, #c084fc)"></div>
        </div>
        <span class="chart-bar-count">${toPersianDigits(count)}</span>
      </div>
    `;
  }).join('');

  const genreCounts = {};
  movies.forEach(m => {
    (m.genres || []).forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  DOM.topGenresContainer.innerHTML = sortedGenres.map(([g, count]) => {
    return `<div class="genre-cloud-chip">${g} <span>(${toPersianDigits(count)})</span></div>`;
  }).join('');

  DOM.statsModal.classList.add('open');
}

// ========================================================
// BACKUP / EXPORT
// ========================================================
function exportDataBackup() {
  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    user: STATE.user,
    moviesCount: STATE.movies.length,
    movies: STATE.movies
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cinelog-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('فایل پشتیبان JSON دانلود شد.', 'success');
}

// ========================================================
// EVENT LISTENERS
// ========================================================
function setupEventListeners() {
  DOM.btnOpenAddMovie.addEventListener('click', openAddModal);
  DOM.btnEmptyAdd.addEventListener('click', openAddModal);
  DOM.btnCloseMovieModal.addEventListener('click', closeMovieModal);
  DOM.btnCancelMovieModal.addEventListener('click', closeMovieModal);
  DOM.movieForm.addEventListener('submit', handleMovieFormSubmit);

  [DOM.movieModal, DOM.viewModal, DOM.authModal, DOM.statsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  DOM.btnCloseViewModal.addEventListener('click', closeViewModal);
  DOM.btnViewEdit.addEventListener('click', () => {
    closeViewModal();
    if (STATE.selectedMovieForView) openEditModal(STATE.selectedMovieForView);
  });
  DOM.btnViewDelete.addEventListener('click', () => {
    if (STATE.selectedMovieForView) deleteMovie(STATE.selectedMovieForView.id);
  });

  DOM.moviePoster.addEventListener('input', (e) => {
    updatePosterPreview(e.target.value);
  });

  DOM.searchInput.addEventListener('input', applyFiltersAndSort);
  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    applyFiltersAndSort();
  });
  DOM.filterWatchYear.addEventListener('change', applyFiltersAndSort);
  DOM.filterRating.addEventListener('change', applyFiltersAndSort);
  DOM.sortBy.addEventListener('change', applyFiltersAndSort);

  DOM.btnViewGrid.addEventListener('click', () => {
    STATE.viewMode = 'grid';
    DOM.btnViewGrid.classList.add('active');
    DOM.btnViewList.classList.remove('active');
    DOM.moviesContainer.className = 'movies-grid';
  });

  DOM.btnViewList.addEventListener('click', () => {
    STATE.viewMode = 'list';
    DOM.btnViewList.classList.add('active');
    DOM.btnViewGrid.classList.remove('active');
    DOM.moviesContainer.className = 'movies-grid list-view';
  });

  DOM.genrePillsContainer.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.genrePillsContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.activeGenre = pill.dataset.genre;
      applyFiltersAndSort();
    });
  });

  DOM.btnOpenStats.addEventListener('click', openStatsModal);
  DOM.btnCloseStatsModal.addEventListener('click', () => DOM.statsModal.classList.remove('open'));
  DOM.btnExportData.addEventListener('click', exportDataBackup);

  if (DOM.btnCreateDesktopShortcut) {
    DOM.btnCreateDesktopShortcut.addEventListener('click', async () => {
      try {
        const res = await apiCall('/api/create-desktop-shortcut', 'POST');
        showToast('آیکون و شورتکات سینما لاگ با موفقیت روی دسک‌تاپ ساخته شد! 🎬', 'success');
      } catch (err) {
        showToast('خطا در ساخت آیکون دسک‌تاپ: ' + err.message, 'error');
      }
    });
  }
}

// ========================================================
// INITIALIZE
// ========================================================
window.addEventListener('DOMContentLoaded', async () => {
  setupStarRating();
  setupLiveMovieSearch();
  setupAuthModal();
  setupEventListeners();
  await initAuth();
});
