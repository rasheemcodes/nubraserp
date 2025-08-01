// components/CartSheet.jsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, X, Plus, Minus, Eye } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function CartSheet() {
  const cartItems = [
    {
      id: 1,
      name: 'Premium Kandora',
      price: 899,
      image: '/samples/kandora.webp',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Classic Watch', 
      price: 1299,
      image: '/samples/kandora.webp',
      quantity: 2,
    },
    {
      id: 3,
      name: 'Embroidered Scarf',
      price: 299,
      image: '/samples/kandora.webp',
      quantity: 1,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 49 : 0;
  const total = subtotal + shippingFee;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 bg-gray-50 text-gray-600 h-5 w-5 flex items-center justify-center p-0">
            {cartItems.length}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg p-0 z-[10000] overflow-y-auto">
        <div className="h-full flex flex-col">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-xl flex items-center gap-2 font-serif">
              <ShoppingCart className="h-4 w-4" /> Shopping Cart ({cartItems.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="relative shrink-0">
                    <Image
                      width={60}
                      height={60}
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <div className="mt-1 flex flex-col md:flex-row  md:items-center text-sm text-muted-foreground">
                      <span>AED {item.price.toFixed(2)} × {item.quantity}</span>
                      <span className="mx-2 hidden md:block">•</span>
                      <span className="font-semibold text-sm text-foreground">
                        AED {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-muted"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {cartItems.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-medium">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">Add items to get started</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-muted/30">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingFee > 0 ? `AED ${shippingFee.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-medium">
                <span>Total</span>
                <span>AED {total.toFixed(2)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" disabled={cartItems.length === 0}>
              Checkout
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-3">
              Taxes calculated at checkout
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}