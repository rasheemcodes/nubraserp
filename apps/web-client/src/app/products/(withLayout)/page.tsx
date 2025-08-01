"use client"

import ProductCard from "../_components/productCard";
import { sampleProducts } from "../sample";

const LuxuryShopPage = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 md:gap-4  justify-center">
      {sampleProducts.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
};

export default LuxuryShopPage;