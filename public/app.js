// ========================================================
// CINELOG - APPLICATION CONTROLLER (REFINED VERSION)
// ========================================================

// Clean up initial sample movies so the user starts with a completely empty movie list
(function cleanInitialSampleMovies() {
  try {
    const cleanList = (key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(m => !m.id || !m.id.startsWith('mov-init-'));
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    };
    cleanList('cinelog_movies');
    cleanList('cinelog_local_movies');

    if (!localStorage.getItem('cinelog_movies_cleared_v2')) {
      localStorage.setItem('cinelog_movies', JSON.stringify([]));
      localStorage.setItem('cinelog_local_movies', JSON.stringify([]));
      localStorage.setItem('cinelog_movies_cleared_v2', 'true');
    }
  } catch (e) {}
})();

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
  btnClearAllMovies: document.getElementById('btnClearAllMovies'),

  // Stats
  statTotalCount: document.getElementById('statTotalCount'),
  statAvgRating: document.getElementById('statAvgRating'),
  statThisYearCount: document.getElementById('statThisYearCount'),
  statFavoritesCount: document.getElementById('statFavoritesCount'),

  // Toolbar
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  filterMediaType: document.getElementById('filterMediaType'),
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
  mediaTypeRadios: document.getElementById('mediaTypeRadios'),
  radioTypeMovie: document.getElementById('radioTypeMovie'),
  radioTypeSeries: document.getElementById('radioTypeSeries'),
  labelTypeMovie: document.getElementById('labelTypeMovie'),
  labelTypeSeries: document.getElementById('labelTypeSeries'),
  genreChipsContainer: document.getElementById('genreChipsContainer'),
  selectedGenresCounter: document.getElementById('selectedGenresCounter'),
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

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    const { username, password } = body || {};
    if (!username || !username.trim()) {
      throw new Error('لطفاً نام کاربری یا ایمیل خود را وارد کنید.');
    }
    if (!password || !password.trim()) {
      throw new Error('لطفاً رمز عبور خود را وارد کنید.');
    }
    const cleanUser = username.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem('cinelog_users') || '[]');
    let user = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanUser) ||
      (u.email && u.email.toLowerCase() === cleanUser)
    );

    if (!user) {
      throw new Error('کاربری با این مشخصات یافت نشد. لطفاً ابتدا از تب ثبت‌نام حساب بسازید.');
    }

    if (user.password && user.password !== password) {
      throw new Error('رمز عبور وارد شده نادرست است.');
    }

    const token = 'local-token-' + Date.now();
    localStorage.setItem('cinelog_token', token);
    localStorage.setItem('cinelog_user', JSON.stringify(user));
    return { token, user };
  }

  // POST /api/register
  if (cleanEndpoint === '/api/register' && method === 'POST') {
    const { name, username, email, password, avatar } = body || {};
    if (!username || !username.trim()) {
      throw new Error('وارد کردن نام کاربری الزامی است.');
    }
    if (!password || password.length < 4) {
      throw new Error('رمز عبور باید حداقل ۴ کاراکتر باشد.');
    }
    const cleanUser = username.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem('cinelog_users') || '[]');
    if (users.some(u => u.username?.toLowerCase() === cleanUser)) {
      throw new Error('این نام کاربری قبلاً ثبت شده است. لطفاً نام دیگری انتخاب کنید.');
    }
    const user = {
      id: 'usr-' + Date.now(),
      name: name || username,
      username: username.trim(),
      email: (email || '').trim(),
      password: password,
      avatar: avatar || '🎬',
      bio: 'دفترچه خاطرات سینمایی من'
    };
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

  // DELETE /api/movies/:id (Single)
  if (cleanEndpoint.startsWith('/api/movies/') && method === 'DELETE') {
    const id = cleanEndpoint.replace('/api/movies/', '');
    let movies = JSON.parse(localStorage.getItem('cinelog_movies') || '[]');
    movies = movies.filter(m => m.id !== id);
    localStorage.setItem('cinelog_movies', JSON.stringify(movies));
    return { success: true };
  }

  // DELETE /api/movies (Delete all)
  if (cleanEndpoint === '/api/movies' && method === 'DELETE') {
    localStorage.setItem('cinelog_movies', JSON.stringify([]));
    localStorage.setItem('cinelog_local_movies', JSON.stringify([]));
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
            <span class="badge badge-year">${movie.releaseYear || ''}</span>
            <span class="badge badge-type">${movie.mediaType === 'series' ? '📺 سریال' : '🎬 فیلم'}</span>
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
  const mediaTypeFilter = DOM.filterMediaType ? DOM.filterMediaType.value : 'all';
  const watchYearFilter = DOM.filterWatchYear.value;
  const ratingFilter = DOM.filterRating.value;
  const sort = DOM.sortBy.value;
  const genre = STATE.activeGenre;

  DOM.btnClearSearch.style.display = query ? 'block' : 'none';

  let list = [...STATE.movies];

  if (mediaTypeFilter !== 'all') {
    list = list.filter(m => (m.mediaType || 'movie') === mediaTypeFilter);
  }

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

function getCurrentShamsiYear() {
  try {
    const formatted = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(new Date());
    const year = parseInt(formatted.replace(/[^0-9]/g, ''));
    if (year >= 1390 && year <= 1450) return year;
  } catch (e) {}
  const gYear = new Date().getFullYear();
  return gYear - 621;
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

  const currentSYear = getCurrentShamsiYear();
  const thisYearCount = movies.filter(m => (m.watchYear || currentSYear) === currentSYear).length;
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
    }, 350);
  });

  // Pressing Enter in title input triggers immediate search rather than premature form submit
  DOM.movieTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = DOM.movieTitle.value.trim();
      if (q) {
        fetchMovieFromInternet(q, true);
      }
    }
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
  const q = query.toLowerCase().trim();
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

