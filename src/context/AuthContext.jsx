import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, endSession, getRole, getToken, onSessionChange, setSession } from '../api/client'
import { isDemoAccount } from '../assets/assets'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getToken())
    const [role, setRole] = useState(getRole())
    const [profile, setProfile] = useState(null)

    const refetchProfile = useCallback(async () => {
        if (!getToken()) {
            setProfile(null)
            return
        }
        try {
            const data = await api.get('/users/me')
            setProfile(data)
        } catch {
            setProfile(null)
        }
    }, [])

    useEffect(() => {
        refetchProfile()
    }, [refetchProfile, token])

    // The api layer silently swaps an expired access token for a fresh one (and
    // clears the session when the 20-day refresh token is gone too) — mirror
    // whatever it ends up with.
    useEffect(() => onSessionChange(({ token: nextToken, role: nextRole }) => {
        setToken(nextToken)
        setRole(nextRole)
        if (!nextToken) setProfile(null)
    }), [])

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        setSession(res.access_token, res.role, res.refresh_token)
        setToken(res.access_token)
        setRole(res.role)
        return res
    }, [])

    const logout = useCallback(() => {
        // revokes the refresh token server side; the local session is dropped
        // straight away either way
        endSession()
        setToken(null)
        setRole(null)
        setProfile(null)
    }, [])

    const markPasswordChanged = useCallback(() => {
        setProfile((p) => (p ? { ...p, mustChangePassword: false } : p))
    }, [])

    const isDemo = isDemoAccount(profile?.email)

    const value = useMemo(() => ({
        token,
        role,
        profile,
        isDemo,
        isAuthenticated: !!token,
        // demo accounts keep their published password, so they are never asked
        // to replace it — that prompt would be a dead end for them
        mustChangePassword: !isDemo && !!profile?.mustChangePassword,
        login,
        logout,
        markPasswordChanged,
        refetchProfile,
    }), [token, role, profile, isDemo, login, logout, markPasswordChanged, refetchProfile])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
    return ctx
}
