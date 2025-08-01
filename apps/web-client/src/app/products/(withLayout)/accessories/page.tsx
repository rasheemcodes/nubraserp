'use client';
import React from 'react';
import { sampleProducts } from '../../sample';
import ProductCard from '../../_components/productCard';

export default function AccessoriesPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 md:gap-4 items-center justify-center">
      {sampleProducts.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
