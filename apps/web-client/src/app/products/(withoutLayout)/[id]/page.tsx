'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../../_components/productCard'; // Import your ProductCard component

// Sample luxury product data
const luxuryProduct = {
  id: 'heritage-cashmere-coat',
  name: 'Heritage Cashmere Overcoat',
  brand: 'Atelier Milano',
  price: 2850,
  originalPrice: 3200,
  description: 'Crafted from the finest Grade A Mongolian cashmere, this timeless overcoat embodies understated luxury and meticulous Italian craftsmanship.',
  longDescription: 'Each Heritage Cashmere Overcoat is meticulously handcrafted in our Milan atelier using traditional techniques passed down through generations. The premium Grade A Mongolian cashmere is sourced directly from inner Mongolia\'s finest herders, ensuring exceptional softness and durability.',
  images: [ 
    '/samples/kandura-1.png',
    '/samples/kandura-2.png',
    '/samples/kandora.webp'
  ],
  colors: [
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Camel', hex: '#C19A6B' },
    { name: 'Navy', hex: '#2C3E50' },
    { name: 'Burgundy', hex: '#800020' }
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  specifications: {
    material: '100% Grade A Mongolian Cashmere',
    weight: '480g/m²',
    origin: 'Made in Italy',
    lining: 'Cupro silk blend',
    buttons: 'Natural horn buttons',
    fit: 'Tailored fit with room for layering'
  },
  features: [
    'Hand-finished seams and buttonholes',
    'Natural shoulder construction',
    'Functional sleeve buttons',
    'Interior silk pocket',
    'Dry clean only',
    'Lifetime craftsmanship guarantee'
  ],
  inStock: true,
  deliveryTime: '2-3 weeks for standard sizes',
  rating: 4.8,
  reviewCount: 127
};

// Sample reviews data
const productReviews = [
  {
    id: 1,
    name: 'Alexander M.',
    location: 'New York, NY',
    rating: 5,
    date: '2024-12-15',
    title: 'Exceptional Quality and Craftsmanship',
    review: 'This overcoat exceeded my expectations in every way. The cashmere is incredibly soft and warm, and the tailoring is impeccable. I\'ve received numerous compliments, and it\'s become my go-to coat for important meetings and events.',
    verified: true,
    helpful: 24
  },
  {
    id: 2,
    name: 'Isabella R.',
    location: 'London, UK',
    rating: 5,
    date: '2024-11-28',
    title: 'Worth Every Penny',
    review: 'I was hesitant about the price initially, but after wearing this coat for a month, I can confidently say it\'s worth every penny. The fit is perfect, and the quality is outstanding. It feels like it will last a lifetime.',
    verified: true,
    helpful: 18
  },
  {
    id: 3,
    name: 'James W.',
    location: 'Toronto, CA',
    rating: 4,
    date: '2024-11-10',
    title: 'Beautiful Coat, Sizing Runs Large',
    review: 'Gorgeous coat with incredible attention to detail. The cashmere is luxurious and the construction is top-notch. Only note is that it runs slightly large - I probably could have gone with a size smaller.',
    verified: true,
    helpful: 12
  },
  {
    id: 4,
    name: 'Sophia L.',
    location: 'Paris, FR',
    rating: 5,
    date: '2024-10-22',
    title: 'Timeless Elegance',
    review: 'This coat embodies timeless elegance. The charcoal color is versatile and sophisticated. The custom consultation was also exceptional - they helped me achieve the perfect fit.',
    verified: true,
    helpful: 31
  },
  {
    id: 5,
    name: 'Michael K.',
    location: 'Chicago, IL',
    rating: 4,
    date: '2024-10-05',
    title: 'High Quality, Long Delivery',
    review: 'The quality is undeniable - this is clearly a premium product. The only downside was the delivery time, which took about 4 weeks instead of the promised 2-3. But the wait was worth it.',
    verified: true,
    helpful: 8
  }
];

// Sample similar products data
const similarProducts = [
  {
    id: 'premium-kandora',
    images: ['/samples/kandura-1.png', '/samples/kandura-2.png'],
    name: 'Premium White Kandora',
    price: 'AED 890',
    category: 'Kandoras',
    colors: ['#FFFFFF', '#F5F5F5', '#FFFAFA'] 
  },
  {
    id: 'luxury-bisht',
    images: ['/samples/kandora.webp', '/samples/kandura-1.png'],
    name: 'Luxury Black & Gold Bisht',
    price: 'AED 2,240',
    category: 'Bishts',
    colors: ['#2C3E50', '#36454F', '#000000']
  },
  {
    id: 'summer-kandora',
    images: ['/samples/kandura-2.png', '/samples/kandora.webp'],
    name: 'Summer Cotton Kandora',
    price: 'AED 450',
    category: 'Kandoras',
    colors: ['#FFFFFF', '#F5F5F5', '#FFFAFA']
  },
  {
    id: 'premium-ghutrah',
    images: ['/samples/kandora.webp'],
    name: 'Premium Cotton Ghutrah',
    price: 'AED 140',
    category: 'Accessories',
    colors: ['#FFFFFF', '#C19A6B', '#2C3E50']
  }
];

// Star Rating Component
const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starSizes[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-200'
          } fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function LuxuryProductPage() {
  const [selectedColor, setSelectedColor] = useState<string>(luxuryProduct.colors[0].name);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showAppointment, setShowAppointment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    console.log('Added to cart:', { 
      product: luxuryProduct.id, 
      color: selectedColor, 
      size: selectedSize 
    });
  };

  const displayedReviews = showAllReviews ? productReviews : productReviews.slice(0, 3);
  const averageRating = luxuryProduct.rating;

  return (
    <div className="min-h-screen bg-white mt-12">
      {/* Navigation Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-gray-700">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{luxuryProduct.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
              <Image 
                src={luxuryProduct.images[currentImageIndex]} 
                alt={luxuryProduct.name}
                fill
                className="object-cover"
                priority
              />
              {luxuryProduct.originalPrice > luxuryProduct.price && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-medium">
                  Sale
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-4">
              {luxuryProduct.images.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-square w-20 relative overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index 
                      ? 'border-gray-900' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image 
                    src={image}
                    alt={`${luxuryProduct.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wider text-gray-600 font-medium">
                {luxuryProduct.brand}
              </p>
              <h1 className="text-4xl font-light text-gray-900 leading-tight">
                {luxuryProduct.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={averageRating} size="md" />
                <span className="text-sm text-gray-600">
                  {averageRating} ({luxuryProduct.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-light text-gray-900">
                  ${luxuryProduct.price.toLocaleString()}
                </span>
                {luxuryProduct.originalPrice > luxuryProduct.price && (
                  <span className="text-lg text-gray-500 line-through">
                    ${luxuryProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {luxuryProduct.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Color: <span className="font-light">{selectedColor}</span>
              </h3>
              <div className="flex gap-3">
                {luxuryProduct.colors.map((color) => (
                  <button
                    key={color.name}
                    className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                      selectedColor === color.name
                        ? 'border-gray-900 scale-105'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <div className="absolute inset-0 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Size</h3>
              <div className="grid grid-cols-6 gap-3">
                {luxuryProduct.sizes.map((size) => (
                  <button
                    key={size}
                    className={`h-12 border-2 transition-all text-sm font-medium ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-500 text-gray-900'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Link 
                href="/size-guide" 
                className="text-sm text-gray-600 underline hover:text-gray-900"
              >
                Size Guide
              </Link>
            </div>

            {/* Add to Cart & Custom Appointment */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-gray-900 text-white py-4 px-8 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              
              <button
                onClick={() => setShowAppointment(true)}
                className="w-full border-2 border-gray-900 text-gray-900 py-4 px-8 text-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                Book Custom Consultation
              </button>
              
              <p className="text-sm text-gray-600 text-center">
                {luxuryProduct.deliveryTime} • Free shipping & returns
              </p>
            </div>

            {/* Product Specifications */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(luxuryProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
              <ul className="space-y-2">
                {luxuryProduct.features.map((feature, index) => (
                  <li key={index} className="text-gray-600 text-sm flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-20 pt-16 border-t border-gray-100">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light text-gray-900 mb-6">About This Piece</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {luxuryProduct.longDescription}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20 pt-16 border-t border-gray-100">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} size="md" />
                    <span className="text-lg font-medium text-gray-900">{averageRating}</span>
                  </div>
                  <p className="text-sm text-gray-600">{luxuryProduct.reviewCount} reviews</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8">
              {displayedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{review.name}</h4>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-600 leading-relaxed mb-4">{review.review}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="hover:text-gray-700">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!showAllReviews && productReviews.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="border border-gray-900 text-gray-900 px-8 py-3 font-medium hover:bg-gray-900 hover:text-white transition-colors"
                >
                  View All {luxuryProduct.reviewCount} Reviews
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-20 pt-16 border-t border-gray-100">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-900">You May Also Like</h2>
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 text-sm underline"
              >
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  images={product.images}
                  name={product.name}
                  price={product.price}
                  category={product.category}
                  colors={product.colors}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Appointment Modal */}
      {showAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-900">Book Custom Consultation</h3>
              <button
                onClick={() => setShowAppointment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600">
              Schedule a private consultation with our master tailors to create a bespoke version 
              tailored exclusively for you.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full border border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none"
              />
              <select className="w-full border border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none">
                <option value="">Preferred Time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
              <textarea
                placeholder="Special requests or measurements notes..."
                rows={3}
                className="w-full border border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none resize-none"
              ></textarea>
            </div>
            
            <button
              onClick={() => {
                alert('Appointment request submitted! We\'ll contact you within 24 hours.');
                setShowAppointment(false);
              }}
              className="w-full bg-gray-900 text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors"
            >
              Request Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}