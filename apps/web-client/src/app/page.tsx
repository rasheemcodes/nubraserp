'use client';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Eye,
  HelpCircle,
  MapPin,
  Mouse,
  Phone,
  Calendar,
  Scissors,
  Star,
  Clock,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.35]);
  const y = useTransform(scrollY, [0, 100], [0, -15]);
  const [email, setEmail] = useState('');

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
      name: 'Rāyhān Set',
      image: '/collections/rayhan.png',
      description:
        'An 8-piece Emirati ensemble of timeless tradition — elevated with soft textures, flowing form, and a single flower of elegance.',
      price: 1050,
      items: 8,
    },
    {
      name: 'AlMukammal Set',
      image: '/collections/almukkammal.png',
      description:
        'A complete 13-piece men’s wardrobe rooted in tradition — tailored for presence, grace, and Gulf heritage.',
      price: 1365,
      items: 13,
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Background Video/Image */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="/videos/hero-video.mp4"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-50 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          <motion.h1
            style={{ opacity, y }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-widest leading-tight text-white font-serif"
          >
            Alnubras
          </motion.h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-2xl px-4">
            Where heritage flows into modern craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-4">
            <Link href="/products">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Button size="lg" variant="secondary">
              Explore Collection
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 sm:bottom-8 flex flex-col items-center gap-2 text-white/80 z-50"
        >
          <span className="text-xs sm:text-sm">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 3, 0], opacity: [1, 0.5, 1] }}
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

      {/* About Section */}
      <section className="relative z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight mb-6 sm:mb-8">
                Crafting Timeless Elegance, <br />
                <span className="italic text-gray-600">
                  One Stitch at a Time
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                At Alnubras, we believe that every stitch tells a story. Our
                garments are crafted with precision and passion, blending
                traditional techniques with modern design. From the finest
                fabrics to the most intricate details, we create pieces that are
                not just clothing, but works of art.
              </p>
            </div>
            <div className="flex-1 relative max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <div className="absolute -inset-2 bg-gray-50 rounded-xl -rotate-1"></div>
              <Image
                fill
                src="/chair-sitting.png"
                alt="Craftsmanship"
                className="relative w-full h-80 sm:h-96 lg:h-[400px] rounded-lg object-cover transition-transform hover:scale-[1.01] duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight mb-4 tracking-wide">
              Explore our collection
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto px-4">
              From the finest fabrics to the most intricate details, we create
              pieces that are not just clothing, but works of art.
            </p>
          </div>

          {/* Collection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="flex flex-col transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100 rounded-lg">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                      <div className="text-white text-center">
                        <p className="text-sm leading-relaxed mb-3">
                          {collection.description}
                        </p>
                        <p className="font-medium mb-4">
                          {collection.items}{' '}
                          {collection.items === 1 ? 'Item' : 'Items'} in
                          Collection
                        </p>
                        <div className="flex items-center justify-center gap-2 animate-bounce text-yellow-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            Click to view details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-2 sm:space-y-0 px-1">
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-serif font-medium text-gray-800 tracking-wide">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {collection.items}{' '}
                        {collection.items === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                    <p className="text-lg font-light text-gray-600">
                      AED {collection.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12 lg:mt-16">
            <Button
              size="lg"
              className="rounded-none hover:bg-primary/90 min-w-[200px]"
            >
              View All Collections
            </Button>
          </div>
        </div>
      </section>

      {/* Appointment CTA Section */}
      <section className="relative overflow-hidden bg-background text-foreground border-t">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent transform -skew-y-12"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Scissors className="w-8 h-8 text-primary" />
                  <span className="text-primary font-medium text-lg">
                    Bespoke Tailoring
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">
                  Perfect Fit, <br />
                  <span className="text-primary">Perfect Style</span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  Experience the luxury of custom tailoring. Our master
                  craftsmen will create garments that fit you perfectly,
                  reflecting your personal style and our rich heritage.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">2-3 weeks delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Premium fabrics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Scissors className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Master tailors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Free consultation</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Appointment Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/20"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-bold mb-2">
                  Book Your Appointment
                </h3>
                <p className="text-muted-foreground text-sm">
                  Schedule a consultation with our master tailors
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input placeholder="First Name" />
                  </div>
                  <div>
                    <Input placeholder="Last Name" />
                  </div>
                </div>

                <Input type="email" placeholder="Email Address" />

                <Input type="tel" placeholder="Phone Number" />

                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  We&apos;ll contact you within 24 hours to confirm your
                  appointment
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-900 border-t border-gray-200">
        {/* Newsletter Section */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-serif font-medium mb-4">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed px-4">
                Receive our newsletter and discover our world, collections, and
                latest news from us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button size="lg" className="h-12">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 px-4">
                I acknowledge that my email address will be processed by
                Alnubras in accordance with the provisions of the{' '}
                <a href="#" className="underline hover:text-gray-900">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Get in touch */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">
                Get in touch
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contacts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Store Locator
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Company</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    About Alnubras
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Career
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Craftsmanship
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Sustainability
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Services</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    All services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Size Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Return & exchange
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Delivery & shipping
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Care Instructions
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Cookies */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">
                Legal & Cookies
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Legal Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Privacy Notice
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Cookie Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Accessibility
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Brand Section */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-widest mb-4">
                  Alnubras
                </h2>
                <p className="text-gray-600 max-w-md">
                  Where heritage flows into modern craftsmanship. Crafting
                  timeless elegance, one stitch at a time.
                </p>
              </div>

              {/* Social Media */}
              <div className="flex flex-col items-center lg:items-end gap-4">
                <span className="text-sm text-gray-500">Follow Us</span>
                <div className="flex space-x-6">
                  {[
                    { name: 'Instagram', icon: <Instagram className="w-6 h-6" /> },
                    { name: 'Facebook', icon: <Facebook className="w-6 h-6" /> },
                    { name: 'Twitter', icon: <Twitter className="w-6 h-6" /> },
                    { name: 'LinkedIn', icon: <Linkedin className="w-6 h-6" /> }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                <p className="text-sm text-gray-500">
                  © 2025 Alnubras. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Country/Region:</span>
                  <select className="text-sm bg-transparent border-none focus:outline-none text-gray-700">
                    <option>United Arab Emirates (English)</option>
                    <option>Saudi Arabia (Arabic)</option>
                    <option>Qatar (English)</option>
                  </select>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm text-gray-500">We accept:</span>
                <div className="flex items-center gap-2">
                  {['VISA', 'MC', 'AMEX', 'CASH'].map((payment) => (
                    <div
                      key={payment}
                      className="w-10 h-6 bg-gray-700 text-white rounded flex items-center justify-center text-xs font-medium"
                    >
                      {payment}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
