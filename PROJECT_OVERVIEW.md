# Blood Bank Frontend — Deep Dive (root → functions)

This document is a precise, function-level guide. It explains the app starting at the root, then walks through the most important files and every main function or event handler a beginner will need to understand to confidently read and change the code.

Suggested reading order:
- Start: `src/main.jsx` → `src/App.jsx` → `components/Layout` and `Navbar`
- Auth: `src/contexts/AuthContext.jsx` + `ProtectedRoute.jsx`
- API: `src/lib/api.js` (most important - read fully)
- Dashboard: `src/hooks/useDashboardData.js` → `src/pages/Dashboard.jsx`
- Donors: `src/components/Donors/*` → `src/pages/AllDonors.jsx`
- Utilities: `src/utils/*` and `src/lib/utils.js`

If you'd like a shorter version after this deep dive, tell me which file to compress.

---

## Root files and app boot

### `src/main.jsx`
- Purpose: app entry. Mounts the React tree and provides global providers.
- What happens, step-by-step:
  1. Reads `VITE_BASE_PATH` (optional) for `BrowserRouter` basename.
  2. Creates React root with `ReactDOM.createRoot(document.getElementById('root'))`.
  3. Wraps `<App />` with `BrowserRouter`, `DashboardRefreshProvider`, and `AuthProvider` in that order.
  4. Why order matters: `DashboardRefreshProvider` is above `AuthProvider` so dashboard-refresh hooks are available during auth actions (login/signup triggers refresh handlers).

### `src/App.jsx`
- Purpose: route definitions and top-level wiring.
- Key points:
  - `App` returns `<Routes>` with `Route` entries for each page.
  - Public routes (/, /login, /signup) use `Layout` directly.
  - Protected routes (e.g., /dashboard, /all-donors) use `ProtectedRoute` which checks `AuthContext`.
  - Each route often wraps page content with `Layout` to provide the navbar/layout consistently.

Why `ProtectedRoute` is used: it centralizes access control and keeps individual pages focused on rendering only.

---

## Layout and Navigation

### `src/components/Layout/Layout.jsx`
- Exports `Layout` functional component.
- Behavior:
  - Renders `Navbar` then `<main>{children}</main>`.
  - Presentational wrapper used across pages.

### `src/components/Layout/Navbar.jsx`
- Responsibilities:
  - Shows branding and navigation links.
  - Reads `user` and `logout` from `useAuth()`.
  - Renders different actions for authenticated vs unauthenticated users.
- Key local state: `const [isOpen, setIsOpen] = useState(false)` for mobile menu.
- Important handlers:
  - Mobile toggle: `onClick={() => setIsOpen(!isOpen)}`.
  - Logout button: calls `logout()` from `AuthContext`.
- Accessibility: includes `aria-label` and `sr-only` strings for screen readers.

Note: `Navbar` must be inside `AuthProvider` to use `useAuth()` safely.

---

## Authentication (AuthContext) — every function explained

File: `src/contexts/AuthContext.jsx`

Exports: `AuthProvider` and `useAuth()`.

Internal state:
- `user` — profile object or `null`.
- `loading` — `boolean` to show initial auth-check state.

Functions and flow:

1) `useAuth()`
- Hook that returns the context value. Throws if used outside `AuthProvider`.

2) `AuthProvider` component
- Initializes `user` and `loading` state and calls `checkAuthStatus()` on mount.

3) `checkAuthStatus = async () => { ... }`
- Purpose: restore user if access token persisted.
- Steps:
  - Reads token: `localStorage.getItem('accessToken')`.
  - If token present: calls `api.getCurrentUser()`.
  - On success: `setUser(userData)`.
  - On failure: `localStorage.removeItem('accessToken')`.
  - Finally: `setLoading(false)`.

4) `login = async (username, password)`
- Purpose: perform login, store token, fetch profile, and trigger dashboard refresh.
- Steps:
  - Calls `api.login(username, password)` which performs a form POST.
  - After success, `api.login` stores token in `localStorage` (see `api.login` implementation).
  - Calls `api.getCurrentUser()` to obtain profile object and `setUser(userData)`.
  - Calls `dashboardRefresh.refreshAfterLogin()` if DashboardRefresh context exists.
  - Returns user data.

5) `signup = async (userData)`
- Purpose: register new user and auto-login.
- Steps:
  - Calls `api.signup(userData)` (client adds `confirm_password` field automatically).
  - On success calls `login(...)` with provided credentials.
  - Triggers `dashboardRefresh.refreshAfterSignup()`.

6) `logout = async () => { ... }`
- Purpose: end session.
- Steps:
  - Calls `api.logout()` (best-effort to inform backend to clear refresh cookie/session).
  - Removes `accessToken` from `localStorage`.
  - Calls `setUser(null)`.

