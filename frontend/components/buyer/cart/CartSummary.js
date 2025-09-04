'use client';

const CartSummary = ({ selectedItems }) => {
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      {/* Selected Items Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Selected Items:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping:</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      {/* Supplier Groups */}
      <div className="border-t pt-4 mb-6">
        <h3 className="text-sm font-medium mb-2">Items by Supplier</h3>
        {/* Group items by supplier */}
        {Object.entries(
          selectedItems.reduce((acc, item) => {
            const supplier = item.supplierName || 'Unknown Supplier';
            if (!acc[supplier]) {
              acc[supplier] = { count: 0, total: 0 };
            }
            acc[supplier].count += item.quantity;
            acc[supplier].total += item.price * item.quantity;
            return acc;
          }, {})
        ).map(([supplier, info]) => (
          <div key={supplier} className="flex justify-between text-sm py-1">
            <span className="text-gray-600">
              {supplier} ({info.count})
            </span>
            <span>${info.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Action Button (RFQ removed per request) */}
      <div>
        <button
          disabled={selectedItems.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout ({totalItems} items)
        </button>
      </div>

      {/* Secure Transaction Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          🔒 Secure Transaction
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
