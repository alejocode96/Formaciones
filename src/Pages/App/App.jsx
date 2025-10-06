import { useEffect } from "react";
import { BrowserRouter, useRoutes } from 'react-router-dom';
import React from 'react'

//Animaciones
import AOS from "aos";
import "aos/dist/aos.css";

//contexto
import { TrainingLogiTransProvider } from '../../Context';

//pages
import Home from '../Home';
const AppRoutes = () => {
  let routes = useRoutes([
    { path: '/', element: <Home /> }
  ]);
  return routes
}
function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <TrainingLogiTransProvider>
        <BrowserRouter basename="/Formaciones">
          <AppRoutes ></AppRoutes>
        </BrowserRouter>
      </TrainingLogiTransProvider>
    </>
  )
}

export default App
