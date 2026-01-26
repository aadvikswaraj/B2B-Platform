"use client";

import CartItem from "./CartItem";

const CartCategoryGroup = ({
  category,
  items,
  onQuantityChange,
  onRemoveItem,
  onItemSelect,
}) => {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-4 mb-4 px-2">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          {category}
        </h4>
        <div className="h-px flex-grow bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemoveItem}
            onSelect={onItemSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default CartCategoryGroup;
