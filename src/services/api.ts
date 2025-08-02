import axios from 'axios'
import { API_BASE_URL } from '@/lib/utils'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - JWT token'ı header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Token expire olduğunda yönlendir
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expire - kullanıcıyı logout et
      Cookies.remove('authToken')
      Cookies.remove('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 