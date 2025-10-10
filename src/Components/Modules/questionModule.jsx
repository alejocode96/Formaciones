import React, { useState, useEffect,useRef } from 'react';
import { CheckCircle, XCircle, Send, RotateCcw } from 'lucide-react';
import { TrainingLogiTransContext } from '../../Context';

function QuestionModule({ question, answer, onContentIsEnded, onAttempt, onCorrectAnswer, isCompleted = false }) {
  const { } = React.useContext(TrainingLogiTransContext);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [localAttempts, setLocalAttempts] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  // 🔹 Barajar respuestas una sola vez al cargar la pregunta
  const respuestasIniciales = useRef([]);

  useEffect(() => {
    if (answer && answer.length > 0 && respuestasIniciales.current.length === 0) {
      respuestasIniciales.current = [...answer]
        .map((a) => ({ ...a }))
        .sort(() => Math.random() - 0.5);
      setShuffledAnswers(respuestasIniciales.current);
    }
  }, [answer]);



  // Encontrar la respuesta correcta dentro de las respuestas ya mezcladas
  const correctAnswerIndex = shuffledAnswers.findIndex(a => a.rsp === true);

  // Si el módulo ya está completado, mostrar la respuesta correcta automáticamente
  useEffect(() => {
    if (isCompleted && shuffledAnswers.length > 0) {
      setSelectedAnswer(correctAnswerIndex);
      setIsSubmitted(true);
      setShowFeedback(true);
    }
  }, [isCompleted, correctAnswerIndex, shuffledAnswers]);

  const handleSelectAnswer = (index) => {
    if (!isSubmitted && !isCompleted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null && !isCompleted) {
      const currentAttempt = localAttempts + 1;
      setLocalAttempts(currentAttempt);

      if (onAttempt) onAttempt();

      setIsSubmitted(true);
      setShowFeedback(true);

      if (selectedAnswer === correctAnswerIndex) {
        if (onCorrectAnswer) onCorrectAnswer(currentAttempt);

        setTimeout(() => {
          if (onContentIsEnded) onContentIsEnded();
        }, 2000);
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowFeedback(false);
  };

  const isCorrect = selectedAnswer === correctAnswerIndex;

  return (
    <div className='max-w-5xl mx-auto pt-8 pb-14 lg:mb-4' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
      {/* Pregunta */}
      <div className='mb-8'>
        <p className='text-xl md:text-2xl text-zinc-100 leading-relaxed font-medium text-center'>
          {question}
        </p>
      </div>

      {/* Opciones aleatorias */}
      <div className='space-y-4 mb-6'>
        {shuffledAnswers.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showCorrect = isSubmitted && isSelected && isCorrect;
          const showIncorrect = isSubmitted && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-300 border-2
                ${!isSubmitted && !isSelected ? 'bg-zinc-800/40 border-zinc-700/50 hover:border-blue-500/50 hover:bg-zinc-800/60' : ''}
                ${!isSubmitted && isSelected ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' : ''}
                ${showCorrect ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20' : ''}
                ${showIncorrect ? 'bg-red-900/30 border-red-500 shadow-lg shadow-red-500/20' : ''}
                ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'} group`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4 flex-1'>
                  {/* Letra de opción (A, B, C...) */}
                  <span className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0 
                    ${showCorrect ? 'bg-green-500 text-white' : ''}   
                    ${showIncorrect ? 'bg-red-500 text-white' : ''}  
                    ${isSelected && !isSubmitted ? 'bg-blue-500 text-white' : ''}  
                    ${!isSubmitted && !isSelected ? 'bg-zinc-700 text-zinc-300' : ''}  
                    ${isSubmitted && !isSelected ? 'bg-zinc-700 text-zinc-500' : ''}`}
                  >
                    {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                  </span>

                  <span className={`text-base md:text-lg font-medium 
                    ${!isSubmitted ? 'text-zinc-200' : ''}  
                    ${showCorrect ? 'text-green-100' : ''} 
                    ${showIncorrect ? 'text-red-100' : ''}  
                    ${isSubmitted && !isSelected ? 'text-zinc-500' : ''}`}
                  >
                    {option.opcion}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`mb-6 p-5 md:p-6 rounded-xl border-2 animate-fadeIn 
          ${isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}
        >
          <div className='flex items-start gap-4'>
            {isCorrect ? (
              <CheckCircle className='w-6 h-6 text-green-400 flex-shrink-0 mt-1' />
            ) : (
              <XCircle className='w-6 h-6 text-red-400 flex-shrink-0 mt-1' />
            )}
            <div>
              <h3 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-100' : 'text-red-100'}`}>
                {isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
              </h3>
              <p className={`text-sm ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>
                {isCorrect
                  ? isCompleted
                    ? 'Ya has completado este módulo exitosamente.'
                    : 'Excelente trabajo. Has respondido correctamente.'
                  : 'Esa no es la respuesta correcta. Revisa el material y vuelve a intentarlo.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null || isCompleted}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg 
            ${selectedAnswer !== null && !isCompleted
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-[1.02]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}`}
        >
          <Send className='w-5 h-5' />
          Enviar Respuesta
        </button>
      ) : (
        <>
          {isCorrect ? (
            <button
              disabled
              className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 bg-green-600 text-white opacity-75 cursor-not-allowed"
            >
              <CheckCircle className='w-5 h-5' />
              {isCompleted ? 'Módulo Completado' : 'Respuesta Correcta'}
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:scale-[1.02]"
            >
              <RotateCcw className='w-5 h-5' />
              Intentar Nuevamente
            </button>
          )}
        </>
      )}

      {/* Indicador de progreso */}
      {!isSubmitted && !isCompleted && (
        <p className='text-center text-sm text-zinc-500 mt-4'>
          {selectedAnswer !== null
            ? 'Revisa tu respuesta y haz clic en "Enviar Respuesta"'
            : 'Selecciona una opción para continuar'}
        </p>
      )}
    </div>
  );
}

export default QuestionModule;
