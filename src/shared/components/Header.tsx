import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SubmitApiModal } from '../../components/SubmitApiModal';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 
                            flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              {/* Desktop text */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-100">AI API Kit</h1>
                <p className="text-sm text-gray-400">Resource Directory</p>
              </div>
              {/* Mobile text */}
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold text-gray-100">AI API Kit</h1>
                <p className="text-xs text-gray-400">Resource Directory</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg 
                         hover:bg-gray-700 transition-colors duration-200"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg 
                         hover:bg-gray-700 transition-colors duration-200"
              >
                Contact
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 
                         transition-colors duration-200 flex items-center gap-2"
              >
                Submit API
              </button>
            </div>
          </div>
        </div>
      </header>

      <SubmitApiModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
