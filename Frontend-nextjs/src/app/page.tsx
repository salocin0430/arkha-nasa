'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [video1Loaded, setVideo1Loaded] = useState(false);
  const [video2Loaded, setVideo2Loaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Precargar ambos videos
    const video1 = document.createElement('video');
    video1.src = '/assets/videos/arkha_homepage.mp4';
    video1.preload = 'auto';
    video1.onloadeddata = () => {
      setVideo1Loaded(true);
    };

    const video2 = document.createElement('video');
    video2.src = '/assets/videos/arkha_interior.mp4';
    video2.preload = 'auto';
    video2.onloadeddata = () => {
      setVideo2Loaded(true);
    };
  }, []);

  useEffect(() => {
    // Obtener el main element que tiene el scroll
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentSection === 1) {
        // Scroll hacia abajo - ir a sección 2
        setCurrentSection(2);
        // Calcular la posición exacta de la sección 2
        const section2Top = section2Ref.current?.offsetTop || 0;
        mainElement.scrollTo({ top: section2Top, behavior: 'smooth' });
      } else if (e.deltaY < 0 && currentSection === 2) {
        // Scroll hacia arriba - ir a sección 1
        setCurrentSection(1);
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    mainElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      mainElement.removeEventListener('wheel', handleWheel);
    };
  }, [currentSection]);

  const scrollToSection2 = () => {
    setCurrentSection(2);
    const mainElement = document.querySelector('main');
    const section2Top = section2Ref.current?.offsetTop || 0;
    mainElement?.scrollTo({ top: section2Top, behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white">
      {/* Section 1: Homepage Video */}
      <section ref={section1Ref} className="h-[calc(100vh-80px)] relative">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ opacity: video1Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
          >
            <source src="/assets/videos/arkha_homepage.mp4" type="video/mp4" />
          </video>
          {/* Overlay oscuro para mejor legibilidad */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center text-center px-4 h-full relative z-10">
          <div className="w-96 h-96 mb-6 flex items-center justify-center relative">
            {/* Logo removido por el usuario */}
          </div>

          <Link href="/login" className="mb-10">
            <motion.button 
              className="bg-[#EAFE07] text-black px-8 py-3 rounded-lg font-bold text-lg shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(234, 254, 7, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              START YOUR MISSION
            </motion.button>
          </Link>

          {/* Scroll Arrow */}
          <motion.button 
            onClick={scrollToSection2}
            className="cursor-pointer"
            aria-label="Scroll to next section"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: [0, 10, 0]
            }}
            transition={{
              opacity: { delay: 1, duration: 0.6 },
              y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </motion.button>
        </div>
      </section>

      {/* Section 2: Interior Video */}
      <section ref={section2Ref} className="h-[calc(100vh-80px)] relative">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ opacity: video2Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
          >
            <source src="/assets/videos/arkha_interior.mp4" type="video/mp4" />
          </video>
          {/* Overlay oscuro para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-end text-center px-4 h-full relative z-10 pb-20">
          <motion.h2 
            className="text-5xl font-bold text-white mb-6 drop-shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Experience <span className="text-[#EAFE07]">Life in Space</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-white mb-10 max-w-2xl drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Discover the future of human habitation beyond Earth. Design your adaptive refuge with cutting-edge technology.
          </motion.p>
          
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Link href="/signup">
              <motion.button 
                className="bg-[#EAFE07] text-black px-8 py-3 rounded-lg font-bold text-lg shadow-xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(234, 254, 7, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                CREATE ACCOUNT
              </motion.button>
            </Link>
            <Link href="/gallery">
              <motion.button 
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-bold text-lg shadow-xl border border-white/20"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(234, 254, 7, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                EXPLORE GALLERY
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}