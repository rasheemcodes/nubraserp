'use client';

import {
  Search,
  ShoppingCart,
  User,
  Watch,
  Footprints,
  Bookmark,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export default function NavBar() {
  const navRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  const [vh, setVh] = useState(100); // fallback

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVh(window.innerHeight * 0.1);
    }
  }, []);

  const navShow = useTransform(scrollY, [0, vh * 0.1], [-100, 0]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigations = [
    {
      id: 'kandora',
      url: '/kandora',
      label: 'Kandora',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10 2h4" />
          <path d="M12 2v4" />
          <circle cx="12" cy="7" r="0.5" fill="currentColor" />
          <path d="M10 2c-2 2-4 6-4 18" />
          <path d="M14 2c2 2 4 6 4 18" />
          <path d="M6 20c4 1 8 1 12 0" />
        </svg>
      ),
    },
    {
      id: 'accessories',
      url: '/accessories',
      label: 'Accessories',
      icon: <Watch className="h-4 w-4" />,
    },
    {
      id: 'jackets',
      url: '/jackets',
      label: 'Jackets',
      icon: (
        <Image
          src="/icons/jacket.svg"
          className="stroke-2"
          style={{
            filter:
              isMobileMenuOpen || isFocused || isScrolled
                ? 'invert(0) brightness(1000%)'
                : 'invert(1) brightness(1000%)',
          }}
          alt="Jackets"
          width={16}
          height={16}
        />
      ),
    },
    {
      id: 'footwear',
      url: '/footwear',
      label: 'Footwear',
      icon: <Footprints className="h-4 w-4" />,
    },
  ];

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories = [
    {
      id: 'kandora',
      image: '/samples/kandora.webp',
      items: [
        {
          label: 'Kandora normal',
          url: '/kandora/normal',
        },
        {
          label: 'Kandora italy',
          url: '/kandora/italy',
        },
        {
          label: 'Kandora soof',
          url: '/kandora/soof',
        },
        {
          label: 'Kandora customized fabric',
          url: '/kandora/customized',
        },
      ],
    },
  ];

  return (
    <motion.div
      ref={navRef}
      style={{ y: navShow }}
      className={`fixed top-0 z-[1000] w-full h-12 px-5 md:px-20 flex justify-between items-center
        transition-all duration-300 ease-in-out
        ${
          isFocused || isMobileMenuOpen || isScrolled
            ? 'bg-primary/95 text-black'
            : 'bg-transparent text-white'
        }`}
    >
      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Left: Logo and Search */}
      {/* Animated Logo */}
      <motion.div
        style={{ opacity: 1 }}
        className="text-lg font-serif font-bold tracking-wider"
      >
        Alnubras
      </motion.div>

      {/* Center: Nav */}
      <div className="hidden md:block">
        <ul className="flex items-center gap-x-6">
          {navigations.map((nav) => (
            <li key={nav.url} className="relative">
              <button
                onFocus={() => {
                  setIsFocused(true);
                  setSelectedCategory(nav.id);
                }}
                className="flex items-center gap-x-2 h-12 px-2 focus:outline-none focus:border-b-4 focus:border-gray-800 transition-all duration-200 ease-in-out"
              >
                {nav.icon}
                {nav.label}
              </button>
            </li>
          ))}
          <div
            className={`absolute top-full border-t border-gray-400 left-1/2 -translate-x-1/2 w-1/2 bg-secondary text-sm text-muted-foreground
                transition-all duration-300 ease-in-out transform-gpu rounded-b flex justify-between
                ${
                  isFocused
                    ? 'opacity-100 max-h-[500px] py-6 px-6'
                    : 'opacity-0 max-h-0 py-0 px-6 pointer-events-none'
                }`}
          >
            {selectedCategory && (
              <div className="flex gap-8 items-center">
                {(() => {
                  const selectedCategoryImage = categories.find(
                    (category) => category.id === selectedCategory
                  )?.image;
                  return selectedCategoryImage ? (
                    <div className="w-1/4 aspect-[2/3]">
                      <Image
                        src={selectedCategoryImage}
                        alt={selectedCategory}
                        width={200}
                        height={300}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-1/4 aspect-[2/3] bg-gray-100 rounded-lg" />
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-serif mb-4 capitalize text-foreground">
                    Nubras {selectedCategory}
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {categories
                      .find((category) => category.id === selectedCategory)
                      ?.items.map((item) => (
                        <Link
                          href={item.url}
                          key={item.url}
                          className="flex items-center gap-x-2 text-accent hover:underline underline-2 underline-offset-2 hover:text-accent/80 transition-colors w-full"
                        >
                          <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ul>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-12 bg-primary/95 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-x-2 mb-4">
              <Search className="h-4 w-4" />
              <input
                type="search"
                placeholder="Search"
                className="bg-transparent border-b border-gray-400 w-full focus:outline-none"
              />
            </div>
          </div>

          <ul className="space-y-4">
            {navigations.map((nav) => (
              <li key={nav.url}>
                <button
                  onClick={() => setSelectedCategory(nav.id)}
                  className="flex items-center gap-x-3 w-full py-2"
                >
                  {nav.icon}
                  <span className="text-lg">{nav.label}</span>
                </button>
                {selectedCategory === nav.id &&
                  categories.find((c) => c.id === nav.id) && (
                    <div className="pl-8 mt-2 space-y-2">
                      {categories
                        .find((c) => c.id === nav.id)
                        ?.items.map((item) => (
                          <Link
                            href={item.url}
                            key={item.url}
                            className="block py-1 text-accent"
                          >
                            {item.label}
                          </Link>
                        ))}
                    </div>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <motion.div
            className="flex items-center gap-x-2 relative"
            initial={false}
            animate={{ width: isFocused ? 'auto' : 'fit-content' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Button
              variant="ghost"
              size={'sm'}
              className={`hover:text-gray-800 transition-all duration-300 ${
                isFocused ? 'opacity-0' : 'opacity-100'
              }`}
              onClick={() => setIsFocused(true)}
            >
              <Search className="h-4 w-4" />
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isFocused ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                Search
              </motion.span>
            </Button>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: isFocused ? '200px' : 0,
                opacity: isFocused ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute right-0"
            >
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-transparent border-b-2 border-gray-400 focus:border-primary focus:outline-none py-1 px-2 text-sm"
                onBlur={(e) => {
                  if (!e.target.value) setIsFocused(false);
                }}
                autoFocus={isFocused}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[380px] sm:w-[500px] p-6 z-[10000]"
          >
            <SheetHeader>
              <SheetTitle className="font-serif text-xl">
                Your Wishlist
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Items you&apos;ve saved for later. Take your time to decide!
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              {[
                {
                  name: 'Classic White Kandora',
                  price: 'AED 499',
                  image: '/samples/kandora.webp',
                },
                {
                  name: 'Premium Italian Fabric Kandora',
                  price: 'AED 899',
                  image: '/samples/kandora.webp',
                },
                {
                  name: 'Luxury Watch Collection',
                  price: 'AED 2,999',
                  image: '/samples/kandora.webp',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group hover:bg-muted p-3 rounded-md transition"
                >
                  <div className="rounded-md overflow-hidden">
                    <Image
                      width={80}
                      height={80}
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.price}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="pt-5 border-t flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  3 items in wishlist
                </p>
                <Button variant="outline" size="sm">
                  View All Items
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <ShoppingCart />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[380px] sm:w-[500px] p-6 z-[10000]"
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-serif">
                Shopping Cart
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Manage your cart items
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              {[
                {
                  name: 'Premium Kandora',
                  price: 'AED 899',
                  image: '/samples/kandora.webp',
                  quantity: 1,
                },
                {
                  name: 'Classic Watch',
                  price: 'AED 1,299',
                  image: '/samples/kandora.webp',
                  quantity: 2,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group hover:bg-muted p-3 rounded-md transition"
                >
                  <div className="rounded-md overflow-hidden">
                    <Image
                      width={80}
                      height={80}
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-6 w-6">
                        –
                      </Button>
                      <span className="text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6">
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="pt-5 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-medium">AED 3,497</p>
                </div>
                <Button className="w-full">Checkout</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button variant="ghost" size="icon">
          <User />
        </Button>
      </div>
    </motion.div>
  );
}
