"use client"
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const categories = [
  {
    title: 'All Products',
    image: '/categories/all.png',
    href: '/products',
  },
  {
    title: "Men's Kandura",
    image: '/categories/kandura.png',
    href: '/products/kandura',
  },
  {
    title: "Men's Accessories",
    image: '/categories/items.png',
    href: '/products/accessories',
  },
  {
    title: "Men's Jacket",
    image: '/categories/jacket.png',
    href: '/products/jacket',
  },
  {
    title: "Men's Footwear",
    image: '/categories/footwear.png',
    href: '/products/footwear',
  },
];

export default function CategorySelect() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide">
          Men&apos;s Collection
        </p>
      </div>

      <div className="md:hidden">
        <div className="flex justify-start gap-x-2.5 sm:gap-3 overflow-x-auto p-2">
          {categories.map((category) => (
            <MobileCategoryCard
              key={category.title}
              {...category}
              isActive={pathname === category.href}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Centered grid */}
      <div className="hidden md:flex justify-center gap-6 lg:gap-8 flex-wrap">
        {categories.map((category) => (
          <DesktopCategoryCard
            key={category.title}
            {...category}
            isActive={pathname === category.href}
          />
        ))}
      </div>
    </div>
  );
}

// Mobile component - compact horizontal scrolling design
function MobileCategoryCard({
  title,
  image,
  href,
  isActive,
}: {
  title: string;
  image: string;
  href: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block flex-shrink-0 transition-all duration-300 hover:scale-105"
    >
      <div className={`relative overflow-hidden rounded-md bg-gray-50 mb-2 shadow-sm group-hover:shadow-lg transition-all duration-300 ${
        isActive ? 'ring-2 ring-gray-900 ring-offset-2' : ''
      }`}>
        <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 relative">
          <Image
            height={80}
            width={80}
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </div>
      
      <h3 className="text-center text-xs sm:text-sm font-light tracking-wide text-gray-700 group-hover:text-black transition-colors duration-300 leading-tight max-w-20 mx-auto">
        {title.replace("Men's ", "")}
      </h3>
    </Link>
  );
}

// Desktop component - larger cards in centered layout
function DesktopCategoryCard({
  title,
  image,
  href,
  isActive,
}: {
  title: string;
  image: string;
  href: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block w-32 sm:w-36 lg:w-40 transition-all duration-300 hover:scale-105"
    >
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-50 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300 ${
          isActive ? 'ring-2 ring-gray-900 ring-offset-2 shadow-md' : ''
        }`}
      >
        <div className="aspect-square relative">
          <Image
            height={160}
            width={160}
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
        </div>
      </div>

      <h3 className="text-center text-sm lg:text-base font-light tracking-wide text-gray-700 group-hover:text-black transition-colors duration-300">
        {title.replace("Men's ", '')}
      </h3>
    </Link>
  );
}