7) `updateUser(updatedData)`
- Purpose: update profile on backend and refresh local `user` state.
- Steps:
  - Calls `api.updateUser(updatedData)`.
  - On success `setUser(response)` and calls dashboard refresh for profile update.

Why these are important: other components call `useAuth()` to read `user` and to call `login`, `logout`, or `updateUser`.

---

## API client — the critical file (line-by-line intent)

File: `src/lib/api.js` — exported instance `export const api = new ApiClient();`

Class: `ApiClient` has the following fields:
- `baseURL` — from `VITE_API_URL` or default `http://localhost:8000`.
- `isRefreshing` — `boolean` guard so only one /refresh runs at a time.
- `failedQueue` — `Array` of pending request resolvers while refresh runs.

Important helper: `apiCache` from `src/utils/cache.js` is used by some larger GET helpers to reduce backend load.

Main methods explained:

### `processQueue(error, token = null)`
- Purpose: unblock requests queued while a refresh was running.
- Implementation:
  - For each queued item `{ resolve, reject }` call `reject(error)` if `error` truthy; otherwise call `resolve(token)`.
  - Clear `failedQueue`.

### `async request(endpoint, options = {})`
- Purpose: centralized fetch wrapper that:
  - attaches Authorization header if access token exists,
  - sends `credentials: 'include'` to let backend see refresh cookie,
  - handles 401 by trying a token refresh,
  - logs via helper functions, and
  - consistently parses JSON or text responses.

Step-by-step behavior:
1. Build `url = this.baseURL + endpoint`.
2. Read `token` from `localStorage.getItem('accessToken')`.
3. Build `config` including headers and credentials.
4. `logApiRequest(endpoint, method, details)` for structured logging.
5. `const response = await fetch(url, config)`.
6. If `response.status === 401` and endpoint not '/login' or '/refresh':
   - If `this.isRefreshing` is true:
     - Return new Promise that pushes `{ resolve, reject }` into `failedQueue`. The promise `.then()` will retry the original request once the refresh completes.
   - Else: set `this.isRefreshing = true` and call `this.refreshToken()`.
     - If `refreshToken()` returns new token: call `this.processQueue(null, refreshedToken)`, update the Authorization header, retry the original `fetch`, and return parsed result.
     - If refresh fails: call `this.processQueue(new Error('Token refresh failed'), null)`, remove `accessToken`, and redirect to `/login`.
7. Log response via `logApiResponse(...)`.
8. If response not ok: read response text, construct `Error` with status and text, `logApiError(...)`, and `throw`.
9. Parse response body: if content-type contains `application/json` return `await response.json()` else `await response.text()`.
10. `catch` block: if network `TypeError` containing 'fetch' then wrap into friendly `Cannot connect to server` error message; otherwise rethrow.

Why this flows matter: any `api.getX()` call goes through `request()` and benefits from this centralized token refresh queue and logging.

### `async login(username, password)`
- Purpose: perform login using `application/x-www-form-urlencoded` form body for FastAPI compatibility.
- Behavior:
  - Build `URLSearchParams` with `username`, `password`.
  - `fetch(this.baseURL + '/login', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, credentials: 'include', body: formData })`.
  - If response not ok: read JSON with error details and throw.
  - On success: parse JSON, store `localStorage.setItem('accessToken', data.access_token)`, and return data.

### `async signup(userData)`
- Purpose: register new user; client adds `confirm_password` to payload for backend validation.
- Behavior: `return this.request('/signup/', { method: 'POST', body: JSON.stringify(signupData) })`.

### `async refreshToken()`
- Purpose: call backend `/refresh` to get a new access token using refresh cookie.
- Behavior:
  - `fetch(this.baseURL + '/refresh', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'} })`.
  - If `response.ok` parse JSON and store `data.access_token` to `localStorage` and return it.
  - If not ok: log a warning and return `false`.
  - Catch errors and return `false`.

### `async logout()`
- Purpose: call backend logout and clear stored token locally.
- Behavior: attempts to POST to `/logout` with `credentials: 'include'` and removes `accessToken` in finally.

### Convenience request methods
- `getCurrentUser()` → calls `/users/me/profile` using `request()`.
- `updateUser(userData)` → `PUT /users/me/profile` with JSON body.
- `getDonors(filters)` → requests `/users` or `/users?query`.
- `getDonorsByBloodGroup(bloodGroup)`, `getDonorById(id)`, `searchDonors(searchParams)` → wrappers for corresponding endpoints.

### Dashboard helpers in `api`
- `getUserDashboardData()`:
  - Checks `apiCache.get('user-dashboard-data')`.
  - If cached return it.
  - Else call `this.request('/users/me/profile')`, transform with `transformUserData()`, cache for 2 minutes, return.
