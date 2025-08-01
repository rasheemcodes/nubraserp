    import React from 'react'
import CategorySelect from '../_components/categorySelect'
import Actions from '../_components/actions'

export default function ProductLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="p-6 mt-12 max-w-7xl mx-auto">
        <CategorySelect />
        <Actions />
        {children}
    </div>
  )
}
