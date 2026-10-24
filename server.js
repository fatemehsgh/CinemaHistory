const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialDB() {
  return {
    users: [],
    sessions: {},
    movies: []
  };
}

// Database helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return getInitialDB();
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Get user from token/header
function getAuthUser(req, db) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const session = db.sessions[token];
  if (!session) return null;
  const user = db.users.find(u => u.id === session.userId);
  return user || null;
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // --- API ROUTES ---

  // 1. Auth: Register
  if (pathname === '/api/register' && req.method === 'POST') {
    const db = readDB();
    const body = await parseBody(req);
    const { username, password, name, avatar, bio } = body;

    if (!username || !password) {
      return sendJSON(400, { error: 'نام کاربری و رمز عبور الزامی است.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = (body.email || (cleanUsername.includes('@') ? cleanUsername : '')).trim().toLowerCase();
    
    if (db.users.some(u => u.username.toLowerCase() === cleanUsername || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail))) {
      return sendJSON(400, { error: 'این نام کاربری یا ایمیل قبلاً ثبت شده است.' });
    }

    const salt = crypto.randomBytes(8).toString('hex');
    const newUser = {
      id: 'user-' + crypto.randomUUID(),
      username: cleanUsername,
      email: cleanEmail,
      name: name?.trim() || username.trim(),
      passwordHash: hashPassword(password, salt),
      passwordSalt: salt,
      avatar: avatar || '🍿',
      bio: bio || '',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    const token = crypto.randomBytes(24).toString('hex');
    db.sessions[token] = { userId: newUser.id, createdAt: Date.now() };
    writeDB(db);

    return sendJSON(200, {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        bio: newUser.bio
      }
    });
  }

  // 2. Auth: Login
  if (pathname === '/api/login' && req.method === 'POST') {
    const db = readDB();
    const body = await parseBody(req);
    const { username, password } = body;

    if (!username || !username.trim()) {
      return sendJSON(400, { error: 'نام کاربری یا آدرس ایمیل را وارد کنید.' });
    }

    const cleanInput = username.trim().toLowerCase();
    let user = db.users.find(u => 
      (u.username && u.username.toLowerCase() === cleanInput) || 
      (u.email && u.email.toLowerCase() === cleanInput)
    );

    // If user not found, but it is an email address: auto-register and log in!
    if (!user && cleanInput.includes('@')) {
      const baseUsername = cleanInput.split('@')[0];
      let finalUsername = baseUsername;
      let counter = 1;
      while (db.users.some(u => u.username && u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}${counter++}`;
      }
      user = {
        id: 'user-' + crypto.randomUUID(),
        username: finalUsername,
        email: cleanInput,
        name: baseUsername,
        avatar: '🎬',
        isGoogle: true,
        bio: 'ورود با ایمیل 🎬',
        createdAt: new Date().toISOString()
      };
      if (password) {
        const salt = crypto.randomBytes(8).toString('hex');
        user.passwordSalt = salt;
        user.passwordHash = hashPassword(password, salt);
      }
      db.users.push(user);
    }

    if (!user) {
      return sendJSON(401, { error: 'کاربری با این نام کاربری یا ایمیل یافت نشد.' });
    }

    // If password was provided and user has a password set, verify it
    if (password && user.passwordHash) {
      const calculatedHash = hashPassword(password, user.passwordSalt);
      if (calculatedHash !== user.passwordHash) {
        return sendJSON(401, { error: 'رمز عبور وارد شده نادرست است.' });
      }
    } else if (password && !user.passwordHash) {
      // First time setting password for this account
      const salt = crypto.randomBytes(8).toString('hex');
      user.passwordSalt = salt;
      user.passwordHash = hashPassword(password, salt);
    }

    const token = crypto.randomBytes(24).toString('hex');
    db.sessions[token] = { userId: user.id, createdAt: Date.now() };
    writeDB(db);

    return sendJSON(200, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        isGoogle: !!user.isGoogle
      }
    });
  }

  // 2.45 Auth: List accounts available for quick Google / profile sign-in
  if (pathname === '/api/google-accounts' && req.method === 'GET') {
    const db = readDB();
    const accounts = (db.users || [])
      .filter(u => u.email || u.isGoogle)
      .map(u => ({
        id: u.id,
        email: u.email || '',
        name: u.name || u.username,
        username: u.username,
        avatar: u.avatar || '🎬',
        isGoogle: !!u.isGoogle
      }));
    return sendJSON(200, { accounts });
  }

  // 2.46 Auth: Google OAuth Client Configuration (GET & POST)
  if (pathname === '/api/google-config' && req.method === 'GET') {
    const db = readDB();
    return sendJSON(200, {
      clientId: db.googleClientId || process.env.GOOGLE_CLIENT_ID || ''
    });
  }

  if (pathname === '/api/google-config' && req.method === 'POST') {
    const db = readDB();
    const body = await parseBody(req);
    db.googleClientId = (body.clientId || '').trim();
    writeDB(db);
    return sendJSON(200, {
      success: true,
      clientId: db.googleClientId
    });
  }

  // 2.5 Auth: Google OAuth & Direct Gmail Login
  if (pathname === '/api/google-login' && req.method === 'POST') {
    const db = readDB();
    const body = await parseBody(req);
    let email = '';
    let name = '';
    let avatar = body.avatar || '🎬';
    let googleId = '';

    // Case 1: Official Google JWT Credential from Google Identity Services
    if (body.credential) {
      try {
        const parts = body.credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          email = payload.email || '';
          name = payload.name || payload.given_name || email.split('@')[0];
          avatar = payload.picture || avatar || '🎬';
          googleId = payload.sub || '';
        }
      } catch (e) {
        console.error('Failed to parse Google JWT:', e);
      }
    } else if (body.email) {
      // Case 2: Direct Google account / Gmail sign-in
      email = body.email.trim();
      name = body.name ? body.name.trim() : email.split('@')[0];
      avatar = body.avatar || avatar || '🎬';
      googleId = body.googleId || ('google-' + crypto.createHash('md5').update(email.toLowerCase()).digest('hex').slice(0, 16));
    }

    if (!email) {
      return sendJSON(400, { 
        error: 'ایمیل معتبر برای ورود با گوگل دریافت نشد.' 
      });
    }

    // Auto append @gmail.com if no @ domain provided
    if (!email.includes('@')) {
      email = email + '@gmail.com';
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.users.find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) || 
      (u.username && u.username.toLowerCase() === cleanEmail) || 
      (googleId && u.googleId === googleId)
    );

    if (!user) {
      const baseUsername = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
      let finalUsername = baseUsername;
      let counter = 1;
      while (db.users.some(u => u.username && u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}${counter++}`;
      }

      user = {
        id: 'user-' + crypto.randomUUID(),
        username: finalUsername,
        email: cleanEmail,
        name: name || baseUsername,
        avatar: avatar,
        googleId: googleId,
        isGoogle: true,
        bio: 'ورود با حساب گوگل 🎬',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      if (name && (!user.name || user.name === user.username)) user.name = name;
      if (avatar && avatar !== '🇬' && (!user.avatar || user.avatar === '🇬')) user.avatar = avatar;
      user.isGoogle = true;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (!user.email) user.email = cleanEmail;
    }

    const token = crypto.randomBytes(24).toString('hex');
    db.sessions[token] = { userId: user.id, createdAt: Date.now() };
    writeDB(db);

    return sendJSON(200, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        isGoogle: true
      }
    });
  }

  // 2.6 Create Windows Desktop Shortcut with Icon
  if (pathname === '/api/create-desktop-shortcut' && req.method === 'POST') {
    try {
      const desktopDir = path.join(require('os').homedir(), 'Desktop');
      const iconPath = path.join(__dirname, 'public', 'favicon.ico');
      const shortcutPath = path.join(desktopDir, 'CinemaLog.lnk');
      const vbsPath = path.join(__dirname, 'temp_shortcut.vbs');
      const vbsContent = `
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "${shortcutPath.replace(/\\/g, '\\\\')}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "http://localhost:3000"
oLink.IconLocation = "${iconPath.replace(/\\/g, '\\\\')},0"
oLink.Description = "CinemaLog - سینما لاگ"
oLink.Save
`;
      fs.writeFileSync(vbsPath, vbsContent, 'utf8');
      require('child_process').execSync(`cscript //nologo "${vbsPath}"`);
      try { fs.unlinkSync(vbsPath); } catch (e) {}
      return sendJSON(200, { success: true, path: shortcutPath });
    } catch (err) {
      return sendJSON(500, { error: err.message });
    }
  }

  // 3. Auth: Current User
  if (pathname === '/api/me' && req.method === 'GET') {
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) {
      return sendJSON(401, { error: 'لطفاً وارد حساب خود شوید.' });
    }
    return sendJSON(200, {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  }

  // 4. Auth: Logout
  if (pathname === '/api/logout' && req.method === 'POST') {
    const db = readDB();
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && db.sessions[token]) {
      delete db.sessions[token];
      writeDB(db);
    }
    return sendJSON(200, { success: true });
  }

  // 5. Auth: Update Profile
  if (pathname === '/api/profile' && req.method === 'PUT') {
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) return sendJSON(401, { error: 'عدم دسترسی' });

    const body = await parseBody(req);
    if (body.name) user.name = body.name.trim();
    if (body.avatar) user.avatar = body.avatar.trim();
    if (body.bio !== undefined) user.bio = body.bio.trim();

    writeDB(db);
    return sendJSON(200, { user });
  }

  // 6. Movies: List
  if (pathname === '/api/movies' && req.method === 'GET') {
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) return sendJSON(401, { error: 'عدم دسترسی' });

    let userMovies = db.movies.filter(m => m.userId === user.id);
    return sendJSON(200, { movies: userMovies });
  }

  // 7. Movies: Create
  if (pathname === '/api/movies' && req.method === 'POST') {
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) return sendJSON(401, { error: 'عدم دسترسی' });

    const body = await parseBody(req);
    if (!body.title || !body.title.trim()) {
      return sendJSON(400, { error: 'نام فیلم الزامی است.' });
    }

    const newMovie = {
      id: 'mov-' + crypto.randomUUID(),
      userId: user.id,
      title: body.title.trim(),
      releaseYear: parseInt(body.releaseYear) || new Date().getFullYear(),
      watchYear: parseInt(body.watchYear) || 1403,
      synopsis: body.synopsis?.trim() || 'بدون خلاصه',
      genres: Array.isArray(body.genres) ? body.genres : (body.genres ? [body.genres] : ['عمومی']),
      rating: parseFloat(body.rating) || 5,
      review: body.review?.trim() || '',
      poster: body.poster?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      isFavorite: !!body.isFavorite,
      createdAt: new Date().toISOString()
    };

    db.movies.unshift(newMovie);
    writeDB(db);

    return sendJSON(201, { movie: newMovie });
  }

  // 8. Movies: Update
  if (pathname.startsWith('/api/movies/') && req.method === 'PUT') {
    const id = pathname.replace('/api/movies/', '').trim();
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) return sendJSON(401, { error: 'عدم دسترسی' });

    const movieIndex = db.movies.findIndex(m => m.id === id && m.userId === user.id);
    if (movieIndex === -1) {
      return sendJSON(404, { error: 'فیلم یافت نشد.' });
    }

    const body = await parseBody(req);
    const existing = db.movies[movieIndex];

    const updated = {
      ...existing,
      title: body.title !== undefined ? body.title.trim() : existing.title,
      releaseYear: body.releaseYear !== undefined ? parseInt(body.releaseYear) : existing.releaseYear,
      watchYear: body.watchYear !== undefined ? parseInt(body.watchYear) : existing.watchYear,
      synopsis: body.synopsis !== undefined ? body.synopsis.trim() : existing.synopsis,
      genres: body.genres !== undefined ? (Array.isArray(body.genres) ? body.genres : [body.genres]) : existing.genres,
      rating: body.rating !== undefined ? parseFloat(body.rating) : existing.rating,
      review: body.review !== undefined ? body.review.trim() : existing.review,
      poster: body.poster !== undefined ? body.poster.trim() : existing.poster,
      isFavorite: body.isFavorite !== undefined ? !!body.isFavorite : existing.isFavorite,
      updatedAt: new Date().toISOString()
    };

    db.movies[movieIndex] = updated;
    writeDB(db);
    return sendJSON(200, { movie: updated });
  }

  // 9. Movies: Delete
  if (pathname.startsWith('/api/movies/') && req.method === 'DELETE') {
    const id = pathname.replace('/api/movies/', '').trim();
    const db = readDB();
    const user = getAuthUser(req, db);
    if (!user) return sendJSON(401, { error: 'عدم دسترسی' });

    const initialLength = db.movies.length;
    db.movies = db.movies.filter(m => !(m.id === id && m.userId === user.id));

    if (db.movies.length === initialLength) {
      return sendJSON(404, { error: 'فیلم یافت نشد.' });
    }

    writeDB(db);
    return sendJSON(200, { success: true });
  }

  // 10. Live Internet Movie Search (TVMaze + Persian & English Wikipedia)
  if (pathname === '/api/search-movie' && req.method === 'GET') {
    const query = urlObj.searchParams.get('q');
    if (!query || !query.trim()) {
      return sendJSON(400, { error: 'عبارت جستجو خالی است.' });
    }

    const q = query.trim();
    let results = [];
    const isFarsi = /[\u0600-\u06FF]/.test(q);

    // 1. If Farsi: search Persian Wikipedia
    if (isFarsi) {
      try {
        const faSearchUrl = `https://fa.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(q)}&limit=4`;
        const faSearchRes = await fetch(faSearchUrl, {
          headers: { 'User-Agent': 'CineLogHistory/1.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (faSearchRes.ok) {
          const searchData = await faSearchRes.json();
          for (const page of (searchData.pages || [])) {
            try {
              const summaryRes = await fetch(`https://fa.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`, {
                headers: { 'User-Agent': 'CineLogHistory/1.0' },
                signal: AbortSignal.timeout(3000)
              });
              if (summaryRes.ok) {
                const s = await summaryRes.json();
                if (s.extract && s.type !== 'disambiguation') {
                  const yearMatch = (s.description || s.extract).match(/\b(13\d\d|14\d\d|19\d\d|20\d\d)\b/);
                  // Extract genre hint if possible
                  let genre = 'درام';
                  if (/کمدی/.test(s.extract)) genre = 'کمدی';
                  else if (/اکشن/.test(s.extract)) genre = 'اکشن';
                  else if (/جنایی/.test(s.extract)) genre = 'جنایی';
                  else if (/علمی[ -]تخیلی/.test(s.extract)) genre = 'علمی‌تخیلی';
                  else if (/وحشت|ترسناک/.test(s.extract)) genre = 'وحشت';
                  else if (/انیمیشن/.test(s.extract)) genre = 'انیمیشن';

                  results.push({
                    title: s.title.replace(/\s*\(فیلم.*\)/, ''),
                    releaseYear: yearMatch ? parseInt(yearMatch[1]) : 2020,
                    synopsis: s.extract,
                    poster: s.thumbnail?.source || '',
                    genres: [genre]
                  });
                }
              }
            } catch (err) {}
          }
        }
      } catch (e) {}
    }

    // 2. TVMaze API (fast, reliable, high quality posters, clean synopsis, genres)
    try {
      const tvRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        for (const item of tvData.slice(0, 4)) {
          const show = item.show;
          if (!show) continue;
          const cleanSummary = (show.summary || '').replace(/<[^>]*>?/gm, '').trim();
          results.push({
            title: show.name,
            releaseYear: show.premiered ? parseInt(show.premiered.slice(0, 4)) : 2020,
            synopsis: cleanSummary || 'خلاصه داستان در دست نیست.',
            poster: show.image?.original || show.image?.medium || '',
            genres: show.genres && show.genres.length ? show.genres : ['درام']
          });
        }
      }
    } catch (e) {}

    // 3. English Wikipedia Search (finds movies even if ambiguous like Interstellar)
    if (results.length < 3 && !isFarsi) {
      try {
        const enSearchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(q)}&limit=5`;
        const enSearchRes = await fetch(enSearchUrl, {
          headers: { 'User-Agent': 'CineLogMovieTrackerApp/1.0 (cinelog.history.app@gmail.com)' },
          signal: AbortSignal.timeout(3500)
        });
        if (enSearchRes.ok) {
          const searchData = await enSearchRes.json();
          const pages = searchData.pages || [];
          const filmPage = pages.find(p => (p.description || '').toLowerCase().includes('film') || (p.title || '').includes('(film)')) || pages[0];
          if (filmPage) {
            const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(filmPage.title)}`, {
              headers: { 'User-Agent': 'CineLogMovieTrackerApp/1.0 (cinelog.history.app@gmail.com)' },
              signal: AbortSignal.timeout(3000)
            });
            if (summaryRes.ok) {
              const s = await summaryRes.json();
              if (s.extract && s.type !== 'disambiguation') {
                const yearMatch = (s.description || s.extract).match(/\b(19\d\d|20\d\d)\b/);
                results.unshift({
                  title: s.title.replace(/\s*\(film.*\)/i, ''),
                  releaseYear: yearMatch ? parseInt(yearMatch[1]) : 2020,
                  synopsis: s.extract,
                  poster: s.thumbnail?.source || '',
                  genres: ['سینما']
                });
              }
            }
          }
        }
      } catch (e) {}
    }

    return sendJSON(200, { results });
  }

  // --- STATIC FILES SERVING ---
  const safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.join(PUBLIC_DIR, safePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(__dirname, safePath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    let indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`🎬 CineLog Server is running at http://localhost:${PORT}`);
});
