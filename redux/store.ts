import { configureStore } from "@reduxjs/toolkit";

import appStateSlice from "./features/appState";


export default configureStore({
  reducer: {
    appState: appStateSlice,
  },
});
