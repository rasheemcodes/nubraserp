import React from 'react';
import Actions from './actions';
import CategorySelect from './categorySelect';

export default function ProductCatalog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <CategorySelect />
      <Actions />
      {children}
    </div>
  );
}
