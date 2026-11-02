import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../services/api'

function readSavedSession() {
  const token = sessionStorage.getItem('token')
  const savedUser = sessionStorage.getItem('user')

  if (!token || !savedUser) return { token: null, user: null }

  try {
    return { token, user: JSON.parse(savedUser) }
  } catch {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    return { token: null, user: null }
  }
}

const savedSession = readSavedSession()

function saveSession(session) {
  sessionStorage.setItem('token', session.token)
  sessionStorage.setItem('user', JSON.stringify(session.user))
  return session
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await apiRequest('/api/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      return saveSession(result.data)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (details, { rejectWithValue }) => {
    try {
      await apiRequest('/api/user/signup', {
        method: 'POST',
        body: JSON.stringify(details),
      })
      const result = await apiRequest('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: details.email,
          password: details.password,
        }),
      })
      return saveSession(result.data)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...savedSession,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.error = null
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to log in.'
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to create your account.'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
