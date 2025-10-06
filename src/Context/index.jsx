import React, { useState, useEffect } from 'react';

const TrainingLogiTransContext = React.createContext();

function TrainingLogiTransProvider({ children }) {
    return (
        <TrainingLogiTransContext.Provider value={{
           
        }}>
            {children}
        </TrainingLogiTransContext.Provider>
    )
}

export { TrainingLogiTransContext, TrainingLogiTransProvider };