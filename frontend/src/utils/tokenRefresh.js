import api from '../../services/api'
import { store } from '../store/store.js'
import ms from 'ms'

const envExpiry = import.meta.env.VITE_ACCESS_TOKEN_EXPIRY || '30m';
const ACCESS_TOKEN_EXPIRY = ms(envExpiry); 
const REFRESH_BEFORE = 30 * 1000

let refreshTimer = null

export const scheduleTokenRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer)

    refreshTimer = setTimeout(async () => {
        try {
            await api.post('/auth/refresh')
            console.log('Token refreshed proactively')
            scheduleTokenRefresh()
        } catch (error) {
            store.dispatch({ type: 'auth/logout' })
        }
    }, ACCESS_TOKEN_EXPIRY - REFRESH_BEFORE)
}

export const clearTokenRefresh = () => {
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }
}