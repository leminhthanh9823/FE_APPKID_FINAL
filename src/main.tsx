import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { App } from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "boxicons/css/boxicons.min.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import "simple-datatables/dist/style.css";
import { LoadingProvider } from "./stores/contexts/LoadingContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </LoadingProvider>
  </QueryClientProvider>
);
