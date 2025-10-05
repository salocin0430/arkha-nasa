'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import NavbarContent from './NavbarContent';

export default function PersistentNavbar() {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 h-20"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4 md:px-6">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link href="/" className="cursor-pointer">
            <motion.img
              src="/icono-arkha-blanco.png" 
              alt="ARKHA Logo" 
              className="w-16 h-16 object-contain"
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>
        </motion.div>
        
        <motion.nav 
          className="flex items-center space-x-3 md:space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <NavbarContent />
        </motion.nav>
      </div>
    </motion.header>
  );
}
