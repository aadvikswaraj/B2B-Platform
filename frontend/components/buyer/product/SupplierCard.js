'use client';
import Link from "next/link";

const SupplierCard = ({ supplier }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Link href={"/"} className="flex items-center gap-4 mb-6">
        <img
          src={supplier.logo}
          alt={supplier.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">{supplier.name}</h3>
          <p className="text-gray-500 text-sm">{supplier.location}</p>
        </div>
      </Link>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Response Time</p>
          <p className="font-medium">{supplier.responseTime}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Transaction Level</p>
          <p className="font-medium">{supplier.transactionLevel}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">On-time Delivery</p>
          <p className="font-medium">{supplier.onTimeDelivery}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Years in Business</p>
          <p className="font-medium">{supplier.yearsInBusiness} years</p>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Order
        </button>
        <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Chat Now
        </button>
      </div>
    </div>
  );
};

export default SupplierCard;
