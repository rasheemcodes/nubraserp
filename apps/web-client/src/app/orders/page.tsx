'use client';
import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for orders
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-07-20',
    status: 'delivered',
    total: 1250.0,
    items: 2,
    estimatedDelivery: '2024-07-22',
    actualDelivery: '2024-07-21',
    trackingNumber: 'TRK123456789',
    products: [
      {
        name: 'Premium Thobe - White',
        price: 850.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        name: 'Luxury Bisht - Black & Gold',
        price: 400.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-07-18',
    status: 'shipped',
    total: 1100.0,
    items: 3,
    estimatedDelivery: '2024-07-25',
    trackingNumber: 'TRK987654321',
    products: [
      {
        name: 'Designer Kandora - Beige',
        price: 600.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        name: 'Premium Ghutrah - White',
        price: 300.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        name: 'Agal - Black',
        price: 200.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
    ],
  },
  {
    id: 'ORD-2024-003',
    date: '2024-07-15',
    status: 'processing',
    total: 2100.0,
    items: 3,
    estimatedDelivery: '2024-07-28',
    products: [
      {
        name: 'Limited Edition Thobe - Navy',
        price: 950.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        name: 'Premium Bisht - Gold Trim',
        price: 850.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
      {
        name: 'Designer Ghutrah Set',
        price: 300.0,
        quantity: 1,
        image: '/api/placeholder/60/60',
      },
    ],
  },
];

const statusConfig = {
  processing: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Processing',
  },
  shipped: {
    icon: Truck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Shipped',
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Delivered',
  },
};

function MyOrdersPageDesktop() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const router = useRouter();

  const filteredOrders = mockOrders.filter((order) => {
    const matchesFilter =
      selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">My Orders</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Track and manage your recent purchases
            </p>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
            <Star className="text-amber-500 w-5 h-5" fill="currentColor" />
            <span className="text-sm font-medium text-amber-700">Premium Member</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-12">
          <div className="relative flex-1 max-w-lg">
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-2xl p-1 shadow-sm">
              {['all', 'processing', 'shipped', 'delivered'].map((filter) => (
                <button
                  key={filter}
                  className={`${
                    selectedFilter === filter
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  } px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 bg-white">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
              <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 mb-10 text-lg">
                Try adjusting your search or filter criteria
              </p>
              <button className="px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all duration-200 font-semibold text-lg">
                Continue Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const {
                icon: StatusIcon,
                color,
                bg,
                border,
                label,
              } = statusConfig[order.status as keyof typeof statusConfig];

              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {order.id}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${color} ${bg} ${border}`}
                          >
                            <StatusIcon size={16} />
                            {label}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="font-medium">
                              Ordered on{' '}
                              {new Date(order.date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="font-medium">{order.items} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 tracking-tight">
                          AED {order.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Total Amount</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => router.push(`/tracking/${order.id}`)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold">
                        <Eye size={16} />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700 bg-white">
                        <Download size={16} />
                        Download Invoice
                      </button>
                    </div>

                    {/* Product Preview */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">
                          Items in this order
                        </h4>
                        {order.products.length > 2 && (
                          <button
                            onClick={() => {
                              const newValue = isExpanded ? null : order.id;
                              setExpandedOrder(newValue as null);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                          >
                            {isExpanded ? 'Show less' : `Show all ${order.products.length} items`}
                            <ArrowRight
                              size={16}
                              className={`transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {(isExpanded
                          ? order.products
                          : order.products.slice(0, 2)
                        ).map((product, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-5 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
                          >
                            <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                              <Package size={28} className="text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-bold text-gray-900 mb-1">
                                {product.name}
                              </h5>
                              <p className="text-sm text-gray-600 font-medium">
                                Quantity: {product.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                AED {product.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}

                        {!isExpanded && order.products.length > 2 && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                              <Package size={14} />
                              <span>+{order.products.length - 2} more items</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.status !== 'processing' && (
                      <div
                        className={`mt-8 p-6 rounded-2xl border-2 ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 border-emerald-200'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100'
                                : order.status === 'shipped'
                                ? 'bg-blue-100'
                                : 'bg-amber-100'
                            }`}
                          >
                            <MapPin
                              size={20}
                              className={
                                order.status === 'delivered'
                                  ? 'text-emerald-600'
                                  : order.status === 'shipped'
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }
                            />
                          </div>
                          <div>
                            <div
                              className={`text-lg font-bold ${
                                order.status === 'delivered'
                                  ? 'text-emerald-600'
                                  : order.status === 'shipped'
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {order.status === 'delivered'
                                ? 'Successfully Delivered'
                                : 'Expected Delivery'}
                            </div>
                            <div className="text-gray-700 font-medium">
                              {order.status === 'delivered'
                                ? new Date(
                                    order.actualDelivery ?? new Date()
                                  ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : new Date(
                                    order.estimatedDelivery
                                  ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MyOrdersPageMobile() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const router = useRouter();
  
  const filteredOrders = mockOrders.filter((order) => {
    const matchesFilter =
      selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Star className="text-amber-500 w-4 h-4" fill="currentColor" />
              <span className="text-xs font-semibold text-amber-700">Premium</span>
            </div>
          </div>
          <p className="text-gray-600 text-base">Track and manage your purchases</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search orders or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-1 p-1 bg-white rounded-2xl border-2 border-gray-200 min-w-max shadow-sm">
            {['all', 'processing', 'shipped', 'delivered'].map((filter) => (
              <button
                key={filter}
                className={`${
                  selectedFilter === filter
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                } px-4 py-2 rounded-xl text-sm font-semibold capitalize min-w-[70px] transition-all duration-200`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-gray-100">
              <Package size={56} className="mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 text-sm mb-8">
                Try adjusting your search or filter criteria
              </p>
              <button className="px-8 py-3 bg-primary text-white rounded-2xl text-base font-semibold">
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const {
                icon: StatusIcon,
                color,
                bg,
                border,
                label,
              } = statusConfig[order.status as keyof typeof statusConfig];

              return (
                <div
                  key={order.id}
                  className='bg-white rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200'
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900">
                            {order.id}
                          </h3>
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${color} ${bg} ${border}`}>
                            <StatusIcon size={12} />
                            {label}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={12} />
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Package size={12} />
                            {order.items} items
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          AED {order.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                      <button onClick={() => router.push(`/tracking/${order.id}`)} className="flex-1 h-9 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                        <Eye size={14} />
                        View Details
                      </button>
                      <button className="flex-1 h-9 text-sm font-semibold border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 bg-white">
                        <Download size={14} />
                        Invoice
                      </button>
                    </div>

                    {/* Products Preview */}
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          const newValue = isExpanded ? null : order.id;
                          setExpandedOrder(newValue as null);
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            Order Items
                          </span>
                          {order.products.length > 1 && (
                            <span className="text-blue-600 flex items-center gap-1 text-sm font-semibold">
                              {isExpanded ? 'Show less' : `Show all ${order.products.length}`}
                              <ArrowRight
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="space-y-3">
                        {(isExpanded
                          ? order.products
                          : order.products.slice(0, 1)
                        ).map((product, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl"
                          >
                            <div className="w-14 h-14 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center">
                              <Package size={22} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                                {product.name}
                              </h5>
                              <p className="text-xs text-gray-600 font-medium">
                                Qty: {product.quantity}
                              </p>
                            </div>
                            <div className="text-base font-bold text-gray-900">
                              AED {product.price.toFixed(2)}
                            </div>
                          </div>
                        ))}

                        {!isExpanded && order.products.length > 1 && (
                          <div className="text-center py-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              <Package size={12} />
                              <span>+{order.products.length - 1} more items</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.status !== 'processing' && (
                      <div
                        className={`mt-6 p-4 rounded-2xl border-2 ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin
                            size={18}
                            className={
                              order.status === 'delivered'
                                ? 'text-emerald-600'
                                : 'text-blue-600'
                            }
                          />
                          <div>
                            <div
                              className={`text-sm font-bold ${
                                order.status === 'delivered'
                                  ? 'text-emerald-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {order.status === 'delivered'
                                ? 'Delivered'
                                : 'Expected Delivery'}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">
                              {order.status === 'delivered'
                                ? new Date(
                                    order.actualDelivery ?? new Date()
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : new Date(
                                    order.estimatedDelivery
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <>
      <div className="hidden md:block">
        <MyOrdersPageDesktop />
      </div>
      <div className="block md:hidden">
        <MyOrdersPageMobile />
      </div>
    </>
  );
}