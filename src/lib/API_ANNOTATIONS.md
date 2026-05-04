API client (annotated)

This file is an annotated, line-level explanation of `src/lib/api.js`.
It does NOT modify the original `api.js`. Read this file to understand what each function does, why branches exist, and what responses the backend is expected to provide.

---

Top-level imports and constants

- import { apiCache } from '../utils/cache';
  - `apiCache` is an in-memory TTL cache used to avoid repeated API requests for data that rarely changes (e.g., dashboard, stats).

- import { transformUserData } from '../utils/dataTransform';
  - `transformUserData` reshapes backend user profile objects into the frontend shape expected by the UI.

- import { logApiRequest, logApiResponse, logApiError } from '../utils/logger';
  - Structured logging helpers used across the client to keep request/response/error traces consistent.

- const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  - Base URL for API requests. Use `VITE_API_URL` env var in dev/production to point to your backend.

---

Class `ApiClient` (purpose):
- Central place to issue HTTP requests, attach access tokens, refresh tokens when 401 occurs, and provide higher-level helper functions (login, getDonors, getUserDashboardData, etc.).

Constructor:
- this.baseURL = API_BASE_URL;
  - The final base URL used to build request URLs.
- this.isRefreshing = false;
  - Guard flag to prevent multiple concurrent refresh attempts.
- this.failedQueue = [];
  - Queue for requests that arrived while a token refresh was running. Each queued item is an object { resolve, reject } from a Promise.

---

Method: processQueue(error, token = null)
- Purpose: When a token refresh completes (either success or failure), resolve or reject queued requests.
- Behavior: iterate over `this.failedQueue` and call `resolve(token)` when refresh succeeded (so the queued requests can retry), or `reject(error)` when refresh failed.
- After processing, `this.failedQueue` is cleared.

Expected backend behavior related to this method:
- The backend should implement `/refresh` such that if the refresh cookie is valid it returns a new JSON body with `access_token`.
- If `/refresh` fails (expired or invalid refresh cookie) the queued requests should be rejected and the frontend should force re-login.

---

Method: async request(endpoint, options = {})
- This is the primary wrapper for fetch. All higher-level API methods use `request()` unless they need a special content type (like `login`).

Step-by-step explanation and expected backend responses:

1. Build URL & read token
- const url = `${this.baseURL}${endpoint}`;
- const token = localStorage.getItem('accessToken');
  - `accessToken` is expected to be a JWT or opaque token returned by the backend `POST /login` or `POST /refresh`.

2. Build config (headers, credentials)
- Default `method: 'GET'` but overridden by `options`.
- Headers include `Content-Type: application/json` and `Accept: application/json` by default.
- If `token` exists, add `Authorization: Bearer ${token}`.
- `credentials: 'include'` is set so cookies (refresh token) are sent with cross-site requests if backend sets them.

Expected backend requirement:
- `/refresh`, `/logout`, `/login` endpoints rely on cookies for refresh flows. The backend must set `SameSite` and `Secure` appropriately for cookies.

3. Try block: send request and handle 401
- logApiRequest(endpoint, config.method, { url, headers: config.headers });
- const response = await fetch(url, config);

If response.status === 401 and endpoint is not `/login` or `/refresh`:
- This means the access token is invalid or expired.

Two sub-cases:
A) If `this.isRefreshing` is true
- Another refresh is in progress.
- The current request is queued: return `new Promise((resolve, reject) => { this.failedQueue.push({ resolve, reject }); })`.
- When the refresh completes, `processQueue()` will resolve all queued promises.
- The resolved promise's `.then` handler will:
  - Read `newToken` from localStorage (set by refresh), set `config.headers.Authorization` and retry `fetch(url, config)`.
  - On retry: if `retryResponse.ok` return parsed JSON/text.
  - If retryResponse not ok: throw an HTTP error with status.

