import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../services/api'

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (token, { rejectWithValue }) => {
    try {
      const result = await apiRequest('/api/user/mems', { token })
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await apiRequest(`/api/user/softdelete/${id}`, {
        method: 'DELETE',
        token,
      })
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to load people.'
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user._id !== action.payload)
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.error = action.payload || 'Unable to deactivate this account.'
      })
  },
})

export default usersSlice.reducer
