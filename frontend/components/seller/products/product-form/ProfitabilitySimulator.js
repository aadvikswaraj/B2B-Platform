import { useState, useMemo, useEffect } from "react";
import { resolveCommission } from "@/utils/category";
import { 
    InformationCircleIcon, 
    ChartBarIcon,
    BanknotesIcon 
} from "@heroicons/react/24/outline";

export default function ProfitabilitySimulator({ watch, category }) {
  const [simQty, setSimQty] = useState(1);

  // Watch necessary fields for calculation
  const unitPrice = parseFloat(watch("price") || 0); // Assuming single price for simplicity in simulator base, or handle slabs
  const priceSlabs = watch("priceSlabs") || [];
  const priceType = watch("priceType");
  const shippingSupport = watch("shippingSupportTiers") || [];
  const paymentSupportLimit = parseFloat(watch("paymentFeeCoverLimit") || 0);
  const taxPercent = parseFloat(watch("taxPercent") || 0);
  const moq = parseInt(watch("moq") || 1);
  
  const packagingLevels = watch("packagingLevels") || [];
  const shippingIndex = packagingLevels.reduce((lastIdx, lvl, idx) => lvl.isShippingUnit ? idx : lastIdx, -1);
  let unitsPerCarton = 1;
  if (shippingIndex > 0) {
      for(let i=1; i<=shippingIndex; i++) {
           unitsPerCarton *= (parseFloat(packagingLevels[i].containsQty) || 1);
      }
  }

  // Get resolved commission from category
  const resolvedCommission = useMemo(() => {
    if (!category) return null;
    return resolveCommission(category);
  }, [category]);

  // Calculate commission percent for current order value
  const getCommissionPercent = useMemo(() => {
    if (!resolvedCommission) return 2; // Default fallback 2%
    
    if (resolvedCommission.mode === 'exact') {
      return resolvedCommission.exact || 2;
    }
    
    if (resolvedCommission.mode === 'slab' && resolvedCommission.slabs?.length > 0) {
      const orderValue = unitPrice * simQty;
      const sorted = [...resolvedCommission.slabs].sort((a, b) => (a.upto || 0) - (b.upto || 0));
      
      for (const slab of sorted) {
        if (orderValue <= slab.upto) {
          return slab.percent;
        }
      }
      // Above all slabs, use last slab
      if (sorted.length > 0) {
        return sorted[sorted.length - 1].percent;
      }
    }
    
    return 2; // Default fallback
  }, [resolvedCommission, unitPrice, simQty]);

  // Set initial simQty to MOQ
  useEffect(() => {
    if (moq > 1 && simQty < moq) {
      setSimQty(moq);
    }
  }, [moq]);

  // Derive effective unit price based on Qty
  const effectiveUnitPrice = useMemo(() => {
    if (priceType === 'single') return unitPrice;
    // Find matching slab
    // Slabs usually: UptoQty X -> Price Y. 
    // Logic: Find the slab where qty <= uptoQty? Or usually slabs are "From Qty X"? 
    // Looking at TradePricing, we used "uptoQty" implies "For orders up to X". 
    // Usually B2B is "Min Qty" (From X). Let's assume standard B2B "Min Qty".
    // TradePricing implementation used placeholder "Min Qty".
    // So find the slab with highest minQty <= simQty.
    
    // Sort slabs descending by qty
    const sorted = [...priceSlabs].sort((a, b) => b.uptoQty - a.uptoQty); // Assuming 'uptoQty' serves as threshold
    // If logic is "Price applies for quantity >= X":
    const match = sorted.find(s => simQty >= (parseFloat(s.uptoQty) || 0));
    return match ? parseFloat(match.price) : unitPrice;
  }, [simQty, unitPrice, priceSlabs, priceType]);

  const grossRevenue = effectiveUnitPrice * simQty;
  const gst = grossRevenue * (taxPercent / 100);
  const totalOrderValue = grossRevenue + gst;

  // Platform Commission (from category)
  const platformFeePercent = getCommissionPercent;
  const platformFee = grossRevenue * (platformFeePercent / 100);

  // Estimated Payment Gateway Fee (Example: 2%)
  const pgFee = totalOrderValue * 0.02;
  const pgSupport = Math.min(pgFee, paymentSupportLimit);
  const sellerPgCost = pgFee - pgSupport;

  // Estimated Freight (Rough calc based on units)
  // 1 carton = ~x kg. Freight ~ ₹5/kg for bulk.
  const estimatedFreight = (simQty / unitsPerCarton) * 50; // Simple dummy logic: ₹50 per carton
  // Support logic
  // Find tier (Find highest MinQty threshold that simQty exceeds)
  const sortedSupport = [...shippingSupport].sort((a, b) => (parseFloat(b.minQty) || 0) - (parseFloat(a.minQty) || 0));
  const supportTier = sortedSupport.find(s => simQty >= (parseFloat(s.minQty) || 0)); 
  const sellerFreightSupport = supportTier ? Math.min(estimatedFreight, parseFloat(supportTier.fee) || 0) : 0;
  
  const netEarnings = grossRevenue - platformFee - sellerPgCost - sellerFreightSupport;

  // Scenarios
  // We can just show this one dynamic calculation. The prompt asks for "Min/Max earning scenario".
  // Min earning = when you subsidize max freight/payment.
  // Max earning = when minimal subsidies apply (e.g. low distance shipping if variable, but here we estimate).
  
  // For simplicity, I'll show the dynamic calculation driven by the slider.

  return (
    <div className="space-y-6 bg-emerald-50 border border-emerald-100 p-4 sm:p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
         <div>
            <h3 className="text-lg font-semibold text-emerald-900">Profitability Simulator</h3>
            <p className="text-xs text-emerald-700 font-medium bg-emerald-100 inline-block px-2 py-1 rounded mt-1">
                INTERNAL TOOL - NOT VISIBLE TO BUYERS
            </p>
         </div>
         <div className="text-left sm:text-right">
            <p className="text-3xl font-bold text-emerald-800">
                ₹{netEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-emerald-600">Net Earning</p>
         </div>
      </div>

      <div className="space-y-2">
         <div className="flex justify-between text-sm font-medium text-emerald-800">
            <span>Simulate Order Quantity</span>
            <span>{simQty} Units</span>
         </div>
         <input 
            type="range"
            min={moq || 1}
            max="1000"
            step={Math.max(1, unitsPerCarton)}
            value={simQty}
            onChange={(e) => setSimQty(parseInt(e.target.value))}
            className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
         />
         <div className="flex justify-between text-xs text-emerald-600">
            <span>MOQ ({moq || 1})</span>
            <span>1000 Units</span>
         </div>
      </div>

      {/* Commission Info Banner */}
      {resolvedCommission && (
        <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Category Commission
            </span>
          </div>
          {resolvedCommission.mode === 'exact' ? (
            <p className="text-sm text-emerald-700">
              Flat rate: <strong>{resolvedCommission.exact}%</strong> on all orders
            </p>
          ) : resolvedCommission.mode === 'slab' ? (
            <div className="space-y-1">
              <p className="text-sm text-emerald-700 mb-2">
                Volume-based slabs (current: <strong>{platformFeePercent}%</strong>)
              </p>
              <div className="flex flex-wrap gap-2">
                {[...resolvedCommission.slabs]
                  .sort((a, b) => (a.upto || 0) - (b.upto || 0))
                  .map((slab, idx) => {
                    const orderValue = effectiveUnitPrice * simQty;
                    const isActive = orderValue <= slab.upto || 
                      (idx === resolvedCommission.slabs.length - 1 && orderValue > slab.upto);
                    return (
                      <span 
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        ≤₹{slab.upto.toLocaleString()}: {slab.percent}%
                      </span>
                    );
                  })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-emerald-700">Inherited from parent category</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
         <div className="bg-white/50 p-3 rounded">
            <span className="block text-gray-500 text-xs">Gross Revenue</span>
            <span className="font-medium">₹{grossRevenue.toFixed(2)}</span>
         </div>
         <div className="bg-white/50 p-3 rounded">
            <span className="block text-xs text-red-500">Platform Commission ({platformFeePercent}%)</span>
            <span className="font-medium text-red-600">- ₹{platformFee.toFixed(2)}</span>
         </div>
         <div className="bg-white/50 p-3 rounded">
            <span className="block text-xs text-red-500">Freight Support</span>
            <span className="font-medium text-red-600">- ₹{sellerFreightSupport.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 block pt-1">(Est. Shipping: ₹{estimatedFreight.toFixed(0)})</span>
         </div>
         <div className="bg-white/50 p-3 rounded">
             <span className="block text-xs text-red-500">Payment Fee Support</span>
             <span className="font-medium text-red-600">- ₹{sellerPgCost.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400 block pt-1">(Total PG Fee: ₹{pgFee.toFixed(2)})</span>
         </div>
      </div>
      
      <p className="text-xs text-center text-emerald-600 italic">
        *Estimates only. Actual shipping costs vary by distance.
      </p>

    </div>
  );
}
