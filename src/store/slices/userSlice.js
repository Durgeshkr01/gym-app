import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  membership: null,
  attendance: [],
  progress: [],
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setMembership: (state, action) => {
      state.membership = action.payload;
    },
    setAttendance: (state, action) => {
      state.attendance = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setProfile, setMembership, setAttendance, setProgress, setUserLoading } = userSlice.actions;
export default userSlice.reducer;
