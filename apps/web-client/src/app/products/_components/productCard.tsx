// components/ProductCard.tsx
"use client"
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Heart, Share2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface ProductCardProps {
  id: string;
  images: string[];
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  colors: string[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isSale?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: (productId: string, color?: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onShare?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

export default function ProductCard({
  id,
  images,
  name,
  price,
  originalPrice,
  category,
  colors,
  rating,
  reviewCount,
  isNew = false,
  isSale = false,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onShare,
  onQuickView,
  className = "",
}: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Touch/swipe handling
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    if (images.length > 1) {
      const timer = setTimeout(() => setShowSwipeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [images.length]);

  // Auto-slide functionality on hover (desktop only)
  useEffect(() => {
    if (isHovered && images.length > 1 && window.innerWidth >= 768) {
      autoSlideRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 2500);
    } else if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isHovered, images.length]);

  // Preload images for smoother transitions
  useEffect(() => {
    images.forEach((src, index) => {
      const img = new window.Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(index));
        if (index === 0) setIsImageLoading(false);
      };
      img.src = src;
    });
  }, [images]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > 50 &&
      deltaTime < 500
    ) {
      e.preventDefault();
      setShowSwipeHint(false);

      if (deltaX > 0) {
        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else {
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    }

    touchStartRef.current = null;
  }, [images.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, []);

  const navigateToImage = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [images.length]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id, selectedColor || undefined);
  }, [id, selectedColor, onAddToCart]);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(id);
  }, [id, onToggleWishlist]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(id);
  }, [id, onShare]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(id);
  }, [id, onQuickView]);

  const discountPercentage = useMemo(() => {
    if (!originalPrice || !price) return null;
    const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
    const current = parseFloat(price.replace(/[^0-9.]/g, ''));
    return Math.round(((original - current) / original) * 100);
  }, [originalPrice, price]);

  const renderStars = useMemo(() => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        {reviewCount && (
          <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
        )}
      </div>
    );
  }, [rating, reviewCount]);

  return (
    <div className={`w-full max-w-md group cursor-pointer pb-4 ${className}`}>
      <Link href={`/products/${id}`} className="block">
        {/* Image Section */}
        <div
          ref={imageContainerRef}
          className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 touch-pan-y"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={images.length > 1 ? handleTouchStart : undefined}
          onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
          onTouchMove={images.length > 1 ? handleTouchMove : undefined}
        >
          {/* Loading skeleton */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Images */}
          {images.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                selectedImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <Image
                src={image}
                alt={`${name} - view ${index + 1}`}
                fill
                className={`object-cover transition-transform duration-700 ease-out select-none ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                draggable={false}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                New
              </span>
            )}
            {isSale && discountPercentage && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {onToggleWishlist && (
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 hover:bg-white/90 text-gray-800'
                }`}
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            )}
            {onShare && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm text-gray-800 transition-all duration-300 hover:scale-110"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onQuickView && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm text-gray-800 transition-all duration-300 hover:scale-110"
                onClick={handleQuickView}
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Navigation */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 hidden md:flex items-center justify-center text-gray-800 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateToImage('prev');
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 hidden md:flex items-center justify-center text-gray-800 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateToImage('next');
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedImage === index
                      ? 'bg-white w-6 shadow-lg'
                      : 'bg-white/60 w-1.5 hover:bg-white/80 active:bg-white/90'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Add to Cart Button - Floating (Desktop only) */}
          <Button
            size="sm"
            className="absolute bottom-3 right-3 rounded-full text-xs hidden md:flex shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110 "
            onClick={handleAddToCart}
          >
            <Plus className="w-4 h-4 mr-1" strokeWidth={2} />
            Add to Cart
          </Button>

          {/* Category label */}
          <div className="absolute top-4 right-4 opacity-0 bg-black/80 px-3 py-1 rounded-full group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            <span className="text-white text-xs font-medium tracking-wider uppercase">
              {category}
            </span>
          </div>

          {/* Mobile swipe hint */}
          {images.length > 1 && showSwipeHint && (
            <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
              <div className="animate-pulse">
                <div className="flex items-center gap-2 text-white/90 text-sm font-medium bg-black/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Swipe for more</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex items-start justify-between md:block">
          <div className="flex-1 space-y-2">
            {/* Name and Rating */}
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900 tracking-wide leading-tight group-hover:text-gray-700 transition-colors">
                {name}
              </h3>
              {renderStars}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-semibold text-gray-900 tracking-wide">
                {price}
              </p>
              {originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  {originalPrice}
                </p>
              )}
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-gray-600 mr-1">Colors:</span>
                {colors.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 border-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                      selectedColor === color
                        ? 'border-gray-800 ring-2 ring-gray-400 ring-offset-1'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(selectedColor === color ? null : color);
                    }}
                    title={`Select ${color} color`}
                  />
                ))}
                {colors.length > 5 && (
                  <span className="text-xs text-gray-500 font-medium">
                    +{colors.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mobile Add to Cart Button */}
          <Button
            className="md:hidden ml-3 rounded-full active:scale-95"
            onClick={handleAddToCart}
          >
            <Plus className="w-4 h-4 mr-1" strokeWidth={2} />
            Add
          </Button>
        </div>
      </Link>
    </div>
  );
}