Expected backend behavior here:
- The `/refresh` endpoint should return 200 + JSON `{ access_token: '...' }` when successful. The frontend expects the `access_token` to be stored to `localStorage` by `refreshToken()` so queued requests can pick it up.

B) If `this.isRefreshing` is false
- Set `this.isRefreshing = true` and try to refresh token by calling `this.refreshToken()`.
- If `refreshed` is truthy (a token string) then:
  - call `this.processQueue(null, refreshed)` to resolve queued requests.
  - retry original request with new token read from `localStorage`.
  - parse retry response as JSON if response Content-Type includes `application/json` else text.
- If refresh failed (returns false), then:
  - `processQueue(new Error('Token refresh failed'), null)` rejects queued promises.
  - Clear `accessToken` from localStorage.
  - Redirect to `/login` (this is where the app forces re-authentication).

Error handling: the refresh attempt is wrapped in its own try/catch and `finally` sets `this.isRefreshing = false`.

Expected backend responses affecting this branch:
- `/refresh` returns 200 with JSON `{ access_token }` if refresh cookie is valid.
- `/refresh` returns 401/403 or non-2xx if refresh cookie invalid or expired.
- Backend should ensure refresh cookie is `HttpOnly`, `Secure` and appropriate `SameSite` for your deployment.

4. After 401 handling (or for normal 2xx responses):
- logApiResponse(endpoint, config.method, response.status, { url });
- If response not ok (non-2xx):
  - Read `errorText = await response.text()` and construct an `Error` with message `HTTP error! status: ${response.status} - ${errorText}`.
  - `error.status = response.status` and `logApiError(...)` is called.
  - Then throw the error to be handled by callers.
- If response is ok:
  - Check `contentType = response.headers.get('content-type')`.
  - If JSON -> `return await response.json()` else `return await response.text()`.

Network / fetch-level catch
- Catches fetch/network errors and logs them via `logApiError` unless `error.status` is present (already a HTTP error).
- Special-case: if `error.name === 'TypeError' && error.message.includes('fetch')` then wrap into a friendlier `Cannot connect to server` error (useful when backend not running locally).

Summary of `request()` expectations from backend:
- For normal endpoints, return 2xx with JSON or text content-type.
- Return 401 when access token invalid/expired (then client tries `/refresh`).
- `/refresh` must return new `access_token` in JSON when cookie valid.

---

Method: async login(username, password)
- This function performs a `POST /login` using form-encoded body compatible with FastAPI `OAuth2PasswordRequestForm`.
- Steps:
  - Build `URLSearchParams` with username/password.
  - `fetch(this.baseURL + '/login', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, credentials: 'include', body: formData })`.
  - If response not ok -> parse JSON error and throw `new Error(errorData.detail || 'Login failed')`.
  - On success parse JSON and store `data.access_token` into `localStorage`.
  - Return the parsed `data`.

Expected backend response:
- On success: 200 OK JSON e.g. `{ access_token: '...', token_type: 'bearer', user: {...} }` (the shape may vary but `access_token` must exist).
- On failure: 400/401 with a JSON `detail` string.
- Backend sets a refresh cookie via `Set-Cookie` when login is successful (client uses `credentials: 'include'`).

---

Method: async signup(userData)
- Adds `confirm_password` to `userData` and calls `this.request('/signup/', { method: 'POST', body: JSON.stringify(signupData) })`.
- The backend is expected to accept JSON signup payload and return 201 or 200 on success.

---

Method: async refreshToken()
- Purpose: call backend `/refresh` endpoint to mint a new access token using the refresh cookie.
- Steps:
  - `fetch(this.baseURL + '/refresh', { method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'} })`.
  - If response.ok: parse `data` and store `data.access_token` to `localStorage` and return the token.
  - If not ok: create `error` with `status`, log `logApiError` and return `false`.
  - Catch network errors and log, returning `false` as well.

Expected backend behavior:
- If refresh cookie valid: return 200 + `{ access_token: '...' }`.
- If not valid: return 401/403 or 400 with no `access_token`.

