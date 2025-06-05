import React from "react";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { Provider as ReduxProvider } from "react-redux";

import store from "@/redux/store";
import { AuthProvider } from "@/context/auth";

import "@/styles/App.scss";
import "@/styles/boxicons/boxicons.min.css";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ReduxProvider store={store}>
        <ToastContainer
          theme="dark"
          position="top-right"
          toastStyle={{ backgroundColor: "var(--surface-color)", color: "var(--text-color)" }}
          autoClose={4250}
          draggable
          newestOnTop
          draggableDirection="x"
          pauseOnFocusLoss
          hideProgressBar
          closeOnClick
          pauseOnHover
        />
        <Component {...pageProps} />
      </ReduxProvider>
    </AuthProvider>
  );
}
