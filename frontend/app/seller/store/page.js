'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function StorePage() {
  const [store, setStore] = useState({
    name: 'Industrial Solutions Co.',
    banner: '/product-image.jpg',
    logo: '/logo/logo-s-1.png',
    description: 'Leading manufacturer of industrial equipment and machinery.',
    shortDescription: 'Quality industrial equipment manufacturer',
    categories: ['Pumps', 'Motors', 'Pipes', 'Industrial Tools'],
    address: '123 Industrial Ave, Business Park',
    city: 'New York',
    country: 'United States',
    certifications: ['ISO 9001:2015', 'CE Certified'],
  })

  const [bannerPreview, setBannerPreview] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'banner') {
          setBannerPreview(e.target.result)
        } else {
          setLogoPreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Store Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your store appearance and information
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Preview Store
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <div className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Store Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about your store
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                name="store-name"
                id="store-name"
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="short-description" className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                type="text"
                name="short-description"
                id="short-description"
                value={store.shortDescription}
                onChange={(e) => setStore({ ...store, shortDescription: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={store.description}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Visuals */}
        <div className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Store Visuals</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your store banner and logo
            </p>
          </div>

          <div className="space-y-4">
            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Banner Image</label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                {bannerPreview || store.banner ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={bannerPreview || store.banner}
                      alt="Store banner"
                      fill
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBannerPreview(null)}
                      className="absolute top-2 right-2 rounded-full bg-white p-1.5 text-gray-900 shadow-sm hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'banner')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Logo</label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                {logoPreview || store.logo ? (
                  <div className="relative h-32 w-32">
                    <Image
                      src={logoPreview || store.logo}
                      alt="Store logo"
                      fill
                      className="rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoPreview(null)}
                      className="absolute top-2 right-2 rounded-full bg-white p-1.5 text-gray-900 shadow-sm hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'logo')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Business Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your business location and certifications
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={store.address}
                onChange={(e) => setStore({ ...store, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={store.city}
                onChange={(e) => setStore({ ...store, city: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                Certifications
              </label>
              <input
                type="text"
                name="certifications"
                id="certifications"
                value={store.certifications.join(', ')}
                placeholder="e.g., ISO 9001:2015, CE Certified"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6 rounded-lg bg-white p-6 shadow">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Store Categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select the categories of products you sell
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {store.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-full bg-indigo-100 py-1.5 pl-3 pr-2 text-sm font-medium text-indigo-700"
                >
                  {category}
                  <button
                    type="button"
                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900"
                  >
                    <span className="sr-only">Remove {category}</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            <button
              type="button"
              className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
