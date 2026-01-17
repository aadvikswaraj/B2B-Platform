"use client";

import { useState, useMemo } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  StarIcon,
  CheckBadgeIcon,
  PhotoIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";

/**
 * ReviewsSection - Full-featured reviews component with rating breakdown
 */
const ReviewsSection = ({
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  className = "",
}) => {
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.floor(r.rating);
      if (dist[rating] !== undefined) dist[rating]++;
    });
    return dist;
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating) {
      result = result.filter((r) => Math.floor(r.rating) === filterRating);
    }

    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "helpful":
        result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
    }

    return result;
  }, [reviews, filterRating, sortBy]);

  // Render stars
  const renderStars = (rating, size = "sm") => {
    const sizeClass =
      size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= Math.floor(rating) ? (
            <StarIconSolid
              key={star}
              className={`${sizeClass} text-amber-400`}
            />
          ) : star - 0.5 <= rating ? (
            <StarIconSolid
              key={star}
              className={`${sizeClass} text-amber-400 opacity-50`}
            />
          ) : (
            <StarIcon key={star} className={`${sizeClass} text-gray-300`} />
          )
        )}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Overview */}
      <div className="grid md:grid-cols-3 gap-6 p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="mt-2">{renderStars(averageRating, "md")}</div>
          <p className="mt-1 text-sm text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isActive = filterRating === stars;

            return (
              <button
                key={stars}
                onClick={() => setFilterRating(isActive ? null : stars)}
                className={`
                  w-full flex items-center gap-3 py-1 px-2 rounded-lg transition-colors
                  ${isActive ? "bg-indigo-100" : "hover:bg-indigo-50"}
                `}
              >
                <span className="text-sm font-medium text-gray-700 w-8">
                  {stars}★
                </span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {count} ({Math.round(percentage)}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
            >
              {filterRating}★ only
              <span className="ml-1">&times;</span>
            </button>
          )}
          <span className="text-sm text-gray-600">
            Showing {filteredReviews.length} of {totalReviews} reviews
          </span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">
              No reviews yet
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to review this product
            </p>
          </div>
        ) : (
          filteredReviews.map((review, idx) => (
            <div
              key={review.id || idx}
              className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {review.author?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.author || "Anonymous"}
                      </span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                          <CheckBadgeIcon className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(review.date)}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Review Content */}
              <div className="mt-3">
                {review.title && (
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {review.title}
                  </h4>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Review Images */}
              {review.images?.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {review.images.map((img, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="h-16 w-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`Review image ${imgIdx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-4">
                <button className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  <HandThumbUpIcon className="h-4 w-4" />
                  Helpful{" "}
                  {review.helpfulCount ? `(${review.helpfulCount})` : ""}
                </button>
                <button className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
