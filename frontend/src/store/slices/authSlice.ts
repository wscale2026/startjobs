import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export type UserRole = 'employer' | 'candidate' | 'admin' | 'staff' | null;

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  employer_profile?: {
    id: number;
    company_name: string;
    address: string;
    phone: string;
    verified: boolean;
    verification_requested?: boolean;
    logo: string | null;
    industry?: string;
    city?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    recruits_per_month?: string;
    description?: string;
  };
  candidate_profile?: {
    id: number;
    bio: string;
    neighborhood: string;
    latitude?: number;
    longitude?: number;
    distance_max: number;
    score: number;
    total_missions: number;
    is_available: boolean;
    has_license: boolean;
    profile_type: string;
    photo: string | null;
    skills: Array<{ id: number; name: string }>;
    languages: Array<{ id: number; name: string }>;
    experiences: Array<{
      id: number;
      candidate?: number;
      title: string;
      employer_name: string;
      date: string;
      exp_type: string;
      rating: number;
      comment: string;
    }>;
  };
}

interface AuthState {
  user: User | null;
  role: UserRole;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const getInitialRole = (): UserRole => {
  const stored = localStorage.getItem('user_role');
  if (stored === 'employer' || stored === 'candidate' || stored === 'admin') {
    return stored as UserRole;
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  role: getInitialRole(),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    // 1. Get tokens
    const tokenRes = await api.post('token/', credentials);
    const { access, refresh } = tokenRes.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // 2. Fetch user profile
    const userRes = await api.get('users/me/');
    const user = userRes.data;
    if (!user.role && (user.is_superuser || user.is_staff)) {
      user.role = 'admin'; // Fallback just in case
    }
    return user;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      return rejectWithValue(error.response.data.detail);
    }
    return rejectWithValue('Erreur lors de la connexion');
  }
});

export const register = createAsyncThunk('auth/register', async (userData: any, { rejectWithValue }) => {
  try {
    // Clear existing tokens to ensure we don't use an old session
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // 1. Create account
    let payload = userData;
    let headers = {};
    if (userData.photoFile) {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('first_name', userData.first_name);
      formData.append('last_name', userData.last_name);
      formData.append('role', userData.role);
      formData.append('profile_data', JSON.stringify(userData.profile_data));
      formData.append('photo', userData.photoFile);
      payload = formData;
      // Do not manually set 'Content-Type': 'multipart/form-data' 
      // Axios sets it automatically with the correct boundary when passing FormData
    }

    await api.post('register/', payload, { headers });
    
    // 2. Login automatically
    const tokenRes = await api.post('token/', {
      username: userData.username,
      password: userData.password
    });
    const { access, refresh } = tokenRes.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // 3. Fetch profile
    const userRes = await api.get('users/me/');
    const user = userRes.data;
    if (!user.role && (user.is_superuser || user.is_staff)) {
      user.role = 'admin'; // Fallback just in case
    }
    return user;
  } catch (error: any) {
    const detail = error.response?.data?.detail || '';
    if (detail.toLowerCase().includes('vérifier') || detail.toLowerCase().includes('email')) {
      return rejectWithValue('REQUIRES_EMAIL_VERIFICATION');
    }
    
    return rejectWithValue(detail || 'Erreur lors de l\'inscription');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  if (!localStorage.getItem('access_token')) throw new Error('No token');
  const response = await api.get('users/me/');
  const user = response.data;
  if (!user.role && (user.is_superuser || user.is_staff)) {
    user.role = 'admin'; // Fallback just in case
  }
  return user;
});

export const requestPasswordReset = createAsyncThunk('auth/passwordReset', async (email: string) => {
  const response = await api.post('password_reset/', { email });
  return response.data;
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, role, userData, profileData, profileFile }: {
    userId: string | number;
    role: 'employer' | 'candidate';
    userData?: any;
    profileData?: any;
    profileFile?: File | null;
  }) => {
    // 1. If there's user data, update it
    if (userData && Object.keys(userData).length > 0) {
      await api.patch('users/me/', userData);
    }

    // 2. Prepare profile form data
    const formData = new FormData();
    if (profileData) {
      Object.keys(profileData).forEach(key => {
        const val = profileData[key];
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach(item => {
              if (typeof item === 'object') formData.append(key, JSON.stringify(item));
              else formData.append(key, item);
            });
          } else if (typeof val === 'object') {
            formData.append(key, JSON.stringify(val));
          } else {
            formData.append(key, val);
          }
        }
      });
    }
    if (profileFile) {
      formData.append(role === 'employer' ? 'logo' : 'photo', profileFile);
    }

    // 3. Update profile
    const endpoint = role === 'employer' ? `employers/${userId}/` : `candidates/${userId}/`;
    await api.patch(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // 4. Fetch the fully updated user profile again to sync Redux state
    const response = await api.get('users/me/');
    const user = response.data;
    if (user.is_superuser || user.is_staff) {
      user.role = 'admin';
    }
    return user;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      localStorage.removeItem('user_role');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.role = action.payload.role as UserRole;
        if (state.role) localStorage.setItem('user_role', state.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Login failed';
      })
      // REGISTER
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.role = action.payload.role as UserRole;
        if (state.role) localStorage.setItem('user_role', state.role);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      // FETCH CURRENT USER
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role as UserRole;
        if (state.role) localStorage.setItem('user_role', state.role);
      })
      // UPDATE PROFILE
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
