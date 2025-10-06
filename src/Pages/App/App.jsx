import { useState } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom';
import React from 'react'

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
