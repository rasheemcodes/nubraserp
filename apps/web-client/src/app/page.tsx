'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, HelpCircle, MapPin, Mouse, Phone } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.35]); // Fade to 65% opacity
  const y = useTransform(scrollY, [0, 100], [0, -15]); // Move up 15% on scroll

  const collections = [
    {
      name: 'Yahālā Baby Collection',
      image: '/collections/littleosis.png',
      description:
        'Complete infant collection featuring 8 kandora, 4 jalabiya, 2 bischt, 4 wazar, 4 mugasar/pantalon, 1 ezga, and 2 hamdaniya (white & red). Available in sizes 0-3, 3-6, 6-9, and 9-12 months.',
      price: 2100,
      items: 29,
    },
    {
      name: "Sultan's Signature Set",
      image: '/collections/sultans-set.png',
      description:
        'Luxurious 6-piece collection featuring 1 kandora, 1 jalabiya, 1 wazar, 1 mugasar/pantalon, and 2 hamdaniya (white & red)',
      price: 525,
      items: 6,
    },
    {
      name: 'Thalatha & Ghitra Set',
      image: '/collections/thalatha.png',
      description:
        '3 premium cotton kandoras with 1 white ghitra — classic Emirati essentials for everyday elegance.',
      price: 656.25,
      items: 4,
    },
    {
      name: 'Zahrat Al-Rajul Set',
      image: '/collections/zahrat-al-rajul.png',
      description:
        'A refined Emirati ensemble with a kandora, bisht, wazar, and hamdaniya — softened by a single bloom of tradition.',
      price: 593.5,
      items: 4,
    },
    {
      name: 'Rāyhān Set ',
      image: '/collections/rayhan.png',
      description:
        'An 8-piece Emirati ensemble of timeless tradition — elevated with soft textures, flowing form, and a single flower of elegance.',
      price: 1050,
      items: 8,
    },
    {
      name: 'AlMukammal Set ',
      image: '/collections/almukkammal.png',
      description:
        'A complete 13-piece men’s wardrobe rooted in tradition — tailored for presence, grace, and Gulf heritage.',
      price: 1365,
      items: 13,
    },
  ];
  return (
    <div className="min-h-screen w-full">
      <section className="flex flex-col items-center justify-center h-screen relative">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/hero-video.mp4"
        />
        <div
          className="flex flex-col absolute inset-0 items-center justify-center h-screen bg-black/50 w-full z-10"
          aria-hidden
        />

        <div className="flex flex-col justify-center w-full absolute top-1/2 -translate-y-1/2 items-center z-50 gap-6">
          <motion.h1
            style={{ opacity, y }}
            className="text-[6.5rem] lg:text-[8rem] xl:text-[9rem] font-bold tracking-widest leading-[0.9] text-white font-serif"
          >
            Alnubras
          </motion.h1>
          <p className="text-lg text-muted">
            Where heritage flows into modern craftsmanship.
          </p>
          <div className="flex items-center gap-x-6">
            <Button>Shop Now</Button>
            <Button variant="secondary">Explore our collection</Button>
          </div>
        </div>

        <motion.div
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-6 flex flex-col items-center gap-1 text-white/80 z-50"
        >
          <span className="text-xs">Scroll Down</span>
          <motion.div
            animate={{
              y: [0, 3, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.25,
            }}
          >
            <Mouse className="h-4 w-4 rotate-45" />
          </motion.div>
        </motion.div>
      </section>
      <section className="relative z-50 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight mb-8">
              Crafting Timeless Elegance, <br />
              <span className="italic text-gray-600">One Stitch at a Time</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
              At Alnubras, we believe that every stitch tells a story. Our
              garments are crafted with precision and passion, blending
              traditional techniques with modern design. From the finest fabrics
              to the most intricate details, we create pieces that are not just
              clothing, but works of art.
            </p>
          </div>
          <div className="flex-1 relative max-w-sm mx-auto md:mx-0">
            <div className="absolute -inset-2 bg-gray-50 rounded-xl -rotate-1"></div>
            <Image
              src="/chair-sitting.png"
              alt="About Us"
              width={300}
              height={300}
              className="relative w-full h-[400px] rounded-lg object-cover transition-transform hover:scale-[1.01] duration-200"
              priority
            />
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight mb-4 tracking-wide">
              Explore our collection
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              From the finest fabrics to the most intricate details, we create
              pieces that are not just clothing, but works of art.
            </p>
          </div>

          {/* Collection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {collections.map((collection) => (
              <div key={collection.name} className="group cursor-pointer">
                <div className="flex flex-col transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[2/3] mb-4 bg-gray-50">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      width={400}
                      height={600}
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-102"
                    />
                    {/* Hover overlay with description */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                      <div className="text-white">
                        <p className="text-sm leading-relaxed">
                          {collection.description}
                        </p>
                        <p className="mt-2 font-medium">
                          {collection.items}{' '}
                          {collection.items === 1 ? 'Item' : 'Items'} in
                          Collection
                        </p>
                        <div className="flex items-center gap-2 mt-4 animate-bounce text-secondary">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            Click to view details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col justify-center sm:flex-row sm:justify-between  items-center space-y-2 px-1">
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-base font-serif font-medium text-gray-800 tracking-wide  letter-spacing-wide">
                        {collection.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {collection.items}{' '}
                        {collection.items === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                    <p className="text-lg sm:text-base text-gray-600 font-light">
                      AED {collection.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optional: Load More Button (common in luxury sites) */}
          <div className="text-center mt-6 lg:mt-12">
            <Button className="rounded-none hover:bg-primary/50">
              View All Collections
            </Button>
          </div>
        </div>
      </section>
      <footer className="bg-card text-foreground border-t border-border">
        {/* Newsletter Section */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
                Subscribe to our newsletter
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Receive our newsletter and discover our world, collections, and
                latest news from us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Your email address"
                  />
                </div>
                <Button>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                I acknowledge that my email address will be processed by
                Alnubras in accordance with the provisions of the{' '}
                <a href="#" className="underline hover:text-foreground">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Get in touch */}
            <div>
              <h3 className="text-lg font-serif font-medium mb-6">
                Get in touch
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contacts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Store Locator
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-serif font-medium mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    About Alnubras
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Career
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Craftsmanship
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Sustainability
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-serif font-medium mb-6">Services</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    All services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Size Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Return & exchange
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Delivery & shipping
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Care Instructions
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Cookies */}
            <div>
              <h3 className="text-lg font-serif font-medium mb-6">
                Legal & Cookies
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Legal Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Privacy Notice
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Cookie Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Accessibility
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Brand Section */}
          <div className="mt-16 pt-12 border-t border-border">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl lg:text-5xl font-serif font-bold tracking-widest mb-4">
                  Alnubras
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Where heritage flows into modern craftsmanship. Crafting
                  timeless elegance, one stitch at a time.
                </p>
              </div>

              {/* Social Media */}
              <div className="flex flex-col items-center lg:items-end gap-4">
                <span className="text-sm text-muted-foreground">Follow Us</span>
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <p className="text-sm text-muted-foreground">
                  © 2025 Alnubras. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Country/Region:
                  </span>
                  <select className="text-sm bg-transparent border-none focus:outline-none text-foreground">
                    <option>United Arab Emirates (English)</option>
                    <option>Saudi Arabia (Arabic)</option>
                    <option>Qatar (English)</option>
                  </select>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  We accept:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium">
                    VISA
                  </div>
                  <div className="w-8 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium">
                    AMEX
                  </div>
                  <div className="w-8 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium">
                    CASH
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .letter-spacing-wide {
          letter-spacing: 0.025em;
        }

        .group:hover .scale-102 {
          transform: scale(1.02);
        }

        /* Custom responsive adjustments */
        @media (max-width: 640px) {
          .grid {
            gap: 1.5rem;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .grid {
            gap: 2rem;
          }
        }

        @media (min-width: 1025px) {
          .grid {
            gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
