"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [requirements, setRequirements] = useState('');
  const [saved, setSaved] = useState(false);

  // Load saved requirements when component mounts
  useEffect(() => {
    const savedRequirements = localStorage.getItem('clientRequirements');
    if (savedRequirements) {
      setRequirements(savedRequirements);
      setSaved(true);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;
    
    if (requirements && !saved) {
      autoSaveTimer = setTimeout(() => {
        try {
          localStorage.setItem('clientRequirements', requirements);
          setSaved(true);
          
          // Reset saved state after showing success
          const resetTimer = setTimeout(() => {
            setSaved(false);
          }, 2000);
          
          return () => clearTimeout(resetTimer);
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [requirements, saved]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirements(e.target.value);
    setSaved(false);
  };

  const handleClear = () => {
    setRequirements('');
    setSaved(false);
    localStorage.removeItem('clientRequirements');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('clientRequirements', requirements);
      setSaved(true);
    } catch (err) {
      alert(`Failed to save requirements: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCopy = async () => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = requirements;
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.select();
      document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      // Show success state
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch {
      alert('Failed to copy text. Please try selecting and copying manually.');
    }
  };

  const handleProceed = () => {
    // Save before proceeding
    handleSave();
    // Navigate to quote page
    router.push('/quotePage');
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 pt-12 sm:pt-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-black mb-3 tracking-tight">
            Client Requirements
          </h1>
          <p className="text-gray-500 text-lg">Capture your project needs in detail</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Project Details
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Be as specific as possible about your requirements
              </p>
            </div>
            
            <textarea
              id="requirements"
              className="w-full min-h-[400px] p-5 bg-transparent border-0 focus:ring-0 text-gray-800 text-lg resize-none placeholder:text-gray-400"
              placeholder="Start typing or paste your requirements here..."
              value={requirements}
              onChange={handleChange}
              style={{ outline: 'none' }}
            />
            
            <div className="mt-6 flex justify-between items-center text-sm border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="font-medium">{requirements.length} characters</span>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                  onClick={handleCopy}
                  disabled={requirements.length === 0}
                >
                  Copy
                </button>
                <button 
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                  onClick={handleClear}
                  disabled={requirements.length === 0}
                >
                  Clear
                </button>
                <button 
                  className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
                  onClick={handleSave}
                  disabled={requirements.length === 0 || saved}
                >
                  {saved ? 'Saved' : 'Save Requirements'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleProceed}
              disabled={requirements.length === 0}
              className={`
                px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300
                ${requirements.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-black to-gray-800 text-white hover:shadow-lg hover:scale-105 active:scale-100'
                }
              `}
            >
              <span className="flex items-center space-x-2">
                <span>Proceed</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}