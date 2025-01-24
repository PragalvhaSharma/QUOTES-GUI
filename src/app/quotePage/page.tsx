"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import quoteData from '../data.json';

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
  rate: string;
  quantity: string;
  tempQuantity?: string;
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
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LineItem>>({
    description: '',
    details: '',
    rate: '0',
    quantity: '0',
    url: '',
    image_url: '',
  });

  const [items, setItems] = useState<LineItem[]>(
    typedQuoteData.quote.items.map((item: QuoteItem) => ({
      id: item.id || Math.random(),
      description: item.name,
      details: item.description,
      rate: (item.price_per_unit || 0).toString(),
      quantity: (item.quantity || 0).toString(),
      tempQuantity: item.quantity ? item.quantity.toString() : '0',
      url: item.url,
      image_url: item.image_url,
    }))
  );

  // Add state for labor hours
  const [laborHours, setLaborHours] = useState<string>('0');
  const [laborRate, setLaborRate] = useState<string>('75'); // Default hourly rate
  const [isEditingLabor, setIsEditingLabor] = useState(false);
  const [isEditingLaborRate, setIsEditingLaborRate] = useState(false);

  // Add refs for inputs
  const rateInputRefs = useRef<{[key: number]: HTMLInputElement}>({});
  const quantityInputRefs = useRef<{[key: number]: HTMLInputElement}>({});
  const laborHoursRef = useRef<HTMLInputElement>(null);
  const laborRateRef = useRef<HTMLInputElement>(null);
  const markupRef = useRef<HTMLInputElement>(null);

  // Add state for markup
  const [markupPercentage, setMarkupPercentage] = useState<string>('15'); // Default 15% markup
  const [isEditingMarkup, setIsEditingMarkup] = useState(false);

  // Add effect for markup input
  useEffect(() => {
    if (isEditingMarkup && markupRef.current) {
      setTimeout(() => {
        if (markupRef.current) {
          markupRef.current.selectionStart = markupRef.current.value.length;
          markupRef.current.selectionEnd = markupRef.current.value.length;
        }
      }, 0);
    }
  }, [isEditingMarkup]);

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

  useEffect(() => {
    if (focusedInput?.type === 'quantity' && quantityInputRefs.current[focusedInput.id]) {
      setTimeout(() => {
        const input = quantityInputRefs.current[focusedInput.id];
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
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
    
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, rate: value };
      }
      return item;
    }));
  };

  const handleQuantityChange = (id: number, value: string) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
    
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, quantity: value };
      }
      return item;
    }));
  };

  const handleLaborHoursChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
    setLaborHours(value);
  };

  const handleLaborRateChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
    setLaborRate(value);
  };

  const handleMarkupChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
    setMarkupPercentage(value);
  };

  const calculateAmount = (rate: string, quantity: string) => {
    const rateNum = parseFloat(rate) || 0;
    const quantityNum = parseFloat(quantity) || 0;
    return (rateNum * quantityNum).toFixed(2);
  };

  const calculateSubtotal = () => {
    const itemsTotal = items.reduce((sum, item) => {
      const rate = parseFloat(item.rate) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return sum + (rate * quantity);
    }, 0);
    const laborHoursNum = parseFloat(laborHours) || 0;
    const laborRateNum = parseFloat(laborRate) || 0;
    const laborTotal = laborHoursNum * laborRateNum;
    return (itemsTotal + laborTotal).toFixed(2);
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.13).toFixed(2);
  };

  const calculateMarkup = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return ((subtotal * parseFloat(markupPercentage) / 100).toFixed(2));
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(calculateTax());
    const markup = parseFloat(calculateMarkup());
    return (subtotal + tax + markup).toFixed(2);
  };

  const calculateLaborCost = () => {
    return (parseFloat(laborHours) * parseFloat(laborRate)).toFixed(2);
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

  const handleAddItem = () => {
    if (newItem.description && newItem.details) {
      setItems([...items, {
        id: Math.random(),
        description: newItem.description || '',
        details: newItem.details || '',
        rate: newItem.rate || '0',
        quantity: newItem.quantity || '0',
        url: '', // Default empty string
        image_url: '', // Default empty string
      }]);
      setNewItem({
        description: '',
        details: '',
        rate: '0',
        quantity: '0',
        url: '',
        image_url: '',
      });
      setShowAddItemModal(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

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
              <span className="font-semibold text-gray-900">{today}</span>
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
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-6H7v4h6V7zm2 0h1v4h-1V7zm1 6h-1v2h1v-2zm-7-1H4v-2h6v2zm-6-3h6v-2H4v2z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-gray-900">{typedQuoteData.quote.companyInfo.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600">{typedQuoteData.quote.companyInfo.contact}</p>
            </div>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.email}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.phone}</p>
            <p className="text-gray-600">{typedQuoteData.quote.companyInfo.address}</p>
          </div>
          <div className="space-y-2 flex-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <span className="h-5 w-1 bg-cyan-500 rounded-full"></span>
              Bill to
            </h2>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-6H7v4h6V7zm2 0h1v4h-1V7zm1 6h-1v2h1v-2zm-7-1H4v-2h6v2zm-6-3h6v-2H4v2z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-gray-900">{typedQuoteData.quote.clientInfo.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600">{typedQuoteData.quote.clientInfo.email}</p>
            </div>
            <p className="text-gray-600">{typedQuoteData.quote.clientInfo.phone}</p>
            <p className="text-gray-600">{typedQuoteData.quote.clientInfo.address}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Items</h3>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>
          </div>
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
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.description}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(item.image_url)}
                        />
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{item.description}</p>
                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.details}</p>
                            {item.url && (
                              <a 
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 000 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                View Product
                              </a>
                            )}
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
                        value={focusedInput?.id === item.id && focusedInput?.type === 'rate'
                          ? item.rate === '0' ? '' : item.rate
                          : (parseFloat(item.rate) || 0).toFixed(2)}
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
                      ref={(el) => {
                        if (el) quantityInputRefs.current[item.id] = el;
                      }}
                      value={focusedInput?.id === item.id && focusedInput?.type === 'quantity'
                        ? item.quantity === '0' ? '' : item.quantity
                        : (parseFloat(item.quantity) || 0).toFixed(2)}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onFocus={() => setFocusedInput({ id: item.id, type: 'quantity' })}
                      onBlur={() => setFocusedInput(null)}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300"
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
                value={isEditingLabor && laborHours === '0' 
                  ? '' 
                  : isEditingLabor 
                    ? laborHours
                    : (parseFloat(laborHours) || 0).toFixed(2)}
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
                value={isEditingLaborRate && laborRate === '0' 
                  ? '' 
                  : isEditingLaborRate 
                    ? laborRate
                    : `$${(parseFloat(laborRate) || 0).toFixed(2)}`}
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

        {/* Markup Section */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-5 w-1 bg-blue-500 rounded-full"></span>
            Markup
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Markup Percentage</label>
              <input
                type="text"
                ref={markupRef}
                value={isEditingMarkup && markupPercentage === '0' 
                  ? '' 
                  : isEditingMarkup 
                    ? markupPercentage
                    : `${(parseFloat(markupPercentage) || 0)}%`}
                onChange={(e) => handleMarkupChange(e.target.value)}
                onFocus={() => setIsEditingMarkup(true)}
                onBlur={() => setIsEditingMarkup(false)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Markup Amount</label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-900">
                ${calculateMarkup()}
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
                <span className="text-gray-600">Markup ({markupPercentage}%):</span>
                <span className="font-semibold text-gray-900">${calculateMarkup()}</span>
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

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Add New Item</h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newItem.details}
                    onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all min-h-[100px] text-black"
                    placeholder="Enter item description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate ($)</label>
                    <input
                      type="text"
                      value={newItem.rate || ''}
                      onChange={(e) => setNewItem({ ...newItem, rate: e.target.value === '' ? '0' : e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="text"
                      value={newItem.quantity || ''}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value === '' ? '0' : e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.description || !newItem.details}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
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

        {/* Next Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push('/customerPDF')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2 hover:shadow-lg"
          >
            <span>Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
