import { useEffect } from "react";
import { BrowserRouter, useRoutes } from 'react-router-dom';
import React from 'react'


//Animaciones
import AOS from "aos";
import "aos/dist/aos.css";

//contexto
import { TrainingLogiTransProvider } from '../../Context';
import ScrollToTop from "../../Components/Home/ScrollToTop";


// Inicializar AOS una sola vez fuera del componente
AOS.init({
  duration: 1000,
  once: true,
  offset: 0, // Cambiar a 0 para que detecte elementos apenas aparecen
  easing: 'ease-out-cubic',
  mirror: false, // No animar al hacer scroll hacia arriba
  anchorPlacement: 'top-bottom', // Animar cuando el top del elemento toca el bottom del viewport
});




//pages
import Home from '../Home';
import Training from "../Training";
import LayoutWithHeader from "../../Components/Home/header";
import ModulePage from "../Module";

const AppRoutes = () => {
  let routes = useRoutes([
    {
      element: <LayoutWithHeader />, // Layout con header
      children: [
        { path: '/', element: <Home /> },
        { path: '/training/:courseId', element: <Training /> },
      ]
    },
    // Rutas sin header
    { path: '/training/:courseId/module/:moduleId', element: <ModulePage /> }
    // { path: '/modules', element: <Modules /> },
    // { path: '/training/:courseId/module/:moduleId', element: <Modules /> },

  ]);
  return routes
}
function App() {


  return (
    <>
     

      <BrowserRouter basename="/Formaciones">
        <TrainingLogiTransProvider>
          <ScrollToTop />
          <AppRoutes ></AppRoutes>
        </TrainingLogiTransProvider>
      </BrowserRouter>
    </>
  )
}

export default App
