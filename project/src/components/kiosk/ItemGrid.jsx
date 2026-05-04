import ItemCard from './ItemCard';
import EmptyState from '../shared/EmptyState';
import Skeleton from '../shared/Skeleton';
import { PackageSearch } from 'lucide-react';

export default function ItemGrid({ items, onAdd, loading, searchQuery }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-w-7xl mx-auto">
        <Skeleton className="h-56" count={8} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={searchQuery ? `No results for "${searchQuery}"` : 'No items available'}
        description={searchQuery ? 'Try a different search term' : 'Items will appear here when added'}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-w-7xl mx-auto">
      {items.map(item => (
        <ItemCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}
