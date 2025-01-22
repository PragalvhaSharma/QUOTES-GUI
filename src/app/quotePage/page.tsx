"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import quoteData from './data.json';

interface LineItem {
  id: number;
  description: string;
  details: string;
  rate: number;
  quantity: number;
}

export default function QuotePage() {
  const router = useRouter();
  
  // Default rates for items
  const defaultRates: { [key: string]: number } = {
    "4x4 pressure-treated lumber": 15.98,
    "2x8 pressure-treated lumber": 22.97,
    "2x6 pressure-treated decking boards": 18.97,
    "2x4 pressure-treated lumber": 12.97,
    "4x6 pressure-treated stringers for stairs": 34.98,
    "3-inch exterior deck screws": 29.97,
    "16d galvanized nails": 24.97,
    "Joist hangers compatible with 2x8 lumber": 3.97,
    "Post brackets compatible with 4x4 posts": 8.97,
    "Railing brackets": 4.93,
    "Concrete mix, 50 lb bags": 5.21,
    "Gravel, 1 cubic foot bags": 5.97
  };

  const [items, setItems] = useState<LineItem[]>(
    quoteData.items.map((item, index) => ({
      id: index + 1,
      description: item.rawMaterialName,
      details: item.description,
      rate: defaultRates[item.rawMaterialName] || 0,
      quantity: parseInt(item.amountNeeded) || 0,
    }))
  );

  const handleBack = () => {
    router.back();
  };

  const handleRateChange = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, rate: parseFloat(value) || 0 };
      }
      return item;
    }));
  };

  const handleQuantityChange = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, quantity: parseInt(value) || 0 };
      }
      return item;
    }));
  };

  const calculateAmount = (rate: number, quantity: number) => {
    return (rate * quantity).toFixed(2);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.rate * item.quantity), 0).toFixed(2);
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
              <span className="font-semibold text-gray-900">{quoteData.quoteInfo.quoteNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-600">Quote date:</span>
              <span className="font-semibold text-gray-900">Jan 21, 2025</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-600">Due:</span>
              <span className="font-semibold text-gray-900">{quoteData.quoteInfo.validUntil}</span>
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
            <p className="font-semibold text-gray-900">{quoteData.companyInfo.name}</p>
            <p className="text-gray-600">{quoteData.companyInfo.contact}</p>
            <p className="text-gray-600">{quoteData.companyInfo.email}</p>
            <p className="text-gray-600">{quoteData.companyInfo.phone}</p>
            <p className="text-gray-600">{quoteData.companyInfo.address}</p>
          </div>
          <div className="space-y-2 flex-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <span className="h-5 w-1 bg-cyan-500 rounded-full"></span>
              Bill to
            </h2>
            <p className="font-semibold text-gray-900">{quoteData.clientInfo.company}</p>
            <p className="text-gray-600">{quoteData.clientInfo.email}</p>
            <p className="text-gray-600">{quoteData.clientInfo.phone}</p>
            <p className="text-gray-600">{quoteData.clientInfo.address}</p>
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
                    <div>
                      <p className="font-semibold text-gray-900">{item.description}</p>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.details}</p>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-gray-900 mr-1">$</span>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleRateChange(item.id, e.target.value)}
                        className="w-24 text-right bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-20 text-right bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min="0"
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
      </div>
    </main>
  );
}
