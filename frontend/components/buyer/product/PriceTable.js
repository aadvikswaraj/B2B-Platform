'use client';

const PriceTable = ({ prices = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-2 text-left">Quantity (MOQ)</th>
            <th className="border px-4 py-2 text-left">Price per Unit</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                {price.minQty}{price.maxQty ? ` - ${price.maxQty}` : '+'} Units
              </td>
              <td className="border px-4 py-2">
                ${price.price.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
