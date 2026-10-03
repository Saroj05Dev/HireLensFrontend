import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes";
import { useAppDispatch } from "./store/hooks";
import { fetchMe } from "./features/auth/authSlice";
import { ToastProvider } from "./components/ui/Toast";

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastProvider />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;