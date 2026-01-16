import { BrowserRouter } from 'react-router-dom'
import './App.css'
import AppRoutes from './routes'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react';
import { fetchMe } from './features/auth/authSlice';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
