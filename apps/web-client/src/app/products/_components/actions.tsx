import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import React from 'react';

const sortOptions = [
  {
    label: 'Rating: High to Low',
    value: 'rating-desc',
  },
  {
    label: 'Newest to Oldest',
    value: 'newest',
  },
  {
    label: 'Oldest to Newest',
    value: 'oldest',
  },
  {
    label: 'Price: Low to High',
    value: 'price-asc',
  },
  {
    label: 'Price: High to Low',
    value: 'price-desc',
  },
];

export default function Actions() {
  return (
    <div className="flex items-center justify-between py-6 border-b mb-6">
      <Button variant={'outline'}>
        <Filter />
        Filters
      </Button>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
