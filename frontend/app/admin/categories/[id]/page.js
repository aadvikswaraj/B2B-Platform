"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import CategoryAPI from '@/utils/api/admin/categories';
import CategoryPreview from '@/components/admin/categories/CategoryPreview';

export default function CategoryPreviewPage() {
	const { id } = useParams();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [category, setCategory] = useState(null);
	const [parentPath, setParentPath] = useState([]);

	const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const [c, p] = await Promise.all([
				CategoryAPI.get(id),
				CategoryAPI.path(id).catch(() => null)
			]);
			setCategory(c);
			setParentPath(p?.data?.path || []);
		} catch (e) { setError(e.message || 'Failed to load'); }
		setLoading(false);
	}, [id]);

	useEffect(() => { if (id) load(); }, [id, load]);

		if (loading) {
			return (
				<div className="space-y-6 animate-fadeIn mt-5">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="h-9 w-9 rounded-lg border border-gray-200 bg-white" />
							<div className="space-y-2">
								<div className="h-5 w-40 bg-gray-200 rounded" />
								<div className="h-3 w-56 bg-gray-100 rounded" />
							</div>
						</div>
						<div className="h-9 w-28 bg-gray-200 rounded" />
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="space-y-6 md:col-span-2">
							<div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
								<div className="h-4 w-28 bg-gray-200 rounded" />
								<div className="grid grid-cols-2 gap-4 text-sm">
									{Array.from({ length: 4 }).map((_, i) => (
										<div key={i} className="space-y-2">
											<div className="h-3 w-24 bg-gray-100 rounded" />
											<div className="h-4 w-36 bg-gray-200 rounded" />
										</div>
									))}
								</div>
							</div>
							<div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
								<div className="h-4 w-40 bg-gray-200 rounded" />
								<div className="flex flex-wrap gap-2">
									{Array.from({ length: 8 }).map((_, i) => (
										<div key={i} className="h-5 w-16 bg-gray-100 rounded" />
									))}
								</div>
							</div>
						</div>
						<div className="space-y-6">
							<div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
								<div className="h-4 w-24 bg-gray-200 rounded" />
								<div className="h-40 w-full bg-gray-100 rounded" />
							</div>
						</div>
					</div>
					<style jsx>{`
						.animate-fadeIn { animation: fadeIn 0.25s ease; }
						@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
					`}</style>
				</div>
			);
		}
	if (error) {
		return (
			<div className="max-w-5xl mx-auto py-10 space-y-4">
				<p className="text-sm text-red-600">{error}</p>
				<button onClick={() => router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
			</div>
		);
	}
	if (!category) {
		return (
			<div className="max-w-5xl mx-auto py-10 space-y-4">
				<p className="text-sm text-red-600">Category not found.</p>
				<button onClick={() => router.push('/admin/categories')} className="text-xs text-blue-600 hover:underline">Back to list</button>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<CategoryPreview
				category={category}
				parentPath={parentPath}
				onEdit={() => router.push(`/admin/categories/${category._id}/edit`)}
			/>
		</div>
	);
}
