"use client";
import { useState, useEffect } from "react";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import AddressCard from "@/components/common/address/AddressCard";
import AddressModal from "@/components/common/address/AddressModal";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useRouter, useSearchParams } from "next/navigation";
import { getAddresses, addAddress } from "@/utils/api/user/addresses";
import { orderAPI } from "@/utils/api/order";
import { Plus, Loader2 } from "lucide-react";

export default function ShippingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [order, setOrder] = useState(null);

  // Load addresses and order on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingAddresses(true);

        // Load addresses
        const addressList = await getAddresses();
        const normalized = (addressList || []).map((a) => ({
          ...a,
          id: a._id || a.id,
          name: a.name,
          phone: a.phone,
          line1: a.addressLine1,
          line2: a.addressLine2,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          contactName: a.name,
          contactPhone: a.phone,
        }));
        setAddresses(normalized);

        // Auto-select default address
        const defaultAddr = normalized.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }

        // Load order if orderId exists
        if (orderId) {
          const response = await orderAPI.getById(orderId);
          setOrder(response?.data?.order || response?.order || response);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadData();
  }, [orderId]);

  const handleNext = async () => {
    if (!selectedAddressId) return;

    try {
      setSubmitting(true);
      if (orderId) {
        await orderAPI.addShippingAddress(orderId, selectedAddressId);
      }
      router.push(`/checkout/review?orderId=${orderId}`);
    } catch (error) {
      console.error("Failed to update shipping address", error);
      alert("Failed to update shipping address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAddress = async (data) => {
    try {
      setSubmitting(true);

      // Call real API
      const saved = await addAddress({
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        name: data.name,
        phone: data.phone,
      });

      const newAddr = {
        ...saved,
        id: saved._id || saved.id,
        line1: saved.addressLine1,
        line2: saved.addressLine2,
        contactName: saved.name,
        contactPhone: saved.phone,
      };

      setAddresses([...addresses, newAddr]);
      setSelectedAddressId(newAddr.id);
      setModalOpen(false);
    } catch (e) {
      console.error("Failed to save address:", e);
      alert("Failed to save address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate pricing from order or fallback
  const pricing = order
    ? {
        itemsSubtotal: order.itemsTotal || 0,
        shipping: order.shippingCost || 0,
        taxes: order.tax || 0,
        total: order.totalAmount || 0,
      }
    : {
        itemsSubtotal: 0,
        shipping: 0,
        taxes: 0,
        total: 0,
      };

  if (loadingAddresses) {
    return (
      <CheckoutLayout
        stepId="shipping"
        summary={
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout
      stepId="shipping"
      summary={
        <OrderSummary
          pricing={pricing}
          submitLabel={submitting ? "Processing..." : "Continue to Review"}
          disabled={!selectedAddressId || submitting || loadingAddresses}
          onSubmit={handleNext}
        />
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Shipping Address
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select an address for delivery or add a new one.
          </p>
        </div>

        {addresses.length === 0 && !loadingAddresses ? (
          <div className="text-center py-12 text-slate-500">
            <p className="mb-4">No saved addresses yet.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                selected={a.id === selectedAddressId}
                onSelect={(id) => setSelectedAddressId(id)}
              />
            ))}

            {/* Add New Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="group relative flex flex-col items-center justify-center min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-110 group-hover:ring-blue-200">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                Add New Address
              </span>
            </button>
          </div>
        )}

        <AddressModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAddress}
          loading={submitting}
        />
      </div>
    </CheckoutLayout>
  );
}
