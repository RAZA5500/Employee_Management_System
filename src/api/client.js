const LOCAL_API = "http://localhost:3000"
const DEPLOYED_API = "https://ems-backend-e8ie.onrender.com"

// Vite inlines VITE_BACKEND_URI at build time. When it is missing (the host
// never had it set), fall back by where the app is actually running: a
// deployed build pointing at localhost would ask every visitor's own machine
// for the API, which fails for all of them.
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname)

const BASE_URL =
    import.meta.env.VITE_BACKEND_URI || (isLocalHost ? LOCAL_API : DEPLOYED_API)
const TOKEN_KEY = "ems_token"
const ROLE_KEY = "ems_role"
const REFRESH_TOKEN_KEY = "ems_refresh_token"

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function getRole() {
    return localStorage.getItem(ROLE_KEY)
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setSession(token, role, refreshToken) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    notifySessionChange()
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    notifySessionChange()
}

// The access token lives an hour, so it can be swapped underneath a running
// app (or dropped when the refresh token is gone too). React state that mirrors
// the session subscribes here instead of re-reading localStorage on a timer.
const sessionListeners = new Set()

export function onSessionChange(listener) {
    sessionListeners.add(listener)
    return () => sessionListeners.delete(listener)
}

function notifySessionChange() {
    const session = { token: getToken(), role: getRole() }
    sessionListeners.forEach((listener) => listener(session))
}

// Several requests can hit an expired access token at once; they all wait on
// the same refresh call rather than racing to spend the (single-use) refresh
// token, which would log the user out.
let refreshPromise = null

async function refreshSession() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    refreshPromise = refreshPromise || (async () => {
        try {
            const res = await fetch(BASE_URL + "/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            if (!res.ok) throw new Error("Session expired")

            const data = await res.json()
            setSession(data.access_token, data.role, data.refresh_token)
            return data.access_token
        } catch {
            // refresh token expired (20 days), revoked, or already used
            clearSession()
            return null
        } finally {
            refreshPromise = null
        }
    })()

    return refreshPromise
}

/** Signs out server side too, so the refresh token can never be redeemed again. */
export async function endSession() {
    const refreshToken = getRefreshToken()
    clearSession()

    if (!refreshToken) return

    try {
        await fetch(BASE_URL + "/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })
    } catch {
        // the local session is already gone; the token expires on its own
    }
}

function buildUrl(path, params) {
    const url = new URL(BASE_URL + path)
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, value)
            }
        })
    }
    return url
}

async function request(path, { method = "GET", body, params, retryOnExpiry = true } = {}) {
    const token = getToken()
    const headers = { "Content-Type": "application/json" }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    // Expired access token: trade the refresh token for a new one and replay
    // the request once, so the hourly expiry is invisible to the user.
    if (res.status === 401 && retryOnExpiry && token && getRefreshToken()) {
        const newToken = await refreshSession()
        if (newToken) {
            return request(path, { method, body, params, retryOnExpiry: false })
        }
    }

    const isJson = res.headers.get("content-type")?.includes("application/json")
    const data = isJson ? await res.json().catch(() => null) : null

    if (!res.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message
        throw new Error(message || `Request failed with status ${res.status}`)
    }

    return data
}

export const api = {
    get: (path, params) => request(path, { method: "GET", params }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    del: (path) => request(path, { method: "DELETE" }),
}