Security note: because `refreshToken()` uses `credentials: 'include'` the backend must mark refresh cookie with `HttpOnly` and appropriate `SameSite`/`Secure` flags.

---

Method: async logout()
- Purpose: call `/logout` to clear backend-side session/cookie and then remove local token.
- Behavior:
  - Try POST to `/logout` with `credentials: 'include'` and `Authorization` header with current `accessToken`.
  - Log response.
  - On error, log but don't throw (logout errors are not critical in this client).
  - Finally remove `accessToken` from `localStorage`.

Expected backend behavior:
- `/logout` should clear refresh cookie server-side and return 200.
- If backend fails to clear cookie, client will remove local `accessToken` regardless and user will be forced to login.

---

User endpoints: getCurrentUser, updateUser
- `getCurrentUser()` simply calls `this.request('/users/me/profile')`.
- `updateUser(userData)` calls `this.request('/users/me/profile', { method: 'PUT', body: JSON.stringify(userData) })`.

Expected backend responses:
- GET `/users/me/profile` returns 200 + JSON profile.
- PUT `/users/me/profile` returns updated profile JSON.

---

Donor endpoints: getDonors, getDonorsByBloodGroup, getDonorById, searchDonors
- `getDonors(filters = {})` builds a query string and calls `/users` or `/users?qs`.
- `getDonorsByBloodGroup(bloodGroup)` calls `/users/blood-group/${bloodGroup}`.
- `getDonorById(id)` calls `/users/${id}`.
- `searchDonors(searchParams)` uses `bloodType` -> calls `getDonorsByBloodGroup`; otherwise returns `getDonors()`.

Expected backend behavior:
- `/users` returns array of user objects (donors) with fields like `id`, `name`, `blood_type`, `city`, `donations` (array), etc.
- `/users/blood-group/:bg` filters on backend and returns matching donors.

Placeholders (not implemented in backend): getDonations, createDonation, getRequests, createRequest, sendMessage
- These functions intentionally throw an Error explaining the endpoint isn't implemented. They are safe placeholders for future features.

---

Dashboard helpers: getUserDashboardData, getUserDonations, getBloodBankStats, getUpcomingDrives

1) getUserDashboardData()
- Tries cache key `user-dashboard-data` first.
- If cache miss, calls `/users/me/profile`, then `transformUserData(data)` to shape the response for the UI.
- Caches result for 2 minutes and returns it.
- On error logs and throws a user-friendly error message.

Expected backend response: profile JSON should contain fields required by `transformUserData` (e.g., `donations`, `last_donation`, `blood_type`, etc.).

2) getUserDonations()
- Tries cache key `user-donations` first.
- If missing, fetches `/users/me/profile` and reads `profile.donations` (falls back to `[]` if undefined).
- Caches donations for 5 minutes.

Note: Because there is no dedicated `GET /donations` endpoint, donations are derived from the profile.

3) getBloodBankStats()
- Tries `blood-bank-stats` cache first.
- If miss: calls `/users/` to fetch all users, then computes:
  - `bloodTypeCount` by iterating over a fixed `bloodTypes` list.
  - `totalDonations` by summing lengths of `user.donations` arrays.
  - `donationsThisMonth` by comparing donation dates to current month/year.
  - `urgentNeeds` as blood types with count < 5.
- Caches stats for 3 minutes and returns the computed object.

Backend expectations: `/users/` should return an array of user objects with properties `blood_type` and optionally `donations` array with `date` fields.

4) getUpcomingDrives()
- The client currently returns `[]` and logs if the endpoint isn't implemented. This is a placeholder for future backend implementation.

---

Exported client

- export const api = new ApiClient();

This is the single `api` instance used by the frontend.

---

If you'd like, I can also:
- produce a line-by-line annotated copy of `src/lib/api.js` where each actual code line is shown and followed by an explanation comment, or
- generate unit test scaffolding for the token refresh flow.

Tell me which you prefer next.