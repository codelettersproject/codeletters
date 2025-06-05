import { useSelector } from "react-redux";
import { createSlice } from "@reduxjs/toolkit";


export type AppState = {
  isSidebarOpen: boolean;
};


export const appStateSlice = createSlice({
  name: "AppState",
  initialState: {
    isSidebarOpen: false,
  },
  reducers: {
    setIsSidebarOpen(state, { payload }) {
      if(typeof payload === "boolean") {
        state.isSidebarOpen = payload;
      }
    },
  },
});


export const { setIsSidebarOpen } = appStateSlice.actions;

export function useAppState(): AppState {
  return useSelector<any, AppState>(s => s.appState);
}


export default appStateSlice.reducer;
