import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="product-card p-3">
      <div className="bg-light rounded mb-3" style={{ height: '200px', animation: 'pulse 1.5s infinite' }}></div>
      <div className="bg-light rounded mb-2" style={{ height: '14px', width: '40%' }}></div>
      <div className="bg-light rounded mb-2" style={{ height: '18px', width: '85%' }}></div>
      <div className="bg-light rounded mb-3" style={{ height: '16px', width: '60%' }}></div>
      <div className="bg-light rounded mt-auto" style={{ height: '36px', width: '100%' }}></div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
