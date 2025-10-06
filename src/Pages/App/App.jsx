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

// Inicializar AOS una sola vez fuera del componente
AOS.init({
  duration: 1000,
  once: true,
  offset: 0, // Cambiar a 0 para que detecte elementos apenas aparecen
  easing: 'ease-out-cubic',
  mirror: false, // No animar al hacer scroll hacia arriba
  anchorPlacement: 'top-bottom', // Animar cuando el top del elemento toca el bottom del viewport
});

const AppRoutes = () => {
  let routes = useRoutes([
    { path: '/', element: <Home /> }
  ]);
  return routes
}
function App() {


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