- `getUserDonations()`:
  - Checks `apiCache` for `user-donations`.
  - If not present, fetch profile and use `profile.donations` (cache 5 minutes).
- `getBloodBankStats()`:
  - Fetch `/users/` (all users), compute `bloodTypeCount`, `totalDonations`, `donationsThisMonth`, `urgentNeeds`, cache results for 3 minutes.

Important: this client expects the backend to set an HTTP-only refresh cookie. The client only stores the short-lived `accessToken` in `localStorage`.

---

## In-memory cache (detailed)

File: `src/utils/cache.js`

Class `Cache` implements a small TTL cache with methods:
- `set(key, value, ttl = 5*60*1000)` — stores value and sets a timer to delete after TTL.
- `get(key)` — returns value if not expired, else deletes and returns `null`.
- `has(key)` — `get(key) !== null`.
- `delete(key)` — removes and clears timer.
- `clear()` — clears all timers and entries.
- `getStats()` — returns details for debugging.
- `static createKey(...parts)` — build a predictable key from parts.

Exported: `apiCache` — a global instance used by API methods for caching.

Why it matters: `getUserDashboardData`, `getBloodBankStats`, and similar functions use this cache for performance and to reduce load.

---

## Dashboard logic (`useDashboardData`) — every significant function

File: `src/hooks/useDashboardData.js`

Purpose: manage all dashboard data fetches with robust state, retries, debouncing and auto-refresh logic.

Key state variables:
- `userData, donations, bloodBankStats, upcomingDrives` — main data sections.
- `loading`, `refreshing` — high-level flags.
- `sectionLoading` — per-section boolean map.
- `errors` — human-visible per-section messages.
- `errorDetails` — categorized error objects for developers.
- `retryAttempts` — track how many retry attempts happened per section.
- `partialDataLoaded` — true when some sections succeeded while others failed.

Main helpers and functions:

### `retryApiCall(apiCall, sectionName, maxRetries = 3)`
- Purpose: a generic retry wrapper that:
  - avoids retries when offline,
  - uses `shouldRetry(error, attempt, maxRetries)` to decide retryability,
  - waits `calculateRetryDelay(attempt)` between attempts,
  - records `errorDetails` when final failure occurs.
- Behavior:
  - Loop attempts 0..maxRetries; on success return result; on failure, if `shouldRetry` and online, wait and retry; else categorize error and throw.

### Per-section fetchers (useCallback):
- `fetchUserData()` — calls `retryApiCall(() => api.getUserDashboardData(), 'userData')` and manages `sectionLoading.userData` and `errors.userData`.
- `fetchDonations()` — calls `api.getUserDonations()` via retry wrapper.
- `fetchBloodBankStats()` — calls `api.getBloodBankStats()` via retry wrapper.
- `fetchUpcomingDrives()` — calls `api.getUpcomingDrives()` (currently returns `[]` if backend lacks endpoint).

### `fetchDashboardDataInternal(isRefresh = false, isAutoRefresh = false)`
- Purpose: orchestrate sequential fetching with progress updates and avoid concurrent refreshes.
- Behavior:
  - If `isRefreshingRef.current` true → return early.
  - Mark either `refreshing` or `loading` depending on parameters.
  - Iterate through an ordered list of fetchers; for each update `currentLoadingStep` and `loadingProgress` then call the fetcher and capture success/failure.
  - After all, set `partialDataLoaded` if needed; set global `error` if critical section (userData) failed with no data; clear loading flags.

### Debounce + Auto-refresh
- `debouncedRefresh` wraps `fetchDashboardDataInternal` using `debounceAsync(..., 300)` to prevent rapid consecutive refreshes.
- `startAutoRefresh()` sets interval to call auto-refresh every 5 minutes.
- `handleWindowFocus()` triggers auto-refresh when window gains focus.
- On mount: calls `fetchDashboardData()` once and registers a refresh callback with `DashboardRefreshContext`.

Return value: the hook returns everything UI needs: the data sections, loading flags, section-specific loading, errors, retryAttempts, `fetchDashboardData` and `refreshDashboardData` functions, and auto-refresh controls.

Why this matters: the Dashboard UI uses these values to show skeletons, retry buttons, partial-loading banners, and status indicators.

---

## Dashboard page and components (how UI uses the hook)

File: `src/pages/Dashboard.jsx`

Responsibilities:
- Calls `useDashboardData()` and destructures needed values.
- Accessibility: announces loading/loaded/error via `liveAnnouncer`.
- Render branches:
  - If `loading` 🡒 show `DashboardSkeleton` and multi-step progress.
  - If `error` and no `userData` 🡒 show `DashboardError` with retry.
  - If `partialDataLoaded` 🡒 show yellow warning banner with `Retry All` and network status.
  - Otherwise render stat cards, donation history, and blood bank stats.
