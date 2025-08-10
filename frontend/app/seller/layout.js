import SellerSidebar from '@/components/seller/SellerSidebar'
import SellerTopbar from '@/components/seller/SellerTopbar'

export default function SellerLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SellerSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <SellerTopbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
