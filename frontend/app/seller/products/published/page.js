'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ArrowLeftIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function ProductPublished() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get('id');
    const productName = searchParams.get('name') || 'Product';

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8 text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircleIcon className="h-12 w-12 text-green-600" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Published Successfully!</h2>
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">“{productName}”</span> has been submitted.
                    </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-left border border-blue-100">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700">Current Status: <span className="font-semibold">Under Review</span></p>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600 ml-8">
                        Your product is currently being reviewed by our quality team. It will be live on the marketplace within 24 hours.
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* In a real app, these would link to the actual product pages */}
                        <Link href={`/seller/products/${productId || '#'}`} className="w-full">
                            <Button variant="outline" className="w-full justify-center" icon={EyeIcon}>View Product</Button>
                        </Link>
                        <Link href={`/seller/products/${productId || '#'}/edit`} className="w-full">
                            <Button variant="outline" className="w-full justify-center" icon={PencilSquareIcon}>Edit Product</Button>
                        </Link>
                    </div>
                    <Link href="/seller/products/new" className="w-full">
                        <Button variant="secondary" className="w-full justify-center">Add Another Product</Button>
                    </Link>
                    <Link href="/seller/products" className="w-full">
                        <Button variant="ghost" className="w-full justify-center text-gray-500 hover:text-gray-700" icon={ArrowLeftIcon}>Back to Products</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
