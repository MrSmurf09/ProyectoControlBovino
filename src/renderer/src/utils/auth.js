import { jwtDecode } from 'jwt-decode'

export function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token)
    console.log('Decoded token:', decoded)
    const now = Date.now() / 1000 // en segundos
    return decoded.exp > now
  } catch (error) {
    console.error('Error decoding token:', error)
    return false
  }
}
