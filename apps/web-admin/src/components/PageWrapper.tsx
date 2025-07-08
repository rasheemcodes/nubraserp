import React from 'react';

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto p-1 md:p-6 space-y-6">{children}</div>
  );
}
