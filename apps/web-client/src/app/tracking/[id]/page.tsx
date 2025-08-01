'use client';

import { useState } from 'react';
import { Package, Truck, Star, MessageSquare, Download, Check, Settings, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function TrackingPage() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Mock tracking data - would come from API
  const orderData = {
    id: 'ORD-2024-001',
    date: '2024-01-15T10:30:00',
    status: 'delivered',
    total: 1250.0,
    items: 2,
    products: [
      {
        name: 'Premium Thobe - White',
        price: 850.0,
        quantity: 1,
      },
      {
        name: 'Luxury Bisht - Black & Gold', 
        price: 400.0,
        quantity: 1,
      }
    ],
    steps: [
      {
        title: 'Order Placed',
        description: 'Your order has been confirmed',
        date: '2024-01-15T10:30:00',
        icon: <ShoppingCart />,
        completed: true
      },
      {
        title: 'Processing',
        description: 'Order is being prepared',
        date: '2024-01-15T14:20:00', 
        icon: <Settings />,
        completed: true
      },
      {
        title: 'Shipped',
        description: 'Package is on the way',
        date: '2024-01-16T09:15:00',
        icon: <Truck />,
        completed: true
      },
      {
        title: 'Delivered',
        description: 'Package has been delivered',
        date: '2024-01-17T15:45:00',
        icon: <Check />,
        completed: true
      }
    ],
    updates: [
      {
        message: 'Package delivered to front door',
        timestamp: '2024-01-17T15:45:00'
      },
      {
        message: 'Out for delivery with courier',
        timestamp: '2024-01-17T09:30:00'
      },
      {
        message: 'Arrived at local delivery facility',
        timestamp: '2024-01-16T18:20:00'
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white py-12 mt-12">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* --- The Entire Page is a Single Card --- */}
          
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                Order #{orderData.id}
              </h1>
              <p className="text-gray-500 mt-1">
                Placed on {new Date(orderData.date).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Download size={16} /> Invoice
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Main Content Grid (2x2 layout inside the single card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

            {/* Top-Left: Tracking Progress */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Tracking Progress</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                {orderData.steps.map((step, index) => {
                  const isCompleted = step.completed;
                  return (
                    <div key={index} className="relative flex items-start mb-6 last:mb-0">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full z-10 
                        ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-400 text-gray-700'}`}>
                        {isCompleted ? <Check size={16} /> : <Package size={16} />}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {step.description}
                          {step.date && ` at ${new Date(step.date).toLocaleDateString()} ${new Date(step.date).toLocaleTimeString()}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top-Right: Products List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Items in this order</h2>
              <div className="space-y-3">
                {orderData.products.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-gray-900 truncate">{product.name}</h5>
                      <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      AED {product.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom-Left: Recent Updates */}
            <div className="mt-6 md:mt-0">
              <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
              <div className="space-y-4">
                {orderData.updates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2.5" />
                    <div>
                      <p className="text-gray-900">{update.message}</p>
                      <time className="text-sm text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom-Right: Write a Review Section */}
            {orderData.status === 'delivered' && (
              <div className="mt-6 md:mt-0">
                <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                        <Star
                          size={24}
                          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Share your experience with this order..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="mb-4 h-20"
                  rows={6}
                />
                <Button
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                  disabled={!rating || !review}
                >
                  <MessageSquare size={18} /> Submit Review
                </Button>
              </div>
            )}
          </div>
      </div>
    </main>
  );
}