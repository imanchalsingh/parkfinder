import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinOff, Home, Map, CalendarCheck, Shield } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-8">
        
        {/* Animated Graphic */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center relative shadow-inner">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, -10, 10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-indigo-500 dark:text-indigo-400 z-10"
            >
              <MapPinOff size={100} strokeWidth={1.5} />
            </motion.div>
            
            {/* Background decorative elements */}
            <motion.div 
              className="absolute w-full h-full border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <motion.div
            className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              404
            </span>
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-4 max-w-xl">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Oops! You seem to be lost.
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            We've searched everywhere, but the page you're looking for doesn't exist or has been moved.
          </motion.p>
        </div>

        {/* Primary Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm sm:max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Go Back
          </button>
          <Link 
            to="/"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Return Home
          </Link>
        </motion.div>

        {/* Helpful Links */}
        <motion.div 
          className="w-full max-w-2xl mt-8 pt-8 border-t border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">
            Helpful Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/parkingslots" className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group shadow-sm hover:shadow-md">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                <Map size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Parking Slots</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Find a spot</p>
              </div>
            </Link>
            
            <Link to="/bookings" className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group shadow-sm hover:shadow-md">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                <CalendarCheck size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Bookings</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your reservations</p>
              </div>
            </Link>
            
            <Link to="/privacy" className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-colors group shadow-sm hover:shadow-md">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Privacy Policy</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Data usage</p>
              </div>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFoundPage;
