"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [requirements, setRequirements] = useState('');
  const [saved, setSaved] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [fromInfo, setFromInfo] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [billToInfo, setBillToInfo] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data when component mounts
  useEffect(() => {
    const savedRequirements = localStorage.getItem('clientRequirements');
    const savedFromInfo = localStorage.getItem('fromInfo');
    const savedBillToInfo = localStorage.getItem('billToInfo');
    const savedEndDate = localStorage.getItem('endDate');
    
    if (savedRequirements) {
      setRequirements(savedRequirements);
      setSaved(true);
    }
    if (savedFromInfo) {
      setFromInfo(JSON.parse(savedFromInfo));
    }
    if (savedBillToInfo) {
      setBillToInfo(JSON.parse(savedBillToInfo));
    }
    if (savedEndDate) {
      setEndDate(savedEndDate);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;
    
    if (requirements && !saved) {
      autoSaveTimer = setTimeout(() => {
        try {
          localStorage.setItem('clientRequirements', requirements);
          localStorage.setItem('fromInfo', JSON.stringify(fromInfo));
          localStorage.setItem('billToInfo', JSON.stringify(billToInfo));
          localStorage.setItem('endDate', endDate);
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
  }, [requirements, saved, fromInfo, billToInfo, endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirements(e.target.value);
    setSaved(false);
  };

  const handleClear = () => {
    setRequirements('');
    setEndDate('');
    setSaved(false);
    localStorage.removeItem('clientRequirements');
    localStorage.removeItem('fromInfo');
    localStorage.removeItem('billToInfo');
    localStorage.removeItem('endDate');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('clientRequirements', requirements);
      localStorage.setItem('fromInfo', JSON.stringify(fromInfo));
      localStorage.setItem('billToInfo', JSON.stringify(billToInfo));
      localStorage.setItem('endDate', endDate);
      setSaved(true);
    } catch (err) {
      alert(`Failed to save data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  const handleProceed = async () => {
    try {
      setIsLoading(true);
      handleSave();
      
      // Make API call to generate quote
      const response = await fetch(`http://127.0.0.1:8000/generate-quote?request=${encodeURIComponent(requirements)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      // First check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If not JSON, get the text content for better error message
        const textContent = await response.text();
        throw new Error(`API returned non-JSON response: ${textContent.substring(0, 100)}...`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail?.[0]?.msg || data.message || 'Failed to generate quote');
      }
      
      if (!data.quote) {
        throw new Error('No quote data received from API');
      }

      // Update data.json file with the new quote data
      const updateResponse = await fetch('/api/updateQuote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update quote data');
      }

      // Only navigate if all operations succeeded
      router.push('/quotePage');
    } catch (error) {
      console.error('Error in handleProceed:', error);
      let errorMessage = 'An unexpected error occurred while generating the quote.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    const sampleFromData = {
      companyName: 'Tech Solutions Inc.',
      contactName: 'John Smith',
      email: 'john.smith@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, Silicon Valley, CA 94025'
    };

    const sampleBillToData = {
      companyName: 'Client Corp',
      contactName: 'Jane Doe',
      email: 'jane.doe@clientcorp.com',
      phone: '+1 (555) 987-6543',
      address: '456 Business Ave, New York, NY 10001'
    };

    setFromInfo(sampleFromData);
    setBillToInfo(sampleBillToData);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] relative">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 pt-12 sm:pt-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-black mb-3 tracking-tight">
            Quote Details
          </h1>
          <p className="text-gray-500 text-lg">Enter quote information and project requirements</p>
          <button
            onClick={handleAutofill}
            className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Autofill Forms
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Billing Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* From Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-black">From</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={fromInfo.companyName}
                    onChange={(e) => setFromInfo({...fromInfo, companyName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={fromInfo.contactName}
                    onChange={(e) => setFromInfo({...fromInfo, contactName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={fromInfo.email}
                      onChange={(e) => setFromInfo({...fromInfo, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={fromInfo.phone}
                      onChange={(e) => setFromInfo({...fromInfo, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={fromInfo.address}
                      onChange={(e) => setFromInfo({...fromInfo, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-black">Bill To</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={billToInfo.companyName}
                    onChange={(e) => setBillToInfo({...billToInfo, companyName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={billToInfo.contactName}
                    onChange={(e) => setBillToInfo({...billToInfo, contactName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={billToInfo.email}
                      onChange={(e) => setBillToInfo({...billToInfo, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={billToInfo.phone}
                      onChange={(e) => setBillToInfo({...billToInfo, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={billToInfo.address}
                      onChange={(e) => setBillToInfo({...billToInfo, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Project Details
                </label>
                <div className="flex items-center space-x-2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Project End Date:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                  />
                </div>
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
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-6">
              {/* Loading Animation */}
              <div className="relative w-20 h-20">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-t-black border-r-black border-b-transparent border-l-transparent animate-spin"></div>
                {/* Inner pulsing circle */}
                <div className="absolute inset-2 rounded-full border-2 border-gray-200 animate-pulse"></div>
                {/* Center dot */}
                <div className="absolute inset-[35%] rounded-full bg-black"></div>
              </div>
              
              {/* Loading Text */}
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Generating Your Quote</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Please wait while we analyze your requirements and prepare a detailed quote.</p>
                  <div className="flex justify-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}