- Each rendered component receives `loading`, `error`, and `onRetry` props which typically call per-section fetchers like `fetchUserData` or `fetchDonations`.

Why read it: it demonstrates how to map hook state to UI and how to surface errors per-section while still showing available data.

---

## Donors: list and card (all functions)

Files:
- `src/components/Donors/DonorList.jsx`
- `src/components/Donors/DonorCard.jsx`
- `src/pages/AllDonors.jsx`

### DonorList important parts and functions:
- `DEFAULT_SEARCH_FILTERS` — default filter shape (`bloodType, location, radius, availableOnly`).
- `calculateDistance(lat1, lon1, lat2, lon2)` — Haversine formula prepared for real coords.
- `stableSearchFilters` — returns a stable merged object of external `searchFilters` and internal `internalFilters` using `useMemo`.
- `fetchDonors()` — calls `api.getDonors()`; sets `donors` and `filteredDonors`.
- Filtering `useEffect` — applies blood type, city substring, mock radius (randomized placeholder), and `availableOnly` (56-day rule) to build `filteredDonors`.
- `handleAvailabilityToggle()` — flips availableOnly and calls parent `onFilterChange` if provided.

Render logic:
- Show spinner true on `loading`.
- If `error` show error and retry button that calls `fetchDonors()`.
- Else map `filteredDonors` to `DonorCard` components.

### DonorCard helpers and handlers:
- `getDonorAvailability(lastDonationDate)` — returns `isAvailable`, `status`, `message`, and `badgeColor` based on 56-day rule.
- `getBloodTypeColor(bloodType)` — returns Tailwind class for color badge.
- `getLastDonationStatus(lastDonation)` — human readable and colored status.
- Action buttons `Call` and `Email` open `tel:` and `mailto:` links and are disabled when donor not available.

Why read these: shows client-side filtering, availability logic and how presentation reacts to data.

---

## Utilities (function-level list)

File: `src/lib/utils.js`
- `cn(...inputs)` — wrapper for combining class names using `clsx`.
- `formatDate(date)` / `formatDateTime(date)` — human-friendly formatting.
- `getDaysSince(date)` — days delta.
- `isEligibleToDonate(lastDonationDate)` — `getDaysSince(...) >= 56`.
- `getBloodTypeCompatibility(bloodType)` — returns array of compatible blood types.
- `validateEmail`, `validatePhone` — regex validators.
- `formatPhone` — attempts `(XXX) XXX-XXXX` formatting.
- `debounce` and `throttle` — simple implementations used across the app.
- `generateId()` — random id helper.

Other helper files in `src/utils/` include `debounce.js` and `errorHandling.js` that provide specialized wrappers used by `useDashboardData`.

---

## Common component wiring and events

- UI primitives in `src/components/ui/` (Button, Card, Skeleton) accept props like `variant`, `size`, `onClick`, `loading`, `error`.
- Pages listen to `AuthContext` and `DashboardRefreshContext` to react to login/signup/profile updates. For example, `AuthContext.login()` triggers `dashboardRefresh.refreshAfterLogin()`.

---

## Practical guide — where to change things

- API base URL: update `VITE_API_URL` env variable or modify `src/lib/api.js` default.
- Token storage mechanism: update `api.login()` and `refreshToken()`.
- Add a dashboard card: add a small `api` helper in `src/lib/api.js`, create a presentational component in `src/components/ui/`, and call the new API from `useDashboardData` or a new hook.
- Improve donor search: edit `src/components/Donors/DonorList.jsx` and replace mock radius with geo distance using `calculateDistance()` and real lat/lon.

---

## Troubleshooting checklist (function-focused)

- "Cannot connect to server": check `api.request()` catch block; ensure backend is running and `VITE_API_URL` matches.
- Login redirect loop: inspect `api.login()` and `AuthContext.checkAuthStatus()` — the token must be stored after login and `getCurrentUser()` must succeed.
- Token refresh race: inspect `isRefreshing` and `failedQueue` in `ApiClient`; queued requests wait until `refreshToken()` resolves.

---

## Next low-risk improvements (practical ideas)

- Replace mock distance filter with real geo-based calculations in `DonorList` using lat/lon.
- Add unit tests for `api.request()` and `refreshToken()` with mocked `fetch`.
- Add tests for `useDashboardData` behavior during partial network failures.

---

If you want, I can now:
- Produce a line-by-line annotated version of `src/lib/api.js` with in-place comments explaining each branch and expected backend responses; or
- Generate a test scaffold that covers token refresh and queued requests.

Tell me which file you'd like annotated next and I will produce it.