// Direct client-side movie search for GitHub Pages (and offline/static host support)
async function searchMoviesOnlineDirect(query) {
  const q = query.trim();
  if (!q) return [];
  const cleanQ = q.toLowerCase();
  const isFarsi = /[\u0600-\u06FF]/.test(q);
  const results = [];

  function toEnDigits(str) {
    return (str || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  function extractYear(desc, extract) {
    const text = toEnDigits((desc || '') + ' ' + (extract || ''));
    const exp = text.match(/(?:محصول|سال|اکران|منتشر(?:[\s\w‌]+)?)\s*(?:سال\s*)?(\d{4})/);
    if (exp) return parseInt(exp[1]);
    const dYear = toEnDigits(desc || '').match(/\b(13\d\d|14\d\d|19\d\d|20\d\d)\b/);
    if (dYear) return parseInt(dYear[1]);
    const m = text.match(/\b(13\d\d|14\d\d|19\d\d|20\d\d)\b/);
    return m ? parseInt(m[1]) : 2024;
  }

  function matchesQuery(title) {
    if (!title) return false;
    const cleanWord = cleanQ.replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
    const cleanT = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
    return cleanT.includes(cleanWord) || cleanWord.includes(cleanT.slice(0, 3));
  }

  // 1. IMDb Suggestions (Gold standard for exact movie title autocomplete)
  const cleanLatin = cleanQ.replace(/[^a-z0-9]/g, '');
  if (cleanLatin.length >= 2) {
    try {
      const imdbUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://v3.sg.media-imdb.com/suggestion/' + cleanLatin[0] + '/' + cleanLatin + '.json');
      const data = await fetch(imdbUrl, { signal: AbortSignal.timeout(3500) }).then(r => r.json());
      for (const it of (data?.d || [])) {
        if (it.qid === 'movie' || it.q === 'feature' || it.qid === 'tvSeries') {
          if (matchesQuery(it.l)) {
            const isSeries = it.qid === 'tvSeries' || it.q === 'TV series';
            results.push({
              title: it.l,
              releaseYear: it.y || new Date().getFullYear(),
              synopsis: '',
              poster: it.i?.imageUrl || '',
              mediaType: isSeries ? 'series' : 'movie',
              genres: [isSeries ? 'سریال' : 'درام']
            });
          }
        }
      }
    } catch (e) {}
  }

  // 2. Wikipedia OpenSearch (Title prefix search on Persian & English Wikipedia)
  if (results.length < 4) {
    const domain = isFarsi ? 'fa.wikipedia.org' : 'en.wikipedia.org';
    try {
      const opUrl = `https://${domain}/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=10&format=json&origin=*`;
      const opData = await fetch(opUrl, { signal: AbortSignal.timeout(3500) }).then(r => r.json());
      const titles = (opData[1] || []).filter(matchesQuery);
      for (const t of titles.slice(0, 4)) {
        try {
          const sumUrl = `https://${domain}/api/rest_v1/page/summary/${encodeURIComponent(t)}`;
          const s = await fetch(sumUrl, { signal: AbortSignal.timeout(2500) }).then(r => r.json());
          const isSeries = (s.description || '').includes('مجموعه تلویزیونی') || 
                           (s.description || '').toLowerCase().includes('television series') ||
                           t.includes('مجموعه تلویزیونی') || t.includes('(TV series)');
          const isFilm = isSeries || t.includes('فیلم') || t.includes('(film)') || 
                         (s.description || '').includes('فیلم') || 
                         (s.description || '').toLowerCase().includes('film') || 
                         (s.extract || '').includes('فیلم') || 
                         (s.extract || '').toLowerCase().includes('directed by');
          if (isFilm && s.type !== 'disambiguation') {
            const cleanTitle = s.title.replace(/\s*\(.*(فیلم|film|مجموعه تلویزیونی|tv series).*\)/i, '').trim();
            if (!results.some(r => r.title.toLowerCase() === cleanTitle.toLowerCase())) {
              const yMatch = extractYear(s.description, s.extract);
              const foundGenres = [];
              const fullText = ((s.description || '') + ' ' + (s.extract || '')).toLowerCase();
              if (/کمدی|comedy/.test(fullText)) foundGenres.push('کمدی');
              if (/اکشن|action/.test(fullText)) foundGenres.push('اکشن');
              if (/جنایی|crime/.test(fullText)) foundGenres.push('جنایی');
              if (/علمی[ -]تخیلی|sci-fi/.test(fullText)) foundGenres.push('علمی‌تخیلی');
              if (/وحشت|ترسناک|horror/.test(fullText)) foundGenres.push('وحشت');
              if (/هیجان|thriller/.test(fullText)) foundGenres.push('هیجان‌انگیز');
              if (/انیمیشن|animation/.test(fullText)) foundGenres.push('انیمیشن');
              if (/معمایی|mystery/.test(fullText)) foundGenres.push('معمایی');
              if (/ماجراجویی|adventure/.test(fullText)) foundGenres.push('ماجراجویی');
              if (/عاشقانه|romance/.test(fullText)) foundGenres.push('عاشقانه');
              if (/فانتزی|fantasy/.test(fullText)) foundGenres.push('فانتزی');
              if (/درام|drama/.test(fullText)) foundGenres.push('درام');
              if (foundGenres.length === 0) foundGenres.push(isSeries ? 'سریال' : 'درام');

              results.push({
                title: cleanTitle,
                releaseYear: yMatch || new Date().getFullYear(),
                synopsis: '',
                poster: s.thumbnail?.source || '',
                mediaType: isSeries ? 'series' : 'movie',
                genres: foundGenres
              });
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  return results;
}

async function fetchMovieFromInternet(query, autoApplyFirst = false) {
  DOM.searchBtnSpinner.style.display = 'inline-block';
  DOM.searchBtnText.style.display = 'none';

  let results = searchLocalMovies(query);

  try {
    // If not static host, try local backend search API first
    if (!IS_STATIC_HOST) {
      try {
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
      } catch (err) {}
    }

    // If static host (GitHub Pages) or local backend returned few/no results, run direct client search!
    if (results.length === 0 || IS_STATIC_HOST) {
      const onlineResults = await searchMoviesOnlineDirect(query);
      onlineResults.forEach(item => {
        if (!results.some(r => r.title?.toLowerCase() === item.title?.toLowerCase())) {
          results.push(item);
        }
      });
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
      showToast(`فیلم «${results[0].title}» و سال ساخت (${results[0].releaseYear || 'نامشخص'}) خودکار بارگذاری شد!`, 'success');
    }
  } else {
    // Hide the dropdown completely so it never blocks or covers form inputs!
    DOM.fetchResultsDropdown.style.display = 'none';
    DOM.fetchResultsDropdown.innerHTML = '';
    if (autoApplyFirst) {
      showToast('فیلمی در اینترنت با این نام پیدا نشد؛ می‌توانید مشخصات و سال ساخت را دستی بنویسید.', 'info');
    }
  }
}

function renderSearchDropdown(results) {
  const dropdown = DOM.fetchResultsDropdown;
  dropdown.innerHTML = '';
  dropdown.style.display = 'block';

  // Dropdown header with close button
  const header = document.createElement('div');
  header.className = 'fetch-dropdown-header';
  header.innerHTML = `
    <span class="fetch-header-title">نتایج جستجو (${results.length} فیلم پیشنهادی):</span>
    <button type="button" class="btn-close-fetch" title="بستن این لیست">✕</button>
  `;
  header.querySelector('.btn-close-fetch').addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = 'none';
  });
  dropdown.appendChild(header);

  results.slice(0, 6).forEach(item => {
    const div = document.createElement('div');
    div.className = 'fetch-item';
    const thumb = item.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=60';
    const yearText = item.releaseYear ? `سال ساخت: ${item.releaseYear}` : 'سال نامشخص';
    const typeLabel = item.mediaType === 'series' ? '📺 سریال' : '🎬 فیلم';
    const genreText = (item.genres && item.genres.length) ? (Array.isArray(item.genres) ? item.genres.join('، ') : item.genres) : 'درام';

    div.innerHTML = `
      <img src="${thumb}" class="fetch-thumb" alt="${escapeHTML(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=60'">
      <div class="fetch-info">
        <span class="fetch-title">${escapeHTML(item.title)}</span>
        <span class="fetch-meta"><strong class="year-highlight">${yearText}</strong> • <span class="badge-type">${typeLabel}</span> • ${escapeHTML(genreText)}</span>
      </div>
      <button type="button" class="btn-select-movie-inline" title="انتخاب و پر کردن فرم">انتخاب</button>
    `;
    div.addEventListener('click', () => {
      applyMovieDetails(item);
      dropdown.style.display = 'none';
      showToast(`«${item.title}» (${typeLabel} ${item.releaseYear || ''}) انتخاب شد!`, 'success');
    });
    dropdown.appendChild(div);
  });
}

// Helper to translate any English text to Persian via Google Translate GTX API
async function translateToPersian(text) {
  if (!text || !text.trim()) return '';
  if (/[\u0600-\u06FF]/.test(text)) return text.trim();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(text.slice(0, 1000))}`;
    const res = await fetch(url).then(r => r.json());
    if (res && res[0]) {
      const translated = res[0].map(x => x[0]).join('').trim();
      if (translated) return translated;
    }
  } catch (e) {}
  return text.trim();
}

function translateGenreToPersian(g) {
  if (!g) return 'سینمایی';
  const map = {
    'drama': 'درام',
    'comedy': 'کمدی',
    'action': 'اکشن',
    'adventure': 'ماجراجویی',
    'sci-fi': 'علمی‌تخیلی',
    'science fiction': 'علمی‌تخیلی',
    'horror': 'وحشت',
    'thriller': 'هیجان‌انگیز',
    'mystery': 'معمایی',
    'crime': 'جنایی',
    'animation': 'انیمیشن',
    'romance': 'عاشقانه',
    'romantic': 'عاشقانه',
    'fantasy': 'فانتزی',
    'family': 'خانوادگی',
    'biography': 'زندگی‌نامه‌ای',
    'documentary': 'مستند',
    'history': 'تاریخی',
    'war': 'جنگی',
    'music': 'موزیکال',
    'musical': 'موزیکال',
    'western': 'وسترن'
  };
  return map[g.toLowerCase().trim()] || g;
}

const STANDARD_GENRES = [
  'درام',
  'کمدی',
  'اکشن',
  'هیجان‌انگیز',
  'جنایی',
  'معمایی',
  'علمی‌تخیلی',
  'ماجراجویی',
  'وحشت',
  'عاشقانه',
  'انیمیشن',
  'فانتزی',
  'تاریخی',
  'جنگی',
  'مستند',
  'زندگی‌نامه‌ای',
  'خانوادگی',
  'موزیکال',
  'وسترن'
];

function initGenreChips() {
  const container = DOM.genreChipsContainer;
  if (!container) return;
  container.innerHTML = '';

  STANDARD_GENRES.forEach(g => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'genre-choice-chip';
    chip.dataset.genre = g;
    chip.innerHTML = `<span class="chip-check">✓</span><span>${g}</span>`;
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      chip.classList.toggle('active');
      updateSelectedGenresState();
    });
    container.appendChild(chip);
  });
}

function updateSelectedGenresState() {
  const selected = getSelectedGenres();
  if (DOM.movieGenres) DOM.movieGenres.value = selected.join('، ');
  if (DOM.selectedGenresCounter) {
    DOM.selectedGenresCounter.textContent = selected.length > 0 
      ? `${toPersianDigits(selected.length)} انتخاب شده` 
      : '۰ انتخاب شده';
  }
}

function getSelectedGenres() {
  if (!DOM.genreChipsContainer) return [];
  const chips = DOM.genreChipsContainer.querySelectorAll('.genre-choice-chip.active');
  return Array.from(chips).map(c => c.dataset.genre);
}

function setSelectedGenres(genres) {
  if (!DOM.genreChipsContainer) return;
  let list = [];
  if (Array.isArray(genres)) {
    list = genres;
  } else if (typeof genres === 'string') {
    list = genres.split(/[,،]+/).map(g => g.trim()).filter(Boolean);
  }

  // Ensure any custom/incoming genre is present as a chip
  list.forEach(g => {
    if (g) {
      let existing = DOM.genreChipsContainer.querySelector(`[data-genre="${g}"]`);
      if (!existing) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'genre-choice-chip active';
        chip.dataset.genre = g;
        chip.innerHTML = `<span class="chip-check">✓</span><span>${g}</span>`;
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          chip.classList.toggle('active');
          updateSelectedGenresState();
        });
        DOM.genreChipsContainer.appendChild(chip);
      }
    }
  });

  const allChips = DOM.genreChipsContainer.querySelectorAll('.genre-choice-chip');
  allChips.forEach(chip => {
    const g = chip.dataset.genre;
    const isMatch = list.some(target => target.toLowerCase() === g.toLowerCase() || target.includes(g) || g.includes(target));
    chip.classList.toggle('active', isMatch);
  });
  updateSelectedGenresState();
}

function setMediaType(type) {
  const isSeries = type === 'series';
  if (DOM.radioTypeMovie) DOM.radioTypeMovie.checked = !isSeries;
  if (DOM.radioTypeSeries) DOM.radioTypeSeries.checked = isSeries;
  if (DOM.labelTypeMovie) DOM.labelTypeMovie.classList.toggle('active', !isSeries);
  if (DOM.labelTypeSeries) DOM.labelTypeSeries.classList.toggle('active', isSeries);

  const titleLabel = document.getElementById('movieTitleLabel');
  if (titleLabel) titleLabel.innerHTML = (isSeries ? 'نام سریال' : 'نام فیلم') + ' <span class="required">*</span>';

  const releaseYearLabel = document.getElementById('movieReleaseYearLabel');
  if (releaseYearLabel) releaseYearLabel.innerHTML = (isSeries ? 'سال شروع پخش سریال' : 'سال ساخت فیلم') + ' <span class="required">*</span>';

  const synopsisLabel = document.getElementById('movieSynopsisLabel');
  if (synopsisLabel) synopsisLabel.innerHTML = (isSeries ? 'خلاصه داستان سریال' : 'خلاصه داستان فیلم') + ' <span class="required">*</span>';

  const posterLabel = document.getElementById('posterLabel');
  if (posterLabel) posterLabel.innerHTML = (isSeries ? 'پوستر سریال' : 'پوستر فیلم') + ' <span class="badge-auto-field">بارگذاری خودکار</span>';

  const posterIconBig = document.getElementById('posterIconBig');
  if (posterIconBig) posterIconBig.textContent = isSeries ? '📺' : '🎬';

  const favLabel = document.getElementById('favCheckboxLabel');
  if (favLabel) favLabel.textContent = isSeries ? '❤️ افزودن به سریال‌های محبوب و برگزیده من' : '❤️ افزودن به فیلم‌های محبوب و برگزیده من';

  if (DOM.movieTitle) {
    DOM.movieTitle.placeholder = isSeries 
      ? 'نام سریال را بنویسید (مثلاً: Game of Thrones، زخم کاری، Breaking Bad...)'
      : 'نام فیلم را بنویسید (مثلاً: Inception، مارمولک، Dune...)';
  }
}

function getMediaType() {
  const checked = document.querySelector('input[name="mediaType"]:checked');
  return checked ? checked.value : 'movie';
}

function setupMediaTypeRadios() {
  if (DOM.radioTypeMovie) {
    DOM.radioTypeMovie.addEventListener('change', () => setMediaType('movie'));
  }
  if (DOM.radioTypeSeries) {
    DOM.radioTypeSeries.addEventListener('change', () => setMediaType('series'));
  }
  if (DOM.labelTypeMovie) {
    DOM.labelTypeMovie.addEventListener('click', () => setMediaType('movie'));
  }
  if (DOM.labelTypeSeries) {
    DOM.labelTypeSeries.addEventListener('click', () => setMediaType('series'));
  }
}

// Check if a text mainly talks about cast, crew, or production rather than the plot
function isActorOrProductionText(text) {
  if (!text) return true;
  return /با نقش‌آفرینی|به کارگردانی|بازیگران|ستارگان|starring|directed by|stars |screenplay by/i.test(text);
}

// Extract ONLY the pure story / plot section, filtering out actors, directors, box office, etc.
function extractPureStory(extract, isFa) {
  if (!extract) return '';
  const plotRegex = isFa 
    ? /==+\s*(?:خلاصه\s*(?:فیلم|داستان)?|داستان|موضوع)\s*==+([\s\S]*?)(?:\n==+ [^=]+ ==+|$)/i
    : /==+\s*(?:plot|premise|synopsis|storyline|story)\s*==+([\s\S]*?)(?:\n==+ [^=]+ ==+|$)/i;

  const match = extract.match(plotRegex);
  if (match && match[1]?.trim()) {
    let plot = match[1].trim();
    plot = plot.replace(/==+[^=]+==+/g, '').replace(/\n+/g, ' ').trim();
    const sentences = plot.split(/(?<=[.!?؟。])\s+/);
    let result = '';
    for (const s of sentences) {
      if ((result + ' ' + s).length > 500 && result.length > 80) break;
      result += (result ? ' ' : '') + s;
    }
    return result || plot.slice(0, 450);
  }

  // Fallback: If no explicit plot heading, take intro and strip cast/crew sentences
  let intro = extract.split(/\n==/)[0].trim();
  const sentences = intro.split(/(?<=[.!?؟。])\s+/);
  const cleanSentences = sentences.filter(s => {
    if (/\b(directed by|written by|produced by|starring|stars|premiered|screenplay|grossed|box office|distributed by|budget of)\b/i.test(s)) return false;
    if (/is a \d{4} .* (film|movie|series)/i.test(s) && !/(tells the story|follows|centers on|about)/i.test(s)) return false;
    if (/به کارگردانی|به نویسندگی|تهیه‌کنندگی|با بازی|نقش‌آفرینی|به ایفای نقش|در گیشه|توزیع‌شده|فیلم‌برداری|موسیقی متن/i.test(s)) return false;
    if (/یک فیلم .* (است که در سال|محصول سال)/i.test(s) && !/(داستان|روایت|درباره)/i.test(s)) return false;
    return true;
  });

  let cleanIntro = cleanSentences.join(' ').trim();
  return cleanIntro || intro.slice(0, 350);
}

// Fetch pure story/plot from Wikipedia (English or Persian) and translate if needed
async function fetchPureMovieStory(title, year) {
  if (!title) return '';
  const isFa = /[\u0600-\u06FF]/.test(title);
  const domains = isFa ? ['fa.wikipedia.org', 'en.wikipedia.org'] : ['en.wikipedia.org', 'fa.wikipedia.org'];

  for (const domain of domains) {
    const isDomainFa = domain.startsWith('fa');
    const cands = [];
    if (isDomainFa) {
      if (year) cands.push(`${title} (فیلم ${year})`);
      cands.push(`${title} (فیلم)`);
      cands.push(title);
    } else {
      if (year) cands.push(`${title} (${year} film)`);
      cands.push(`${title} (film)`);
      cands.push(title);
    }

    for (const cand of cands) {
      try {
        const url = `https://${domain}/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(cand)}&format=json&origin=*`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) }).then(r => r.json());
        const page = Object.values(res.query?.pages || {})[0];
        if (page && page.extract && page.extract.length > 50) {
          const story = extractPureStory(page.extract, isDomainFa);
          if (story && story.trim().length > 25) {
            return isDomainFa ? story.trim() : await translateToPersian(story.trim());
          }
        }
      } catch (e) {}
    }
  }
  return '';
}

async function applyMovieDetails(data) {
  DOM.movieTitle.value = data.title || '';
  DOM.movieReleaseYear.value = data.releaseYear || new Date().getFullYear();

  if (data.mediaType) {
    setMediaType(data.mediaType);
  }

  if (data.genres && data.genres.length) {
    const genres = Array.isArray(data.genres) ? data.genres.map(translateGenreToPersian) : [translateGenreToPersian(data.genres)];
    setSelectedGenres(genres);
  }
  if (data.poster) {
    DOM.moviePoster.value = data.poster;
    updatePosterPreview(data.poster);
  }

  // Fetch pure movie story/plot (excluding actors, directors, production info)
  DOM.movieSynopsis.value = 'در حال دریافت خلاصه موضوع و داستان فیلم...';

  let story = '';
  if (data.synopsis && !isActorOrProductionText(data.synopsis) && data.synopsis.length > 35) {
    story = data.synopsis;
    if (!/[\u0600-\u06FF]/.test(story)) {
      story = await translateToPersian(story);
    }
  }

  if (!story) {
    story = await fetchPureMovieStory(data.title, data.releaseYear);
  }

  DOM.movieSynopsis.value = story || 'خلاصه موضوع و داستان این اثر ثبت نشده است.';
}

function updatePosterPreview(url) {
  if (url && url.trim()) {
    DOM.posterPreviewImg.src = url.trim();
    DOM.posterPreviewImg.style.display = 'block';
    if (DOM.posterPlaceholderText) DOM.posterPlaceholderText.style.display = 'none';
    if (DOM.posterThumbPreview) DOM.posterThumbPreview.style.borderStyle = 'solid';
  } else {
    DOM.posterPreviewImg.style.display = 'none';
    if (DOM.posterPlaceholderText) DOM.posterPlaceholderText.style.display = 'flex';
    if (DOM.posterThumbPreview) DOM.posterThumbPreview.style.borderStyle = 'dashed';
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

  DOM.movieReleaseYear.value = new Date().getFullYear();
  DOM.movieWatchYear.value = getCurrentShamsiYear();
  setMediaType('movie');
  setSelectedGenres(['درام']);
  setRating(9);
  updatePosterPreview('');
  DOM.fetchResultsDropdown.style.display = 'none';

  DOM.movieModal.classList.add('open');
  DOM.movieTitle.focus();
}

function openEditModal(movie) {
  STATE.isEditMode = true;
  DOM.editMovieId.value = movie.id;
  DOM.movieModalTitle.textContent = 'ویرایش فیلم / سریال';
  DOM.btnSubmitMovieText.textContent = 'ذخیره تغییرات';

  DOM.movieTitle.value = movie.title || '';
  DOM.movieReleaseYear.value = movie.releaseYear || new Date().getFullYear();
  DOM.movieWatchYear.value = movie.watchYear || getCurrentShamsiYear();
  setMediaType(movie.mediaType || 'movie');
  setSelectedGenres(movie.genres || ['درام']);
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
  const releaseYear = parseInt(DOM.movieReleaseYear.value) || new Date().getFullYear();
  const watchYear = parseInt(DOM.movieWatchYear.value) || getCurrentShamsiYear();
  const mediaType = getMediaType();
  let genres = getSelectedGenres();
  if (!genres || genres.length === 0) genres = [mediaType === 'series' ? 'سریال' : 'درام'];
  const synopsis = DOM.movieSynopsis.value.trim();
  const rating = STATE.currentRating;
  const poster = DOM.moviePoster.value.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
  const review = DOM.movieReview.value.trim();
  const isFavorite = DOM.movieIsFavorite.checked;

  const payload = {
    title,
    releaseYear,
    watchYear,
    mediaType,
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

  const typeText = movie.mediaType === 'series' ? '📺 سریال' : '🎬 فیلم';
  DOM.viewReleaseYearBadge.textContent = `${typeText} • سال ساخت: ${movie.releaseYear || 'نامشخص'}`;
  DOM.viewWatchYearBadge.textContent = `سالی که دیدم: ${toPersianDigits(movie.watchYear || getCurrentShamsiYear())}`;
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
              <span class="quick-account-title">انتخاب حساب: <strong>${escapeHTML(primary.name || primary.username)}</strong></span>
              <span class="quick-account-email">${escapeHTML(primary.email || primary.username)}</span>
            </div>
            <span class="quick-account-arrow">➔</span>
          </button>
        `;
        document.getElementById('btnQuickAccountLogin')?.addEventListener('click', () => {
          DOM.loginUsername.value = primary.username || primary.email;
          DOM.loginPassword.focus();
          showToast('حساب انتخاب شد؛ لطفاً رمز عبور را وارد کنید.', 'info');
        });
      } else {
        DOM.quickSavedAccountBar.style.display = 'none';
      }
    } catch (e) {
      if (DOM.quickSavedAccountBar) DOM.quickSavedAccountBar.style.display = 'none';
    }
  }

  DOM.userProfileBtn.addEventListener('click', () => {
    updateUserUI();
    DOM.authModal.classList.add('open');
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

    if (!password) {
      showToast('لطفاً رمز عبور خود را وارد کنید.', 'error');
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
      showToast(err.message || 'نام کاربری یا رمز عبور اشتباه است.', 'error');
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



  // Clear legacy Google client id so no automatic Google popups are triggered
  localStorage.removeItem('cinelog_google_client_id');

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

  // Only close view, auth, and stats modal when clicking the backdrop.
  // movieModal intentionally stays open so typed text / search results are NEVER lost by outside clicks!
  [DOM.viewModal, DOM.authModal, DOM.statsModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Clicking outside the movie search dropdown closes only the dropdown, NOT the modal
  document.addEventListener('click', (e) => {
    if (DOM.fetchResultsDropdown && !DOM.fetchResultsDropdown.contains(e.target) && e.target !== DOM.movieTitle && e.target !== DOM.btnSearchOnline) {
      DOM.fetchResultsDropdown.style.display = 'none';
    }
  });

  // Auto-hide search dropdown when focusing on other form fields
  [DOM.movieReleaseYear, DOM.movieWatchYear, DOM.movieGenres, DOM.movieSynopsis, DOM.moviePoster, DOM.movieReview].forEach(input => {
    input?.addEventListener('focus', () => {
      if (DOM.fetchResultsDropdown) DOM.fetchResultsDropdown.style.display = 'none';
    });
  });

  // Pressing Escape hides search dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.fetchResultsDropdown) {
      DOM.fetchResultsDropdown.style.display = 'none';
    }
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
  if (DOM.filterMediaType) DOM.filterMediaType.addEventListener('change', applyFiltersAndSort);
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

  if (DOM.btnClearAllMovies) {
    DOM.btnClearAllMovies.addEventListener('click', async () => {
      if (STATE.movies.length === 0) {
        showToast('لیست فیلم‌های شما هم‌اکنون کاملاً خالی است.', 'info');
        return;
      }
      if (!confirm('آیا از پاک کردن تمامی فیلم‌های ثبت‌شده مطمئن هستید؟ تمام لیست خالی خواهد شد.')) {
        return;
      }
      try {
        await apiCall('/api/movies', 'DELETE');
      } catch (e) {
        localStorage.setItem('cinelog_movies', JSON.stringify([]));
        localStorage.setItem('cinelog_local_movies', JSON.stringify([]));
      }
      STATE.movies = [];
      STATE.filteredMovies = [];
      saveLocalMovies();
      renderMovies();
      updateStatsSummary();
      showToast('تمامی محتویات و فیلم‌های ثبت‌شده با موفقیت پاک شدند.', 'success');
      if (DOM.authModal) DOM.authModal.classList.remove('open');
    });
  }

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
  initGenreChips();
  setupMediaTypeRadios();
  setupStarRating();
  setupLiveMovieSearch();
  setupAuthModal();
  setupEventListeners();
  if (DOM.movieReleaseYear) DOM.movieReleaseYear.value = new Date().getFullYear();
  if (DOM.movieWatchYear) DOM.movieWatchYear.value = getCurrentShamsiYear();
  await initAuth();
});
