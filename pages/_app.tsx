import React from "react";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

import "@/styles/App.scss";
import "@/styles/boxicons/boxicons.min.css";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastContainer
        position="top-right"
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
    </>
  );
}
