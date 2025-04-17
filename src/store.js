import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "./services/userApi";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaulftMiddleware) =>
    getDefaulftMiddleware().concat(userApi.middleware),
});

setupListeners(store.dispatch);
