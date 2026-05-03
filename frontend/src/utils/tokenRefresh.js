import api from '../../services/api'
import { store } from '../store/store.js'


const ACCESS_TOKEN_EXPIRY = 30 * 60 * 1000
const REFRESH_BEFORE = 2 * 60 * 1000

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
            window.location.href = '/login'
        }
    }, ACCESS_TOKEN_EXPIRY - REFRESH_BEFORE)
}

export const clearTokenRefresh = () => {
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }
}