"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import quoteData from './data.json';

interface QuoteItem {
  id?: number;
  name: string;
  description: string;
  price_per_unit: number;
  quantity: number;
  url: string;
  image_url: string;
}

interface QuoteData {
  quote: {
    quoteInfo: {
      quoteNumber: string;
      validUntil: string;
    };
    companyInfo: {
      name: string;
      contact: string;
      email: string;
      phone: string;
      address: string;
    };
    clientInfo: {
      company: string;
      email: string;
      phone: string;
      address: string;
    };
    items: QuoteItem[];
  };
}

interface LineItem {
  id: number;
  description: string;
  details: string;
  rate: number;
  quantity: number;
  url: string;
  image_url: string;
}

export default function QuotePage() {
  const router = useRouter();
  const typedQuoteData = quoteData as QuoteData;
  
  // Add state for focused inputs and deleted items
  const [focusedInput, setFocusedInput] = useState<{ id: number, type: 'rate' | 'quantity' } | null>(null);
  const [deletedItems, setDeletedItems] = useState<LineItem[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [lastDeletedItem, setLastDeletedItem] = useState<LineItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [items, setItems] = useState<LineItem[]>(
    typedQuoteData.quote.items.map((item: QuoteItem) => ({
      id: item.id || Math.random(),
      description: item.name,
      details: item.description,
      rate: item.price_per_unit || 0,
      quantity: item.quantity || 0,
      url: item.url,
      image_url: item.image_url,
    }))
  );

  // Add state for labor hours
  const [laborHours, setLaborHours] = useState(0);
  const [laborRate, setLaborRate] = useState(75); // Default hourly rate
  const [isEditingLabor, setIsEditingLabor] = useState(false);
  const [isEditingLaborRate, setIsEditingLaborRate] = useState(false);

  // Add refs for inputs
  const laborHoursRef = useRef<HTMLInputElement>(null);
  const laborRateRef = useRef<HTMLInputElement>(null);
  const rateInputRefs = useRef<{[key: number]: HTMLInputElement}>({});

  // Effect to handle cursor position
  useEffect(() => {
    if (isEditingLabor && laborHoursRef.current) {
      setTimeout(() => {
        if (laborHoursRef.current) {
          laborHoursRef.current.selectionStart = laborHoursRef.current.value.length;
          laborHoursRef.current.selectionEnd = laborHoursRef.current.value.length;
        }
      }, 0);
    }
  }, [isEditingLabor]);

  useEffect(() => {
    if (isEditingLaborRate && laborRateRef.current) {
      setTimeout(() => {
        if (laborRateRef.current) {
          laborRateRef.current.selectionStart = laborRateRef.current.value.length;
          laborRateRef.current.selectionEnd = laborRateRef.current.value.length;
        }
      }, 0);
    }
  }, [isEditingLaborRate]);

  useEffect(() => {
    if (focusedInput?.type === 'rate' && rateInputRefs.current[focusedInput.id]) {
      setTimeout(() => {
        const input = rateInputRefs.current[focusedInput.id];
        if (input) {
          input.selectionStart = input.value.length;
          input.selectionEnd = input.value.length;
        }
      }, 0);
    }
  }, [focusedInput]);

  const handleBack = () => {
    router.back();
  };

  const handleRateChange = (id: number, value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, rate: parseFloat(numericValue) || 0 };
      }
      return item;
    }));
  };

  const handleQuantityChange = (id: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, quantity: parseInt(numericValue) || 0 };
      }
      return item;
    }));
  };

  const handleLaborHoursChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setLaborHours(parseFloat(numericValue) || 0);
  };

  const handleLaborRateChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setLaborRate(parseFloat(numericValue) || 0);
  };

  const calculateAmount = (rate: number, quantity: number) => {
    return (rate * quantity).toFixed(2);
  };

  const calculateSubtotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
    const laborTotal = laborHours * laborRate;
    return (itemsTotal + laborTotal).toFixed(2);
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.13).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(calculateTax());
    return (subtotal + tax).toFixed(2);
  };

  const calculateLaborCost = () => {
    return (laborHours * laborRate).toFixed(2);
  };

  const handleDelete = (id: number) => {
    const itemToDelete = items.find(item => item.id === id);
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== id));
      setDeletedItems([...deletedItems, itemToDelete]);
      setLastDeletedItem(itemToDelete);
      setShowUndo(true);
      // Hide undo after 5 seconds
      setTimeout(() => {
        setShowUndo(false);
        setLastDeletedItem(null);
      }, 5000);
    }
  };

  const handleUndo = () => {
    if (lastDeletedItem) {
      setItems([...items, lastDeletedItem]);
      setDeletedItems(deletedItems.filter(item => item.id !== lastDeletedItem.id));
      setShowUndo(false);
      setLastDeletedItem(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
        {/* Quote Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quote</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 mt-2 rounded-full"></div>
          </div>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between gap-8">
              <span className="text-gray-600">Quote no.</span>
              <span className="font-semibold text-gray-900">{typedQuoteData.quote.quoteInfo.quoteNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-600">Quote date:</span>
              <span className="font-semibold text-gray-900">Jan 21, 2025</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-600">Due:</span>
              <span className="font-semibold text-gray-900">{typedQuoteData.quote.quoteInfo.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="flex justify-between mb-12 gap-12">
          <div className="space-y-2 flex-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <span className="h-5 w-1 bg-blue-500 rounded-full"></span>
              From
            </h2>
            <p className="font-semibold text-gray-900">{typedQuoteData.quote.companyInfo.name}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.contact}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.email}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.phone}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.address}</p>
          </div>
          <div className="space-y-2 flex-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <span className="h-5 w-1 bg-cyan-500 rounded-full"></span>
              Bill to
            </h2>
            <p className="font-semibold text-gray-900">{typedQuoteData.quote.clientInfo.company}</p>
            <p className="text-gray-600">{typedQuoteData.quote.clientInfo.email}</p>
            <p className="text-gray-600">{typedQuoteData.quote.clientInfo.phone}</p>
            <p className="text-gray-600">{typedQuoteData.quote.clientInfo.address}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">DESCRIPTION</th>
                <th className="text-right p-4 font-semibold text-gray-700">RATE</th>
                <th className="text-right p-4 font-semibold text-gray-700">QTY</th>
                <th className="text-right p-4 font-semibold text-gray-700">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.description}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(item.image_url)}
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{item.description}</p>
                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.details}</p>
                            <a 
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>
                              View Product
                            </a>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="relative flex items-center justify-end">
                      <input
                        type="text"
                        ref={(el) => {
                          if (el) rateInputRefs.current[item.id] = el;
                        }}
                        value={focusedInput?.id === item.id && focusedInput?.type === 'rate' && item.rate === 0
                          ? ''
                          : focusedInput?.id === item.id && focusedInput?.type === 'rate'
                            ? item.rate.toString()
                            : `$${item.rate.toFixed(2)}`}
                        onChange={(e) => handleRateChange(item.id, e.target.value)}
                        onFocus={() => setFocusedInput({ id: item.id, type: 'rate' })}
                        onBlur={() => setFocusedInput(null)}
                        className="w-32 bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <input
                      type="text"
                      value={focusedInput?.id === item.id && focusedInput?.type === 'quantity' && item.quantity === 0 
                        ? '' 
                        : item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onFocus={() => setFocusedInput({ id: item.id, type: 'quantity' })}
                      onBlur={() => setFocusedInput(null)}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="p-6 text-right font-semibold text-gray-900">
                    ${calculateAmount(item.rate, item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Labor Hours Section */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-5 w-1 bg-blue-500 rounded-full"></span>
            Labor Hours
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Hours</label>
              <input
                type="text"
                ref={laborHoursRef}
                value={isEditingLabor && laborHours === 0 
                  ? '' 
                  : isEditingLabor 
                    ? laborHours.toString() 
                    : laborHours.toFixed(2)}
                onChange={(e) => handleLaborHoursChange(e.target.value)}
                onFocus={() => setIsEditingLabor(true)}
                onBlur={() => setIsEditingLabor(false)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Hourly Rate</label>
              <input
                type="text"
                ref={laborRateRef}
                value={isEditingLaborRate && laborRate === 0 
                  ? '' 
                  : isEditingLaborRate 
                    ? laborRate.toString()
                    : `$${laborRate.toFixed(2)}`}
                onChange={(e) => handleLaborRateChange(e.target.value)}
                onFocus={() => setIsEditingLaborRate(true)}
                onBlur={() => setIsEditingLaborRate(false)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Total Labor Cost</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900">
                ${calculateLaborCost()}
              </div>
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back</span>
          </button>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">${calculateSubtotal()}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Tax (13%):</span>
                <span className="font-semibold text-gray-900">${calculateTax()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between gap-8">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-gray-900">${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Undo Notification */}
        {showUndo && lastDeletedItem && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
            <span>Item deleted</span>
            <button
              onClick={handleUndo}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Undo
            </button>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(1rem); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
