import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle, X, Target, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";


function DragDropOrder({ currentModule, onContentIsEnded, courseId, moduleId }) {

  let cards = currentModule.cards;
  const maxRetries = 10;
  const correctOrder = cards.map(card => card.id);

  // Función para mezclar array (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 📱 ESTADO
  const [isMobile, setIsMobile] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [mejorVoz, setMejorVoz] = useState(null);
  const [vocesCargadas, setVocesCargadas] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 🔥 CAMBIO CRÍTICO: Ya NO inicializamos con valores, esperamos cargar el progreso primero
  const [draggableItems, setDraggableItems] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false); // Nuevo estado

  const [draggedItem, setDraggedItem] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [touchDragItem, setTouchDragItem] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [isReorganizing, setIsReorganizing] = useState(false);

  // 🔗 REFERENCIAS
  const synthRef = useRef(window.speechSynthesis);
  const pausedTextRef = useRef({ text: "" });
  const currentUtteranceRef = useRef(null);
  const audioRetryRef = useRef(0);
  const progressIntervalRef = useRef(null);
  const pausedByVisibilityRef = useRef(false);
  const audioCompletedRef = useRef(false);
  const audioStateRef = useRef({ isPlaying: false, wasPaused: false });
  const dropZoneRefs = useRef({});

  // 💾 LOCALSTORAGE
  const getProgressKey = () => `userProgress`;

  const loadProgress = () => {
    const key = getProgressKey();
    const existingProgress = localStorage.getItem(key);
    if (existingProgress) {
      try {
        const allProgress = JSON.parse(existingProgress);
        const userProgress = allProgress[courseId];
        if (!userProgress?.dragDropOrderProgress) return [];
        const courseProgress = userProgress.dragDropOrderProgress[`course_${courseId}`] || {};
        const moduleProgress = courseProgress[`module_${moduleId}`] || [];
        console.log('📖 Progreso cargado:', moduleProgress);
        return moduleProgress;
      } catch (error) {
        console.error('❌ Error cargando progreso:', error);
        return [];
      }
    }
    return [];
  };

  const saveProgress = (itemId) => {
    const key = getProgressKey();
    const existingProgress = localStorage.getItem(key);
    const itemKey = `${itemId}`;
    let allProgress = existingProgress ? JSON.parse(existingProgress) : {};

    if (!allProgress[courseId]) {
      allProgress[courseId] = {
        id: courseId,
        title: currentModule.title || "",
        cumplimiento: 0,
        startedAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        currentModule: moduleId,
        completedModules: [],
        flipCardProgress: {},
        flipCardReverseProgress: {},
        dragDropProgress: {},
        dragDropOrderProgress: {},
      };
    }

    const userProgress = allProgress[courseId];
    if (!userProgress.dragDropOrderProgress[`course_${courseId}`]) {
      userProgress.dragDropOrderProgress[`course_${courseId}`] = {};
    }
    if (!userProgress.dragDropOrderProgress[`course_${courseId}`][`module_${moduleId}`]) {
      userProgress.dragDropOrderProgress[`course_${courseId}`][`module_${moduleId}`] = [];
    }

    const moduleProgress = userProgress.dragDropOrderProgress[`course_${courseId}`][`module_${moduleId}`];
    if (!moduleProgress.includes(itemKey)) {
      moduleProgress.push(itemKey);
    }

    userProgress.lastAccessAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(allProgress));
    console.log(`✅ Progreso guardado: ${itemKey}`);
  };

  // 🔥 INICIALIZACIÓN CON PROGRESO GUARDADO

  useEffect(() => {
    const savedProgress = loadProgress();
    setCompletedItems(savedProgress);
    console.log('✅ Items completados cargados:', savedProgress);

    // Separar items completados y pendientes
    const completedIds = new Set(savedProgress);
    const pendingCards = cards.filter(card => !completedIds.has(card.id));
    const completedCards = cards.filter(card => completedIds.has(card.id));

    // Inicializar draggableItems solo con los pendientes (mezclados)
    setDraggableItems(shuffleArray(pendingCards));

    // 🔥 NUEVO: Inicializar dropZones YA REORGANIZADOS
    const allZones = cards.map((card, index) => {
      const isCompleted = completedIds.has(card.id);
      return {
        zone: isCompleted ? card : null,
        originalIndex: index
      };
    });

    // Separar en incompletos y completados ANTES de setear el estado
    const incompleteZones = [];
    const completedZones = [];

    allZones.forEach(slot => {
      if (slot.zone && completedIds.has(slot.zone.id)) {
        completedZones.push(slot);
      } else {
        incompleteZones.push(slot);
      }
    });

    // Mantener orden original por originalIndex
    incompleteZones.sort((a, b) => a.originalIndex - b.originalIndex);
    completedZones.sort((a, b) => a.originalIndex - b.originalIndex);

    // Unir: primero incompletos, luego completados
    const organizedZones = [...incompleteZones, ...completedZones];

    setDropZones(organizedZones);
    setIsInitialized(true);

    console.log('🎯 Estado inicializado con progreso:', {
      completados: completedCards.length,
      pendientes: pendingCards.length,
      zonesOrganizadas: organizedZones.length
    });
  }, [courseId, moduleId]);

  useEffect(() => {
    if (vocesCargadas && !introStarted) {
      if (!isMobile) {
        setIntroStarted(true);
      }
    }
  }, [vocesCargadas, isMobile]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const cargarVoces = () => {
      const voices = synth.getVoices();

      if (!voices.length) {
        console.log('🔄 Reintentando cargar voces...');
        setTimeout(cargarVoces, 300);
        return;
      }

      const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

      const prioridadMicrosoft = [
        'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
        'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
        'Microsoft Salome Online (Natural) - Spanish (Colombia)',
        'Microsoft Catalina Online (Natural) - Spanish (Chile)',
        'Microsoft Camila Online (Natural) - Spanish (Peru)',
        'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
      ];

      let mejorOpcion = null;

      for (const nombre of prioridadMicrosoft) {
        mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
        if (mejorOpcion) break;
      }

      if (!mejorOpcion) {
        const vocesFemeninas = vocesEspanol.filter(v =>
          /(female|mujer|paulina|monica|soledad|camila|lucia|maría|carla|rosa|laura|catalina|dalia|salome|andrea|paola|google|microsoft)/i.test(v.name)
        );

        mejorOpcion =
          vocesFemeninas.find(v => v.name.toLowerCase().includes('monica')) ||
          vocesFemeninas.find(v => v.name.toLowerCase().includes('camila')) ||
          vocesFemeninas.find(v => v.name.toLowerCase().includes('andrea')) ||
          vocesFemeninas.find(v => v.name.toLowerCase().includes('salome')) ||
          vocesFemeninas[0] ||
          vocesEspanol[0];
      }

      if (mejorOpcion) {
        setMejorVoz(mejorOpcion);
        setVocesCargadas(true);
        console.log(`✅ Voz seleccionada: ${mejorOpcion.name} [${mejorOpcion.lang}]`);
      } else {
        console.warn('⚠️ No se encontró ninguna voz en español.');
      }
    };

    cargarVoces();
    synth.onvoiceschanged = cargarVoces;

    const handleUserInteraction = () => {
      console.log('👆 Usuario hizo clic: forzando carga de voces...');
      cargarVoces();
      document.removeEventListener('click', handleUserInteraction);
    };
    document.addEventListener('click', handleUserInteraction);

    return () => {
      synth.onvoiceschanged = null;
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // 🎧 FUNCIÓN DE REPRODUCCIÓN
  const speak = (text, onEnd, onError) => {
    if (!vocesCargadas || !mejorVoz) {
      setShowAudioPopup(true);
      return;
    }
    const synth = synthRef.current;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();

      if (pausedByVisibilityRef.current) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setAudioProgress(0);
      }
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = mejorVoz;
    utterance.lang = mejorVoz.lang || 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.wasCancelled = false;
    pausedTextRef.current.text = text;
    currentUtteranceRef.current = utterance;
    let startTime = Date.now();
    const baseRate = 0.9; // tu rate actual
    const charsPerSecond = 14 * baseRate; // velocidad ajustada
    const estimatedDuration = (text.length / charsPerSecond) * 1000;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPaused(false);
      setAudioProgress(0);
      audioStateRef.current.isPlaying = true;
      audioStateRef.current.wasPaused = false;
      audioRetryRef.current = 0;
      audioCompletedRef.current = false;
      startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setAudioProgress(progress);
      }, 100);
      setShowAudioPopup(false);
    };

    utterance.onend = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setAudioProgress(100);
      setIsPlayingAudio(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      audioStateRef.current.isPlaying = false;
      audioStateRef.current.wasPaused = false;
      setShowAudioPopup(false);
      if (!utterance.wasCancelled) {
        audioCompletedRef.current = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (e) => {
      const isInterrupted = e.error === 'interrupted';
      if (!isInterrupted && audioRetryRef.current < maxRetries) {
        audioRetryRef.current++;
        setShowAudioPopup(true);
        setTimeout(() => {
          if (audioRetryRef.current <= maxRetries) {
            try { synth.speak(utterance); } catch (error) { }
          }
        }, 800);
      } else if (audioRetryRef.current >= maxRetries) {
        setIsPlayingAudio(false);
        setIsPaused(false);
        setAudioFailed(true);
        audioStateRef.current.isPlaying = false;
        audioRetryRef.current = 0;
        setShowAudioPopup(true);
        if (onError) onError();
      }
    };

    utterance.onpause = () => { };
    utterance.onresume = () => {
      setIsPaused(false);
      audioStateRef.current.wasPaused = false;
    };

    try {
      synthRef.current.speak(utterance);
    } catch (error) {
      setShowAudioPopup(true);
      setAudioFailed(true);
      currentUtteranceRef.current = null;
    }
  };

  // 👁️ EFFECTS: Visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      const synth = synthRef.current;
      if (document.hidden) {
        if (synth.speaking && !synth.paused) {
          synth.pause();
          setIsPaused(true);
          audioStateRef.current.wasPaused = true;
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      } else {
        if (audioStateRef.current.wasPaused && audioStateRef.current.isPlaying) {
          setTimeout(() => {
            try {
              synth.resume();
              setIsPaused(false);
              audioStateRef.current.wasPaused = false;
              if (currentItem) {
                const estimatedDuration = (currentItem.audioText.length / 15) * 1000;
                let startTime = Date.now() - (audioProgress / 100 * estimatedDuration);
                progressIntervalRef.current = setInterval(() => {
                  const elapsed = Date.now() - startTime;
                  const progress = Math.min((elapsed / estimatedDuration) * 100, 100);
                  setAudioProgress(progress);
                }, 100);
              }
            } catch (error) { }
          }, 100);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentItem, audioProgress]);

  useEffect(() => {
    const handleBlur = () => {
      const synth = synthRef.current;
      if (synth.speaking && !synth.paused) {
        synth.pause();
        setIsPaused(true);
        audioStateRef.current.wasPaused = true;
        pausedByVisibilityRef.current = true;
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    };

    const handleFocus = () => {
      const synth = synthRef.current;
      if (pausedByVisibilityRef.current && audioStateRef.current.isPlaying) {
        setTimeout(() => {
          try {
            synth.resume();
            setIsPaused(false);
            audioStateRef.current.wasPaused = false;
            pausedByVisibilityRef.current = false;
            if (currentItem) {
              const estimatedDuration = (currentItem.audioText.length / 15) * 1000;
              let startTime = Date.now() - (audioProgress / 100 * estimatedDuration);
              progressIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / estimatedDuration) * 100, 100);
                setAudioProgress(progress);
              }, 100);
            }
          } catch (error) { }
        }, 100);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentItem, audioProgress]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const synth = synthRef.current;
      if (synth.speaking) {
        if (currentUtteranceRef.current) currentUtteranceRef.current.wasCancelled = true;
        synth.cancel();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      const synth = synthRef.current;
      if (synth.speaking) synth.cancel();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!isMobile && vocesCargadas && introStarted && !introPlayed) {
      speak(
        currentModule.audioObjetivo,
        () => setIntroPlayed(true),
        () => setIntroPlayed(true)
      );
    }
  }, [isMobile, vocesCargadas, introStarted, introPlayed]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🎯 DRAG & DROP
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (!draggedItem) return;

    const currentSlot = dropZones[index];

    // 🔥 FIX: Encontrar el primer slot vacío para validar el orden correcto
    const firstEmptyIndex = dropZones.findIndex(slot => !slot.zone);

    // Solo permitir drop si es el primer slot vacío
    if (index !== firstEmptyIndex) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setDraggedItem(null);
      return;
    }

    const expectedItem = correctOrder[currentSlot.originalIndex];
    if (draggedItem.id === expectedItem && !currentSlot.zone) {
      const newDropZones = [...dropZones];
      newDropZones[index] = { ...currentSlot, zone: draggedItem };
      setDropZones(newDropZones);
      const newDraggableItems = draggableItems.filter(item => item.id !== draggedItem.id);
      setDraggableItems(newDraggableItems);
      setCurrentItem(draggedItem);

      setAudioProgress(0);
      setIsPlayingAudio(false);
      setIsPaused(false);
      audioCompletedRef.current = false;

      setShowModal(true);
      audioCompletedRef.current = false;
      setTimeout(() => {
        speak(
          draggedItem.audioText,
          () => handleAudioComplete(draggedItem.id),
          () => console.error('Error reproduciendo audio')
        );
      }, 500);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
    setDraggedItem(null);
  };

  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    setTouchDragItem(item);
    setDraggedItem(item);
    setIsDraggingTouch(true);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDraggingTouch) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingTouch || !touchDragItem) return;

    // 🔥 NUEVO: En móvil validamos el orden secuencial, no la zona de drop
    const firstEmptyIndex = dropZones.findIndex(slot => !slot.zone);

    if (firstEmptyIndex === -1) {
      // No hay slots vacíos
      setIsDraggingTouch(false);
      setTouchDragItem(null);
      setDraggedItem(null);
      return;
    }

    const currentSlot = dropZones[firstEmptyIndex];
    const expectedItem = correctOrder[currentSlot.originalIndex];

    // Validar que el item arrastrado sea el correcto en la secuencia
    if (touchDragItem.id === expectedItem) {
      const newDropZones = [...dropZones];
      newDropZones[firstEmptyIndex] = { ...currentSlot, zone: touchDragItem };
      setDropZones(newDropZones);

      const newDraggableItems = draggableItems.filter(item => item.id !== touchDragItem.id);
      setDraggableItems(newDraggableItems);
      setCurrentItem(touchDragItem);

      setAudioProgress(0);
      setIsPlayingAudio(false);
      setIsPaused(false);
      audioCompletedRef.current = false;

      setShowModal(true);

      setTimeout(() => {
        speak(
          touchDragItem.audioText,
          () => handleAudioComplete(touchDragItem.id),
          () => console.error('Error reproduciendo audio')
        );
      }, 500);
    } else {
      // Orden incorrecto
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }

    setIsDraggingTouch(false);
    setTouchDragItem(null);
    setDraggedItem(null);
  };

  const handleAudioComplete = (itemId) => {
    setCompletedItems(prev => {
      const newCompleted = prev.includes(itemId) ? prev : [...prev, itemId];

      if (newCompleted.length === cards.length) {
        setTimeout(() => {
          if (onContentIsEnded) {
            onContentIsEnded();
          }
        }, 1000);
      }

      return newCompleted;
    });

    saveProgress(itemId);
  };

  const handleCloseModal = () => {
    const synth = synthRef.current;

    setShowModal(false);

    if (synth && (synth.speaking || synth.pending)) {
      console.log('🛑 Cerrando modal y deteniendo audio...');

      // 1. Marca como cancelado
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.wasCancelled = true;
        currentUtteranceRef.current.onend = null;      // 🔥 NUEVO: Limpia callbacks
        currentUtteranceRef.current.onerror = null;    // 🔥 NUEVO: Limpia callbacks
      }

      // Pausar y cancelar para asegurar que no quede en cola

      setTimeout(() => {
        try { synth.cancel(); } catch (e) { }

        // 4. 🔥 NUEVO: En móviles, doble cancelación
        if (isMobile) {
          setTimeout(() => {
            try {
              synth.cancel();      // Segunda cancelación
              synth.getVoices();   // Reinicia motor
            } catch (e) { }
          }, 100);
        }
      }, 50);

      setIsPlayingAudio(false);
      setIsPaused(false);

      // Refuerzo: limpiar cualquier intervalo de progreso
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Reiniciar motor de voz para móviles
      synth.getVoices();
    }

    // Reorganización de drop zones si la actividad no se completó
    if (!audioCompletedRef.current && currentItem) {
      const isAlreadyCompleted = completedItems.includes(currentItem.id);
      if (!isAlreadyCompleted) {
        const zoneIndex = dropZones.findIndex(slot => slot.zone?.id === currentItem.id);
        if (zoneIndex !== -1) {
          const newDropZones = [...dropZones];
          newDropZones[zoneIndex] = { ...newDropZones[zoneIndex], zone: null };
          setDropZones(newDropZones);
          setDraggableItems(prev => shuffleArray([...prev, currentItem]));
        }
      } else {
        setTimeout(() => {
          reorganizeDropZones();
        }, 50);
      }
    } else if (audioCompletedRef.current && currentItem) {
      setTimeout(() => {
        reorganizeDropZones();
      }, 50);
    }

    // Reset final de estado
    setTimeout(() => {
      setCurrentItem(null);
      setAudioProgress(0);
      audioCompletedRef.current = false;
      pausedByVisibilityRef.current = false;
      audioStateRef.current.isPlaying = false;
      audioStateRef.current.wasPaused = false;
      currentUtteranceRef.current = null;
    }, 100);
  };


  const reorganizeDropZones = () => {
    setIsReorganizing(true);

    setTimeout(() => {
      setDropZones(prev => {
        const incomplete = [];
        const completed = [];

        prev.forEach(slot => {
          if (slot.zone && completedItems.includes(slot.zone.id)) {
            completed.push(slot);
          } else {
            incomplete.push(slot);
          }
        });

        incomplete.sort((a, b) => a.originalIndex - b.originalIndex);
        completed.sort((a, b) => a.originalIndex - b.originalIndex);

        return [...incomplete, ...completed];
      });

      setTimeout(() => setIsReorganizing(false), 800);
    }, 50);
  };

  const iniciarIntroMovil = () => {
    if (!introStarted && vocesCargadas) {
      setIntroStarted(true);
      speak(
        currentModule.audioObjetivo,
        () => setIntroPlayed(true),
        () => setIntroPlayed(true)
      );
    }
  };

  const getPreviewText = (content) => {
    const cleaned = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= 80) return cleaned;
    return cleaned.substring(0, 100) + '...';
  };

  const getGridClass = () => {
    const count = draggableItems.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 md:grid-cols-4';
    if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  };

  const handleClickCompleted = (item) => {
    setCurrentItem(item);
    setAudioProgress(0);
    setIsPlayingAudio(false);
    setIsPaused(false);
    audioCompletedRef.current = true;
    setShowModal(true);

    setTimeout(() => {
      speak(
        item.audioText,
        () => { },
        () => console.error('Error reproduciendo audio')
      );
    }, 500);
  };

  // 🔥 MOSTRAR LOADING MIENTRAS SE INICIALIZA
  if (!vocesCargadas || !isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-400 text-lg animate-pulse">
          {!vocesCargadas ? 'Cargando voces en español...' : 'Cargando progreso...'}
        </p>
      </div>
    );
  }

  

  const allCompleted = completedItems.length === cards.length;
  const isPlayingIntro = introStarted && !introPlayed && isPlayingAudio;



  return (
    <div className="w-full mx-auto pt-10 pb-14 lg:pb-0">
      {isMobile && !introStarted && (
        <div
          onClick={iniciarIntroMovil}
          className="relative w-full flex items-center justify-center rounded-xl cursor-pointer min-h-[400px]"
          data-aos="fade-up"
        >
          <div className="absolute inset-0 rounded-xl scale-[1.03] pointer-events-none"></div>
          <div className="text-center py-2 z-10">
            <p className="text-white text-2xl md:text-3xl font-light animate-pulse">
              Click para iniciar
            </p>
          </div>
        </div>
      )}

      {introStarted && (
        <div className="text-center px-6 py-2 max-w-5xl mx-auto animate-fadeIn" data-aos="fade-up">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
            {currentModule.name}
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            {currentModule.objetivo}
          </p>
        </div>
      )}

      {isPlayingIntro && (
        <div className="max-w-4xl mx-auto px-4" data-aos="fade-up">
          <div className={`hidden lg:grid ${getGridClass()} gap-3 mb-6`} style={{ minHeight: '180px' }}>
            {cards.map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-4 lg:hidden">
            {cards.map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 md:w-20 h-16 md:h-20 bg-zinc-900/50 rounded-xl flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 h-20 md:h-24 bg-zinc-900/50 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {introPlayed && (
        <div className="max-w-6xl mx-auto px-4">
          {/* DESKTOP: Layout original */}
          <div className="hidden lg:block mb-10">
            {draggableItems.length > 0 && (
              <div className="mb-10 transition-all duration-500" data-aos="fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold text-sm">Factores</span>
                  <span className="text-slate-500 text-xs ml-auto">{draggableItems.length} disponibles</span>
                </div>

                <div className={`grid ${getGridClass()} gap-4`} style={{ minHeight: '120px' }}>
                  {draggableItems.map((item) => (
                    <div
                      className="bg-gradient-to-br from-[#0a1a3a]/80 to-[#071D49]/70 backdrop-blur-md border border-[#071D49]/30 shadow-md shadow-[#071D49]/40 hover:border-[#1a4fff] hover:shadow-xl hover:shadow-[#1a4fff]/40 transition-all duration-300 hover:-translate-y-2 hover:scale-105 rounded-2xl cursor-move select-none"
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onTouchStart={(e) => handleTouchStart(e, item)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={isDraggingTouch && touchDragItem?.id === item.id ? {
                        position: 'fixed',
                        left: `${touchPosition.x - 80}px`,
                        top: `${touchPosition.y - 50}px`,
                        zIndex: 1000,
                        opacity: 0.9,
                        pointerEvents: 'none'
                      } : {}}
                    >
                      <div className="text-center pointer-events-none h-full flex flex-col items-center justify-center p-3">
                        <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-xl flex items-center justify-center shadow-inner shadow-black/50">
                          <span className="text-2xl text-[#C4D600] drop-shadow-lg">{item.icon}</span>
                        </div>
                        <p className="text-white/90 text-sm font-medium leading-tight tracking-wide">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative mb-6​​​​​​​​​​​​​​​ pb-10​ " data-aos="fade-up">
              <div className="absolute left-8 md:left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  className="space-y-5"
                  layout
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  {dropZones.map((slot, index) => {
                    if (!slot) return null;

                    const isCompleted = slot.zone && completedItems.includes(slot.zone.id);
                    const stepNumber = slot.originalIndex + 1;

                    return (
                      <motion.div
                        key={`${slot.originalIndex}-${slot.zone?.id || 'empty'}`}
                        ref={(el) => (dropZoneRefs.current[index] = el)}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.7,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="relative flex items-center gap-4"
                      >
                        <div
                          data-drop-zone={index}
                          draggable={!!slot.zone}
                          onDragStart={(e) => slot.zone && handleDragStart(e, slot.zone)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onTouchStart={(e) => slot.zone && handleTouchStart(e, slot.zone)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => isCompleted && handleClickCompleted(slot.zone)}
                          className={`relative z-10 w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg
                          ${slot.zone
                              ? isCompleted
                                ? 'bg-gradient-to-br from-[#071D49] to-[#1a4fff] shadow-blue-500/50 cursor-pointer hover:scale-105'
                                : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/50 cursor-move'
                              : 'bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500/50 hover:bg-slate-700'
                            }`}
                        >
                          {slot.zone ? (
                            isCompleted ? (
                              <CheckCircle className="w-10 h-10 text-white" />
                            ) : (
                              <span className="text-3xl">{slot.zone.icon}</span>
                            )
                          ) : (
                            <span className="text-slate-500 font-bold text-lg">{stepNumber}</span>
                          )}
                        </div>

                        <div
                          data-drop-zone={index}

                          draggable={!!slot.zone}
                          onDragStart={(e) => slot.zone && handleDragStart(e, slot.zone)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onTouchStart={(e) => slot.zone && handleTouchStart(e, slot.zone)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => isCompleted && handleClickCompleted(slot.zone)}
                          className={`flex-1 rounded-xl p-3 border-2 transition-all duration-500 
                              ${slot.zone
                              ? isCompleted
                                ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10 cursor-pointer hover:bg-blue-500/20'
                                : 'bg-orange-500/10 border-orange-500/50 cursor-move'
                              : 'bg-slate-900/40 border-slate-700 border-dashed hover:border-blue-500/50 hover:bg-slate-900/60'
                            }`}
                        >
                          {slot.zone ? (
                            <div >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-lg">{slot.zone.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-sm truncate">{slot.zone.title}</h4>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-slate-500 text-xs whitespace-nowrap">
                                    Paso {stepNumber}/{dropZones.length}
                                  </p>
                                </div>
                              </div>
                              <p className="text-slate-400 text-xs leading-relaxed">
                                {getPreviewText(slot.zone.content)}
                              </p>
                            </div>
                          ) : (
                            <div className="py-2 text-center">
                              <p className="text-slate-500 text-xs">Suelta aquí el paso {stepNumber}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* MOBILE/TABLET: Layout lado a lado */}
          <div className="lg:hidden">
            {/* 🔹 Pasos completados (100%) arriba */}
            <div className="space-y-3 mb-4">
              {dropZones.map((slot, index) => {
                const isCompleted = slot.zone && completedItems.includes(slot.zone.id);
                if (!isCompleted) return null; // solo mostrar completados

                const stepNumber = slot.originalIndex + 1;
                return (
                  <div
                    key={`completed-${index}`}
                    className="w-full transition-all duration-500"
                    data-aos="fade-up" onClick={() => handleClickCompleted(slot.zone)}
                  >
                    <div
                      className="bg-blue-500/10 border-blue-500/50 rounded-xl p-3 shadow-md shadow-blue-500/10"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-base">{slot.zone.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-xs leading-tight">
                              {slot.zone.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs whitespace-nowrap">
                          {stepNumber}/{cards.length}
                        </p>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                        {getPreviewText(slot.zone.content)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🔹 Pasos pendientes (30% izquierda + 70% derecha) */}
            <div className="flex gap-4">
              {/* Columna izquierda: elementos arrastrables */}
              {draggableItems.length > 0 && (
                <div className="w-[30%] transition-all duration-500" data-aos="fade-up">
                  <div className="space-y-3">
                    {cards.map((item) => {
                      const isDraggable = draggableItems.some(d => d.id === item.id);
                      if (!isDraggable) return null;

                      // 🔥 NUEVO: Detecta cuál es el siguiente correcto
                      const firstEmptyIndex = dropZones.findIndex(slot => !slot.zone);
                      const nextCorrectId = firstEmptyIndex !== -1
                        ? correctOrder[dropZones[firstEmptyIndex].originalIndex]
                        : null;
                      const isNextCorrect = item.id === nextCorrectId;
                      return (
                        <div
                          key={item.id}
                          className="bg-gradient-to-br from-[#0a1a3a]/80 to-[#071D49]/70 backdrop-blur-md border border-[#071D49]/30 shadow-md shadow-[#071D49]/40 hover:border-[#1a4fff] hover:shadow-xl hover:shadow-[#1a4fff]/40 transition-all duration-300 rounded-2xl cursor-move select-none h-[90px]"
                          draggable={isNextCorrect}
                          onDragStart={(e) => handleDragStart(e, item)}
                          onTouchStart={(e) => isNextCorrect && handleTouchStart(e, item)}
                          onTouchMove={isNextCorrect ? handleTouchMove : undefined}
                          onTouchEnd={isNextCorrect ? handleTouchEnd : undefined}
                          style={isDraggingTouch && touchDragItem?.id === item.id ? {
                            position: 'fixed',
                            left: `${touchPosition.x - 60}px`,
                            top: `${touchPosition.y - 45}px`,
                            zIndex: 1000,
                            opacity: 0.9,
                            pointerEvents: 'none',
                            width: '30%',
                            height: '90px'
                          } : {}}
                        >
                          <div className="text-center pointer-events-none h-full flex flex-col items-center justify-center p-2">
                            <div className="w-10 h-10 mx-auto mb-1 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-xl flex items-center justify-center shadow-inner shadow-black/50">
                              <span className="text-lg text-[#C4D600] drop-shadow-lg">{item.icon}</span>
                            </div>
                            <p className="text-white/90 text-[10px] font-medium leading-tight tracking-wide line-clamp-2">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Columna derecha: zonas no completadas */}
              <div
                className={`${draggableItems.length > 0 ? 'w-[70%]' : 'w-full'} transition-all duration-500`}
                data-aos="fade-up"
              >
                <div className="space-y-3">
                  {dropZones.map((slot, index) => {
                    const isCompleted = slot.zone && completedItems.includes(slot.zone.id);
                    if (isCompleted) return null; // omitimos los completados aquí

                    const stepNumber = index + 1;

                    return (
                      <div key={`pending-${index}`} className="relative h-[90px]">
                        <div
                          data-drop-zone={index}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className={`h-full rounded-xl p-3 border-2 transition-all duration-500
                  ${slot.zone
                              ? 'bg-orange-500/10 border-orange-500/50 cursor-move'
                              : 'bg-slate-900/40 border-slate-700 border-dashed hover:border-blue-500/50 hover:bg-slate-900/60'
                            }`}
                        >
                          {slot.zone ? (
                            <div className="h-full flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-base">{slot.zone.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-xs leading-tight">{slot.zone.title}</h4>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-slate-500 text-xs whitespace-nowrap">{stepNumber}/{cards.length}</p>
                                </div>
                              </div>
                              <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                                {getPreviewText(slot.zone.content)}
                              </p>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <p className="text-slate-500 text-xs">Suelta el paso {stepNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


          {/* Modal de reproducción de audio */}
          {showModal && currentItem && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
              <div className="bg-gradient-to-br bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-700 shadow-2xl">
                <div className="bg-gradient-to-r from-[#071D49] to-[#1a4fff] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentItem.icon && (
                      <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="text-xl">{currentItem.icon}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {currentItem.title || "Introducción"}
                      </h3>
                      <p className="text-blue-100 text-xs">Escucha atentamente el contenido</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="prose prose-invert max-w-none mb-4">
                    <div className="whitespace-pre-line text-slate-300 text-sm leading-relaxed">
                      {currentItem.content}
                    </div>
                  </div>

                  <div className="bg-zinc-800 backdrop-blur-sm rounded-lg p-3 border border-zinc-700">
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => {
                          if (isPlayingAudio) {
                            synthRef.current.pause();
                            setIsPaused(true);
                          } else if (isPaused) {
                            synthRef.current.resume();
                            setIsPaused(false);
                          }
                        }}
                        className={`bg-gradient-to-br from-[#071D49] to-[#1a4fff] w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0
                          ${completedItems.includes(currentItem.id)
                            ? 'cursor-not-allowed'
                            : 'hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
                          }`}
                        disabled={completedItems.includes(currentItem.id)}
                      >
                        <Volume2 className={`w-5 h-5 text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300">Progreso</span>
                          <span className="text-xs font-bold text-blue-400">
                            {Math.round(audioProgress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#071D49] via-[#0e2e80] to-[#1a4fff] transition-all duration-200 rounded-full"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {isPlayingAudio && (
                        <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 rounded-lg p-2">
                          <div className="flex gap-1">
                            <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                            <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                          <span className="text-xs font-medium">Reproduciendo audio...</span>
                        </div>
                      )}

                      {completedItems.includes(currentItem.id) && (
                        <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 rounded-lg p-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-xs">¡Audio completado!</p>
                            <p className="text-xs text-blue-300">Puedes cerrar esta ventana</p>
                          </div>
                        </div>
                      )}

                      {!completedItems.includes(currentItem.id) && !isPlayingAudio && audioProgress === 0 && (
                        <div className="text-center p-2 text-slate-400 text-xs">
                          El audio se reproducirá automáticamente
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de reproducción de intro */}
      {isPlayingIntro && (
        <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4 right-4 bg-zinc-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-zinc-700 shadow-xl z-50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span className="text-white text-sm">Reproduciendo introducción...</span>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {showError && (
        <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4  right-1 lg:right-4 px-6 py-3 bg-red-500/50 border border-red-500/50 rounded-lg flex items-center gap-2 animate-pulse z-50">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-200 text-xs">Orden incorrecto. Sigue la secuencia correcta.</p>
        </div>
      )}

      {/* Popup de audio */}
      {showAudioPopup && (
        <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4  right-1 lg:right-4  bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm text-center animate-pulse z-[9999]">
          🔊 <strong>Estamos intentando reproducir el audio...</strong><br />
          Si el problema persiste, cierra esta etapa y vuelve a cargarla.
        </div>
      )}
    </div>
  );
}

export default DragDropOrder;