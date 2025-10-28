import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, X, Download, ExternalLink } from 'lucide-react';
import { TrainingLogiTransContext } from '../../Context';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../../assets/logitranslogo.png';

function QuizFinal({ currentModule, onContentIsEnded, courseId, moduleId, XCircle }) {

    const navigate = useNavigate();
    const [quizState, setQuizState] = useState('intro');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const [hasExistingProgress, setHasExistingProgress] = useState(false);
    const questionTextRef = useRef(null);
    const [questionHeight, setQuestionHeight] = useState(0);
    const [quizResults, setQuizResults] = useState(null);

    const { getCourseById, getUserProgressForCourse } = React.useContext(TrainingLogiTransContext);


    // Obtener el progreso del localStorage
    const getQuizProgress = () => {
        try {
            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            const courseProgress = userProgress[courseId];
            if (courseProgress && courseProgress.quizProgress) {
                const quizKey = `course_${courseId}`;
                const moduleKey = `module_${moduleId}`;
                return courseProgress.quizProgress[quizKey]?.[moduleKey] || null;
            }
            return null;
        } catch (error) {
            console.error('Error al leer quizProgress:', error);
            return null;
        }
    };

    // Guardar el progreso en localStorage
    const saveQuizProgress = (questions, answers, results = null) => {
        try {
            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            const courseProgress = userProgress[courseId] || {};

            if (!courseProgress.quizProgress) {
                courseProgress.quizProgress = {};
            }

            const quizKey = `course_${courseId}`;
            const moduleKey = `module_${moduleId}`;

            if (!courseProgress.quizProgress[quizKey]) {
                courseProgress.quizProgress[quizKey] = {};
            }

            // Guardar las preguntas, respuestas y resultados
            courseProgress.quizProgress[quizKey][moduleKey] = {
                questions: questions,
                answers: answers,
                results: results,
                timestamp: new Date().toISOString()
            };

            userProgress[courseId] = courseProgress;
            localStorage.setItem('userProgress', JSON.stringify(userProgress));
        } catch (error) {
            console.error('Error al guardar quizProgress:', error);
        }
    };

    // Borrar el progreso del quiz
    const clearQuizProgress = () => {
        try {
            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            const courseProgress = userProgress[courseId];

            if (courseProgress && courseProgress.quizProgress) {
                const quizKey = `course_${courseId}`;
                const moduleKey = `module_${moduleId}`;

                if (courseProgress.quizProgress[quizKey]) {
                    delete courseProgress.quizProgress[quizKey][moduleKey];
                }

                userProgress[courseId] = courseProgress;
                localStorage.setItem('userProgress', JSON.stringify(userProgress));
            }
        } catch (error) {
            console.error('Error al borrar quizProgress:', error);
        }
    };

    // Verificar si hay progreso existente al cargar
    useEffect(() => {
        const existingProgress = getQuizProgress();
        if (existingProgress && existingProgress.questions && existingProgress.questions.length > 0) {
            setHasExistingProgress(true);

            // Si ya hay resultados guardados, mostrar la vista de resultados
            if (existingProgress.results) {
                setQuizQuestions(existingProgress.questions);
                setUserAnswers(existingProgress.answers || {});
                setQuizResults(existingProgress.results);

            }
        }
    }, [courseId, moduleId]);

    // Calcular altura de la pregunta
    useEffect(() => {
        if (questionTextRef.current && quizState === 'taking') {
            setQuestionHeight(questionTextRef.current.offsetHeight);
        }
    }, [currentQuestionIndex, quizState, quizQuestions]);

    // Generar o cargar preguntas del quiz
    useEffect(() => {
        console.log('currentModule:', currentModule);

        let questionGroups = null;

        if (currentModule?.questions) {
            questionGroups = currentModule.questions;
        } else if (Array.isArray(currentModule)) {
            questionGroups = currentModule;
        }

        console.log('questionGroups:', questionGroups);

        if (questionGroups && questionGroups.length > 0) {
            // Verificar si ya hay progreso guardado
            const existingProgress = getQuizProgress();

            if (existingProgress && existingProgress.questions && existingProgress.questions.length > 0) {
                // Cargar preguntas y respuestas existentes
                console.log('Cargando progreso existente:', existingProgress);
                setQuizQuestions(existingProgress.questions);
                setUserAnswers(existingProgress.answers || {});
                setEstimatedTime(Math.ceil(existingProgress.questions.length * 1.5));
            } else {
                // Generar nuevas preguntas
                const generatedQuestions = generateQuizQuestions(questionGroups);
                console.log('generatedQuestions:', generatedQuestions);
                setQuizQuestions(generatedQuestions);
                setEstimatedTime(Math.ceil(generatedQuestions.length * 1.5));
            }
        }
    }, [currentModule]);

    // Función para generar preguntas del quiz
    const generateQuizQuestions = (questionGroups) => {
        const selectedQuestions = [];

        questionGroups.forEach((group) => {
            console.log('Processing group:', group);

            if (group.multipleOption === false) {
                const randomIndex = Math.floor(Math.random() * group.preguntas.length);
                const randomQuestion = group.preguntas[randomIndex];
                selectedQuestions.push({
                    ...randomQuestion,
                    etiqueta: group.etiqueta,
                    respuestas: shuffleArray([...randomQuestion.respuestas])
                });
            } else {
                if (group.preguntas.length > 0) {
                    selectedQuestions.push({
                        ...group.preguntas[0],
                        etiqueta: group.etiqueta,
                        respuestas: shuffleArray([...group.preguntas[0].respuestas])
                    });
                }
                if (group.preguntas.length > 1) {
                    const remainingQuestions = group.preguntas.slice(1);
                    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
                    const randomQuestion = remainingQuestions[randomIndex];
                    selectedQuestions.push({
                        ...randomQuestion,
                        etiqueta: group.etiqueta,
                        respuestas: shuffleArray([...randomQuestion.respuestas])
                    });
                }
            }
        });

        return selectedQuestions;
    };

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Comenzar quiz
    const startQuiz = () => {
        const existingProgress = getQuizProgress();

        // Si ya hay resultados, mostrar la vista de resultados
        if (existingProgress && existingProgress.results) {
            setQuizState('submitted');
            return;
        }

        if (!existingProgress || !existingProgress.questions) {
            // Primera vez: Inicializar todas las preguntas como "sin respuesta"
            const initialAnswers = {};
            quizQuestions.forEach((_, index) => {
                initialAnswers[index] = null;
            });

            // Guardar en localStorage
            saveQuizProgress(quizQuestions, initialAnswers);
            setUserAnswers(initialAnswers);
        }

        setQuizState('taking');
    };

    // Manejar selección de respuesta
    const handleSelectAnswer = (answerIndex) => {
        if (quizState === 'taking') {
            const newAnswers = {
                ...userAnswers,
                [currentQuestionIndex]: answerIndex
            };
            setUserAnswers(newAnswers);

            // Guardar inmediatamente en localStorage
            saveQuizProgress(quizQuestions, newAnswers);
        }
    };

    // Navegación
    const goToNextQuestion = () => {
        // Validar que haya seleccionado una respuesta
        if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
            setShowWarningPopup(true);
            setTimeout(() => setShowWarningPopup(false), 3000);
            return;
        }

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Ir a revisión antes de enviar
    const goToReview = () => {
        // Validar que haya seleccionado una respuesta
        if (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === undefined) {
            setShowWarningPopup(true);
            setTimeout(() => setShowWarningPopup(false), 3000);
            return;
        }

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
        setQuizState('reviewing');
    };

    // Cambiar respuesta desde la revisión
    const changeAnswer = (index) => {
        setCurrentQuestionIndex(index);
        setQuizState('taking');
    };

    const submitQuiz = () => {
        const results = calculateResults();
        setQuizResults(results);

        // Guardar los resultados en localStorage
        saveQuizProgress(quizQuestions, userAnswers, results);

        setQuizState('submitted');

        if (onContentIsEnded) {
            onContentIsEnded(results);
        }
    };

    const calculateResults = () => {
        let correctCount = 0;
        const detailedResults = [];

        quizQuestions.forEach((question, index) => {
            const userAnswerIndex = userAnswers[index];
            const userAnswer = question.respuestas[userAnswerIndex];
            const correctAnswer = question.respuestas.find(r => r.rsp === true || r.correcta === true);
            const isCorrect = userAnswer && (userAnswer.rsp === true || userAnswer.correcta === true);

            if (isCorrect) correctCount++;

            detailedResults.push({
                question: question.name,
                etiqueta: question.etiqueta,
                userAnswer: userAnswer?.opcion || 'Sin respuesta',
                correctAnswer: correctAnswer?.opcion,
                isCorrect
            });
        });

        const percentage = (correctCount / quizQuestions.length) * 100;
        const passed = percentage >= 90;

        return {
            correctCount,
            incorrectCount: quizQuestions.length - correctCount,
            totalQuestions: quizQuestions.length,
            percentage: percentage.toFixed(1),
            passed,
            detailedResults
        };
    };

    // Reintentar quiz
    const retryQuiz = () => {
        // Borrar todo el progreso del quiz
        clearQuizProgress();

        // Generar nuevas preguntas
        let questionGroups = currentModule?.questions || currentModule;
        const newQuestions = generateQuizQuestions(questionGroups);

        // Resetear todo el estado
        setQuizQuestions(newQuestions);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setQuizState('intro');
        setQuizResults(null);
        setHasExistingProgress(false);
        setEstimatedTime(Math.ceil(newQuestions.length * 1.5));
    };

    // EN TU COMPONENTE QuizFinal.jsx

    // Función auxiliar para crear el HTML del certificado
    // const createCertificateHTML = (data) => {
    //     return `
    //     <div style="
    //         width: 1122px;
    //         height: 794px;
    //         background-color: white;
    //         position: relative;
    //         font-family: Arial, sans-serif;
    //     ">
    //         <!-- Marca de agua superior izquierda -->
    //         <div style="
    //             position: absolute;
    //             top: 30px;
    //             left: 30px;
    //             opacity: 0.05;
    //             pointer-events: none;
    //         ">
    //             <img 
    //                 src="${logo}"
    //                 style="width: 384px; height: 384px; object-fit: contain; filter: grayscale(100%);"
    //                 alt="Watermark"
    //             />
    //         </div>

    //         <!-- Marca de agua inferior derecha -->
    //         <div style="
    //             position: absolute;
    //             bottom: 30px;
    //             right: 30px;
    //             opacity: 0.05;
    //             pointer-events: none;
    //         ">
    //             <img 
    //                 src="${logo}"
    //                 style="width: 384px; height: 384px; object-fit: contain; filter: grayscale(100%);"
    //                 alt="Watermark"
    //             />
    //         </div>

    //         <!-- Borde del certificado -->
    //         <div style="
    //             position: absolute;
    //             inset: 15px;
    //             border: 8px solid black;
    //         "></div>

    //         <!-- Contenido del certificado -->
    //         <div style="
    //             position: relative;
    //             height: 100%;
    //             display: flex;
    //             flex-direction: column;
    //             justify-content: space-between;
    //             padding: 45px 60px;
    //         ">
    //             <!-- Header con logo -->
    //             <div style="text-align: center; margin-top: 20px;">
    //                 <div style="margin-bottom: 30px; display: flex; justify-content: center; align-items: center;">
    //                     <img src="${logo}" style="height:68px; width:64px;" />
    //                 </div>


    //                 <p style="font-size: 16px; color: #666; margin-bottom: 8px;">Certifica a</p>
    //                 <h1 style="
    //                     font-size: 36px;
    //                     font-weight: bold;
    //                     color: black;
    //                     margin-bottom: 0px;
    //                     letter-spacing: 2px;
    //                     text-transform: uppercase;
    //                 ">
    //                     ${data.studentName}
    //                 </h1>
    //                 <p style="font-size: 16px; color: #666; margin-bottom: 30px;"> C.C ${data.studentDocument}</p>
    //                 <p style="font-size: 16px; color: #666; margin-bottom: 4px;">Por participar y aprobar el</p>
    //                 <p style="font-size: 20px; color: #333; margin-bottom: 8px;">CURSO DE</p>
    //                 <h2 style="font-size: 48px; font-weight: bold; color: black; margin-bottom: 30px;">
    //                     ${data.courseName}
    //                 </h2>
    //             </div>

    //             <!-- Footer con firmas y detalles -->
    //             <div style="margin-bottom: 20px;">
    //                 <!-- Firmas -->
    //                 <div style="
    //                     display: grid;
    //                     grid-template-columns: 1fr 1fr 1fr;
    //                     gap: 30px;
    //                     margin-bottom: 20px;
    //                     align-items: end;
    //                 ">
    //                     <!-- Firma 1 -->
    //                     <div style="text-align: center;">
    //                         <div style="margin-bottom: 8px; height: 45px; display: flex; align-items: flex-end; justify-content: center;">
    //                             <img 
    //                                 src="${data.firma}"
    //                                 style="width: 148px; height: 40px; object-fit: contain;"

    //                               />
    //                         </div>
    //                         <div style="border-top: 2px solid black; padding-top: 8px;">
    //                             <p style="font-size: 12px; color: #333; font-weight: 600; margin: 0;">${data.instructorName}</p>
    //                             <p style="font-size: 11px; color: #666; margin: 0;">${data.instructorTitle}</p>
    //                         </div>
    //                     </div>

    //                     <!-- Sello central -->
    //                     <div style="display: flex; justify-content: center; align-items: center;">
    //                         <div style="
    //                             width: 96px;
    //                             height: 96px;
    //                             border-radius: 50%;
    //                             background-color: #16a34a;
    //                             display: flex;
    //                             align-items: center;
    //                             justify-content: center;
    //                             border: 4px solid #166534;
    //                             box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    //                         ">


    //                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-line-icon lucide-check-line"><path d="M20 4L9 15"/><path d="M21 19L3 19"/><path d="M9 15L4 10"/></svg>
    //                         </div>
    //                     </div>

    //                     <!-- Firma 2 -->
    //                     <div style="text-align: center;">
    //                         <div style="margin-bottom: 8px; height: 45px; display: flex; align-items: flex-end; justify-content: center;">

    //                              <img 
    //                                 src="${data.firma}"
    //                                 style="width: 148px; height: 40px; object-fit: contain;"

    //                               />
    //                         </div>
    //                         <div style="border-top: 2px solid black; padding-top: 8px;">
    //                             <p style="font-size: 12px; color:#333; font-weight: 600; margin: 0;">${data.ceoName}</p>
    //                             <p style="font-size: 11px; color: #666; margin: 0;">${data.ceoTitle}</p>
    //                         </div>
    //                     </div>
    //                 </div>

    //                 <!-- Información adicional -->
    //                 <div style="text-align: center; font-size: 12px; color: #666;">
    //                     <p style="margin-bottom: 4px;">Certificación de aprobación online:</p>
    //                     <p style="font-weight: 600; color: black; margin-bottom: 4px;">
    //                         Aprobado el ${data.completionDate}
    //                     </p>
    //                     <p style="margin-bottom: 8px;">${data.duration}</p>
    //                     <p style="font-size: 11px; color: #2563eb; margin-bottom: 2px;">${data.verificationUrl}</p>
    //                     <p style="font-size: 11px; color: #999; margin: 0;">${data.verificationCode}</p>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // `;
    // };

    const createCertificateHTML = (data) => {
        return `
    <div style="
    width: 1122px;
    height: 794px;
    background-color: white;
    position: relative;
    font-family: Arial, sans-serif;
">
    <!-- Marca de agua superior izquierda -->
    <div style="
        position: absolute;
        top: 30px;
        left: 30px;
        opacity: 0.05;
        pointer-events: none;
    ">
        <img 
            src="${logo}"
            style="width: 384px; height: 384px; object-fit: contain; filter: grayscale(100%);"
            alt="Watermark"
        />
    </div>

    <!-- Marca de agua inferior derecha -->
    <div style="
        position: absolute;
        bottom: 30px;
        right: 30px;
        opacity: 0.05;
        pointer-events: none;
    ">
        <img 
            src="${logo}"
            style="width: 384px; height: 384px; object-fit: contain; filter: grayscale(100%);"
            alt="Watermark"
        />
    </div>

    <!-- Bloque de color azul asimétrico de fondo -->
    <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 375px;
        height: 100%;
        background-color: #071D49;
        opacity: 0.03;
    "></div>

    <!-- Contenido principal -->
    <div style="
        position: relative;
        height: 100%;
        display: flex;
        padding: 80px;
    ">
        <!-- Columna izquierda (33%) -->
        <div style="
            width: 33.333%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-right: 48px;
            border-right: 2px solid #e5e7eb;
        ">
            <!-- Logo y nombre empresa -->
            <div>
                <img 
                    src="${logo}" 
                    style="
                        width: 80px;
                        height: 96px;
                        border-radius: 8px;
                        margin-bottom: 16px;
                       
                        padding: 8px;
                    " 
                />
                <h1 style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #111827;
                    margin: 0 0 8px 0;
                ">
                    LOGÍSTICA DE
                </h1>
                <h1 style="
                    font-size: 20px;
                    font-weight: bold;
                    color: #111827;
                    margin: 0 0 16px 0;
                ">
                    TRANSPORTE S.A
                </h1>
                <div style="
                    width: 48px;
                    height: 4px;
                    background-color: #C4D600;
                "></div>
            </div>

            <!-- Información inferior izquierda -->
            <div>
                <!-- Fecha de emisión -->
                <div style="margin-bottom: 32px;">
                    <p style="
                        font-size: 11px;
                        color: #787e89;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    ">
                        Fecha de emisión
                    </p>
                    <p style="
                        font-size: 14px;
                        font-weight: bold;
                        color: #071D49;
                        margin: 0;
                    ">
                        ${data.completionDate}
                    </p>
                </div>

                <!-- Firma -->
                <div style="height: 70px; margin-bottom: 8px;">
                    <img 
                        src="${data.firma}"
                        style="
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        "
                    />
                </div>
                <div style="
                    width: 100%;
                    height: 2px;
                    background-color: #071D49;
                    margin-bottom: 8px;
                "></div>
                <p style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #111827;
                    margin: 0 0 4px 0;
                ">
                    ${data.instructorName}
                </p>
                <p style="
                    font-size: 11px;
                    color: #6b7280;
                    margin: 0;
                ">
                    ${data.instructorTitle}
                </p>
            </div>
        </div>

        <!-- Columna derecha (67%) -->
        <div style="
            flex: 1;
            padding-left: 48px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        ">
            <div>
                <!-- Certificado oficial -->
                <div style="margin-bottom: 40px;">
                    <p style="
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                        color: #9ca3af;
                        margin-bottom: 16px;
                    ">
                        CERTIFICADO OFICIAL
                    </p>
                    <p style="
                        font-size: 16px;
                        color: #4b5563;
                        margin-bottom: 16px;
                    ">
                        Se certifica que
                    </p>
                    <h2 style="
                        font-size: 58px;
                        font-weight: 300;
                        color: #111827;
                        margin: 0 0 12px 0;
                        line-height: 1.1;
                    ">
                        ${data.studentName}
                    </h2>
                    <p style="
                        font-size: 14px;
                        color: #6b7280;
                        margin: 0;
                    ">
                        C.C ${data.studentDocument}
                    </p>
                </div>

                <!-- Información del curso con barra lateral -->
                <div style="position: relative; margin-bottom: 40px;">
                    <!-- Barra lateral verde -->
                    <div style="
                        position: absolute;
                        left: -16px;
                        top: 0;
                        bottom: 0;
                        width: 4px;
                        background-color: #C4D600;
                    "></div>
                    
                    <div style="padding-left: 24px;">
                        <p style="
                            font-size: 14px;
                            color: #4b5563;
                            margin-bottom: 8px;
                        ">
                            Ha completado satisfactoriamente el
                        </p>
                        <p style="
                            font-size: 18px;
                            color: #374151;
                            margin-bottom: 8px;
                            font-weight: 600;
                        ">
                            CURSO DE
                        </p>
                        <h3 style="
                            font-size: 48px;
                            font-weight: bold;
                            color: #071D49;
                            margin: 0 0 12px 0;
                        ">
                            ${data.courseName}
                        </h3>
                        <p style="
                            font-size: 14px;
                            color: #6b7280;
                            margin: 0 0 16px 0;
                        ">
                            ${data.duration}
                        </p>
                    </div>
                </div>

                <!-- Verificación con checkmark -->
                <div style="
                    display: flex;
                    align-items: center;
                    Justify-content: center;
                    gap: 12px;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                ">
                   <div
  style="
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #C4D600;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
  "
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16" style="padding-top:2px">
    <path d="M13.485 1.929a.75.75 0 0 1 0 1.06L6.03 10.445l-3.515-3.51a.75.75 0 0 1 1.06-1.06l2.455 2.454 6.394-6.394a.75.75 0 0 1 1.06 0z"/>
  </svg>
</div>

                    <div>
                        <p style="
                            font-size: 11px;
                            color: #6b7280;
                            margin: 0 0 2px 0;
                        ">
                            ${data.verificationUrl}
                        </p>
                        <p style="
                            font-size: 10px;
                            color: #9ca3af;
                            margin: 0;
                        ">
                            ${data.verificationCode}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
    };

    // Función para convertir imagen a base64
    // Convierte la imagen importada a base64 para usarla con html2canvas
    const getBase64Image = (imagePath) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imagePath;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            };

            img.onerror = (err) => reject(err);
        });
    };


    // Dentro del componente, reemplaza la función downloadCertificate:
    function durationToMinutes(duration) {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        return hours * 60 + minutes + seconds / 60;
    }

    const downloadCertificate = async () => {
        try {
            console.log('🪶 Generando certificado...');

            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            // 🔹 Convierte el logo importado en base64
            const logoBase64 = await getBase64Image(logo);

            const dataLocal = getUserProgressForCourse(courseId)
            const curso = getCourseById(courseId)
            const firma = await getBase64Image(curso.firma)
            const userName = dataLocal.nombre;
            const userDocument = dataLocal.cedula;
            const courseName = dataLocal.title;

            const courseIds = "course_" + courseId;
            const moduleIds = "module_" + moduleId;
            const timestampStr = dataLocal.quizProgress?.[courseIds]?.[moduleIds]?.timestamp;
            const totalMinutes = Math.round(curso.content.modules
                .reduce((sum, module) => sum + durationToMinutes(module.duration), 0));

            const certificateData = {
                studentName: userName.toUpperCase(),
                studentDocument: userDocument,
                courseName: courseName.toUpperCase(),
                completionDate: timestampStr
                    ? new Date(timestampStr).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }) : null,
                duration: `${curso.content.modules.length} modulos  - ${totalMinutes} minutos`,
                instructorName: 'Yulieth Vanesa Cely Lopez',
                instructorTitle: 'PROFESIONAL DE CUMPLIMIENTO',
                firma: firma,
                ceoName: 'Yulieth Vanesa Cely Lopez',
                ceoTitle: 'PROFESIONAL DE CUMPLIMIENTO',
                verificationUrl: `https://alejocode96.github.io/Formaciones/`,
                verificationCode: `Código: ${courseId}-${moduleId}-${new Date(timestampStr).getTime()}`,
                logoUrl: logoBase64, // 🔹 ahora es seguro
                score: quizResults?.percentage || '100'
            };

            // Crear el HTML del certificado
            const certificateHTML = createCertificateHTML(certificateData);

            // 🔹 Insertar temporalmente el HTML al DOM
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = certificateHTML;
            tempDiv.style.position = 'fixed';
            tempDiv.style.top = '0';
            tempDiv.style.left = '0';
            tempDiv.style.width = '1122px';
            tempDiv.style.height = '794px';
            tempDiv.style.opacity = '0';
            tempDiv.style.zIndex = '-1';
            document.body.appendChild(tempDiv);

            // 🔹 Esperar que se renderice
            await new Promise(resolve => setTimeout(resolve, 800));

            const element = tempDiv.firstElementChild;
            if (!element) throw new Error('No se encontró el contenido del certificado.');

            // 🔹 Capturar con html2canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const fileName = `certificado-${certificateData.courseName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            pdf.save(fileName);

            // Limpiar el DOM temporal
            document.body.removeChild(tempDiv);
            console.log('✅ Certificado generado correctamente');
        } catch (error) {
            console.error('❌ Error al generar el certificado:', error);
            // alert('Hubo un error al generar el certificado. Por favor, intenta nuevamente.');
        }
    };



    const revisarModulo = (moduloBuscado) => {
        const currentCourse = getCourseById(courseId);

        if (!currentCourse) {
            console.warn('⚠️ No se encontró el curso con ese ID');
            return;
        }
        console.log(currentCourse)
        // 🔹 Buscar el módulo cuyo nombre coincida
        const moduloEncontrado = currentCourse.content.modules.find(
            (m) => m.name.trim().toLowerCase() === moduloBuscado.trim().toLowerCase()
        );

        if (moduloEncontrado) {

            navigate(`/training/${courseId}/module/${moduloEncontrado.id}`);
        } else {
            console.warn("⚠️ No se encontró un módulo con ese nombre");
            return null;
        }
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const answeredQuestionsCount = Object.values(userAnswers).filter(answer => answer !== null && answer !== undefined).length;
    const allQuestionsAnswered = answeredQuestionsCount === quizQuestions.length;
    const currentAnswer = userAnswers[currentQuestionIndex];
    const minCorrectAnswers = Math.ceil(quizQuestions.length * currentModule.aprovacion);

    // Popup de advertencia
    const WarningPopup = () => (
        <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4  right-1 lg:right-4 px-6 py-3 bg-red-500 border border-red-500 rounded-lg flex items-center gap-2 animate-pulse z-50">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-100 flex-shrink-0" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">
                        Selecciona una respuesta
                    </h3>
                    <p className="text-zinc-200">
                        Debes seleccionar una respuesta antes de continuar a la siguiente pregunta.
                    </p>
                </div>
            </div>
        </div>
    );

    if (quizState === 'intro') {
        const existingProgress = getQuizProgress();
        const hasResults = existingProgress && existingProgress.results;

        return (
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex items-center justify-center mb-12 gap-4">
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 leading-tight">
                            Evaluación Final
                        </h1>
                        <p className="text-xl text-zinc-400 leading-tight">
                            Es momento de demostrar lo aprendido
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Cantidad de preguntas
                                </h3>
                                <p className="text-zinc-400">
                                    {currentModule.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    ¿Qué se evaluará?
                                </h3>
                                <p className="text-zinc-400">
                                    El quiz consta de <span className="font-bold text-zinc-200">{quizQuestions.length} preguntas</span> de
                                    opción múltiple que deberás responder de manera individual.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Tiempo estimado
                                </h3>
                                <p className="text-zinc-400">
                                    El tiempo estimado para completar esta evaluación es de aproximadamente{' '}
                                    <span className="font-bold text-zinc-200">{estimatedTime} minutos</span>.
                                    Tómate el tiempo necesario para leer cada pregunta cuidadosamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <RotateCcw className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Intentos disponibles
                                </h3>
                                {currentModule.attemptsLimit === 'unlimited' && (
                                    <p className="text-zinc-400">
                                        Tienes <span className="font-bold text-zinc-200">intentos ilimitados</span> para aprobar
                                        la evaluación. Si no apruebas en el primer intento, podrás volver a intentarlo las veces que necesites.
                                    </p>
                                )}
                                {currentModule.attemptsLimit >= 0 && (
                                    <p className="text-zinc-400">
                                        Tienes <span className="font-bold text-zinc-200">{currentModule.attemptsLimit} intentos</span> para aprobar
                                        la evaluación. Si no apruebas en los intentos establecidos debes volver a realizar el curso completamente.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Criterio de aprobación
                                </h3>
                                <p className="text-zinc-400">
                                    Para aprobar esta evaluación necesitas obtener un{' '}
                                    <span className="font-bold text-zinc-200">mínimo del {currentModule.aprovacion * 100}%</span> de respuestas correctas.
                                    Esto significa acertar al menos{' '}
                                    <span className="font-bold text-zinc-200">{minCorrectAnswers} de {quizQuestions.length} preguntas</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-200 mb-2">Recomendaciones importantes</h3>
                            <ul className="text-sm text-blue-300 space-y-2">
                                <li>• Lee cada pregunta cuidadosamente antes de seleccionar tu respuesta</li>
                                <li>• Puedes navegar entre preguntas usando los botones "Anterior" y "Siguiente"</li>
                                <li>• Antes de enviar, tendrás la oportunidad de revisar todas tus respuestas</li>
                                <li>• Si no apruebas, revisa los módulos sugeridos antes de volver a intentarlo</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startQuiz}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                    <Send className="w-6 h-6" />
                    {hasResults ? 'Ver Resultados' : (hasExistingProgress ? 'Continuar Evaluación' : 'Comenzar Evaluación')}
                </button>
            </div>
        );
    }

    // VISTA: Tomando el quiz
    if (quizState === 'taking') {
        return (
            <>
                {showWarningPopup && <WarningPopup />}

                <div className="max-w-[100%] mx-auto py-8 px-4">
                    <div className="max-w-6xl mx-auto mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                                    {currentQuestionIndex + 1}
                                </div>
                                <span className="text-gray-400">de {quizQuestions.length} preguntas</span>
                            </div>
                            <span className="text-cyan-400 font-semibold">
                                {Math.round((answeredQuestionsCount / quizQuestions.length) * 100)}% completado
                            </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
                                style={{ width: `${(answeredQuestionsCount / quizQuestions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                        {/* Pregunta con línea decorativa dinámica */}
                        <div className="md:mb-12">
                            <div className="flex items-center gap-6">
                                <div
                                    className="w-1 bg-gradient-to-b from-zinc-800 to-gray-300 rounded-full transition-all duration-300"
                                    style={{ height: questionHeight ? `${questionHeight + 50}px` : '112px' }}
                                />
                                <div>
                                    <div className="text-sm font-bold text-gray-400 mb-3 tracking-wider">
                                        PREGUNTA {currentQuestionIndex + 1}
                                    </div>
                                    <h2
                                        ref={questionTextRef}
                                        className="text-xl lg:text-4xl font-bold text-gray-200 leading-tight"
                                    >
                                        {currentQuestion.name}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Opciones de respuesta */}
                            <div className="space-y-4 mb-8">
                                {currentQuestion.respuestas.map((option, index) => {
                                    const isSelected = currentAnswer === index;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectAnswer(index)}
                                            className={`w-full text-left p-2 rounded-2xl transition-all duration-300 border group relative overflow-hidden ${isSelected
                                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500 shadow-lg shadow-cyan-500/30'
                                                : 'bg-zinc-800/40 border-zinc-700/50 hover:border-cyan-500/50 hover:shadow-lg'
                                                } cursor-pointer group`}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
                                            )}
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div
                                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${isSelected
                                                        ? 'bg-white text-cyan-600 shadow-lg'
                                                        : 'bg-zinc-700 text-zinc-300 group-hover:bg-zinc-600'
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + index)}
                                                </div>

                                                <span
                                                    className={`font-medium text-sm md:text-base leading-snug ${isSelected ? 'text-white' : 'text-gray-300'}`}
                                                    style={{ wordBreak: 'break-word' }}
                                                >
                                                    {option.opcion}
                                                </span>
                                            </div>

                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navegación */}
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={goToPreviousQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentQuestionIndex === 0
                                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Anterior
                                </button>

                                {currentQuestionIndex === quizQuestions.length - 1 && allQuestionsAnswered ? (
                                    <button
                                        onClick={goToReview}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg"
                                    >
                                        Revisar Respuestas
                                        <Send className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={goToNextQuestion}
                                        disabled={currentQuestionIndex === quizQuestions.length - 1 && !allQuestionsAnswered}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentQuestionIndex === quizQuestions.length - 1 && !allQuestionsAnswered
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        Siguiente
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Advertencia si faltan respuestas */}
                    {currentQuestionIndex === quizQuestions.length - 1 && !allQuestionsAnswered && (
                        <div className="mt-6 p-4 bg-orange-900/20 border border-orange-500/50 rounded-xl max-w-6xl mx-auto">
                            <div className="flex items-center gap-3 text-orange-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">
                                    Debes responder todas las preguntas antes de continuar.
                                    Faltan {quizQuestions.length - answeredQuestionsCount} pregunta(s) por responder.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    // VISTA: Revisión antes de enviar
    if (quizState === 'reviewing') {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-zinc-100 mb-2">Revisa tus respuestas</h2>
                    <p className="text-zinc-400">
                        Verifica tus respuestas antes de enviar el quiz. Puedes cambiar cualquier respuesta si lo deseas.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    {quizQuestions.map((question, index) => {
                        const userAnswerIndex = userAnswers[index];
                        const userAnswer = question.respuestas[userAnswerIndex];

                        return (
                            <div key={index} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-6">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-blue-400">
                                                Pregunta {index + 1}
                                            </span>
                                            <span className="text-xs text-zinc-500">•</span>
                                            <span className="text-xs text-zinc-500">{question.etiqueta}</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-zinc-200 mb-3">
                                            {question.name}
                                        </h3>
                                        <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                                            <p className="text-sm text-zinc-400 mb-1">Tu respuesta:</p>
                                            <p className="text-base text-zinc-100">{userAnswer?.opcion}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => changeAnswer(index)}
                                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Cambiar respuesta →
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setQuizState('taking')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-all duration-300 shadow-md text-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Volver al Quiz
                    </button>

                    <button
                        onClick={submitQuiz}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg text-lg"
                    >
                        <Send className="w-5 h-5" />
                        Confirmar y Enviar Quiz
                    </button>
                </div>

            </div>
        );
    }

    if (quizState === 'submitted' && quizResults) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Resultado general */}
                <div className={`mb-8 p-8 rounded-2xl border-2 text-center ${quizResults.passed
                    ? 'bg-green-900/20 border-green-500/50'
                    : 'bg-red-900/20 border-red-500/50'
                    }`}>
                    {quizResults.passed ? (
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    ) : (
                        XCircle && <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    )}

                    <h2 className={`text-4xl font-bold mb-2 ${quizResults.passed ? 'text-green-100' : 'text-red-100'
                        }`}>
                        {quizResults.passed ? '¡Felicitaciones!' : 'Quiz No Aprobado'}
                    </h2>

                    <p className={`text-xl mb-6 ${quizResults.passed ? 'text-green-200' : 'text-red-200'
                        }`}>
                        {quizResults.passed
                            ? 'Has aprobado el quiz exitosamente'
                            : 'Necesitas el 90% para aprobar'
                        }
                    </p>

                    <div className="flex items-center justify-center gap-8 mb-6">
                        <div>
                            <div className="text-5xl font-bold text-zinc-100 mb-1">
                                {quizResults.percentage}%
                            </div>
                            <div className="text-sm text-zinc-400">Porcentaje obtenido</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-zinc-300">
                                {quizResults.correctCount} correctas
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {XCircle && <XCircle className="w-5 h-5 text-red-400" />}
                            <span className="text-zinc-300">
                                {quizResults.incorrectCount} incorrectas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Botones de acción principales */}
                {quizResults.passed && (
                    <div className="mb-8">
                        <button
                            onClick={downloadCertificate}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg text-lg"
                        >
                            <Download className="w-5 h-5" />
                            Descargar Certificado
                        </button>
                    </div>
                )}

                {!quizResults.passed && (
                    <div className="mb-8">
                        <button
                            onClick={retryQuiz}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white transition-all duration-300 shadow-lg text-lg"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Intentar Nuevamente
                        </button>
                    </div>
                )}

                {/* Resumen detallado */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-zinc-100 mb-6">Resumen Detallado</h3>

                    <div className="space-y-4">
                        {quizResults.detailedResults.map((result, index) => (
                            <div
                                key={index}
                                className={`border-2 rounded-xl p-6 ${result.isCorrect
                                    ? 'bg-green-900/10 border-green-500/30'
                                    : 'bg-red-900/10 border-red-500/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {result.isCorrect ? (
                                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                    ) : (
                                        XCircle && <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-sm font-semibold ${result.isCorrect ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                Pregunta {index + 1}
                                            </span>
                                            <span className="text-xs text-zinc-500">•</span>
                                            <span className="text-xs text-zinc-500">{result.etiqueta}</span>
                                        </div>

                                        <h4 className="text-lg font-medium text-zinc-200 mb-3">
                                            {result.question}
                                        </h4>

                                        <div className={`rounded-lg p-4 mb-2 ${result.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20'
                                            }`}>
                                            <p className="text-sm text-zinc-400 mb-1">Tu respuesta:</p>
                                            <p className={`font-medium ${result.isCorrect ? 'text-green-200' : 'text-red-200'
                                                }`}>
                                                {result.userAnswer}
                                            </p>
                                        </div>

                                        {!result.isCorrect && (
                                            <>


                                                <button
                                                    onClick={() => revisarModulo(result.etiqueta)}
                                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Revisar módulo: {result.etiqueta}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default QuizFinal;