"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Star,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product, ProductReview } from "@/types";
import {
  getProductReviews,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/utils/supabase/services";
import { useUser } from "@/context/UserContext";
import RichViewer from "./RichViewer";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({
  product,
  onClose,
}: ProductDetailProps) {
  const user = useUser();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Get all media (images + videos)
  const allMedia = [
    ...(product.images || []),
    // Add video URLs if they exist in attributes
    ...(Array.isArray(product.attributes?.videos)
      ? product.attributes.videos
      : []),
  ];

  const currentMedia = allMedia[currentMediaIndex];
  const isVideo =
    (currentMedia && currentMedia.includes(".mp4")) ||
    currentMedia?.includes(".webm") ||
    currentMedia?.includes(".mov");

  // Load reviews and wishlist status
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData] = await Promise.all([
          getProductReviews(product.id),
          user
            ? isInWishlist(user.id, product.id).then(setIsWishlisted)
            : Promise.resolve(),
        ]);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading product details:", error);
      }
    };

    loadData();
  }, [product.id, user]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please log in to add items to cart");
      return;
    }

    try {
      const success = await addToCart(user.id, product.id, quantity);
      if (success) {
        alert(`Added ${quantity} ${product.name} to cart!`);
      } else {
        alert("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please log in to manage wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        const success = await removeFromWishlist(user.id, product.id);
        if (success) setIsWishlisted(false);
      } else {
        const success = await addToWishlist(user.id, product.id);
        if (success) setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  // Navigate media
  const navigateMedia = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentMediaIndex((prev) =>
        prev > 0 ? prev - 1 : allMedia.length - 1,
      );
    } else {
      setCurrentMediaIndex((prev) =>
        prev < allMedia.length - 1 ? prev + 1 : 0,
      );
    }
    setShowVideo(false);
  };

  // Calculate display price
  const displayPrice = product.discount_price || product.price;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - (product.discount_price || 0)) / product.price) * 100,
      )
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-radiance-charcoalTextColor">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Media Gallery */}
            <div className="space-y-4">
              {/* Main Media Display */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {currentMedia ? (
                  isVideo ? (
                    showVideo ? (
                      <video
                        src={currentMedia}
                        controls
                        className="w-full h-full object-cover"
                        onLoadedData={() => setShowVideo(true)}
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={`${product.name} thumbnail`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => setShowVideo(true)}
                            className="bg-black/50 text-white p-4 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <Play size={32} />
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <Image
                      src={currentMedia}
                      alt={`${product.name} - Image ${currentMediaIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart size={64} />
                  </div>
                )}

                {/* Navigation Arrows */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateMedia("prev")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => navigateMedia("next")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Media Indicators */}
                {allMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allMedia.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentMediaIndex(index);
                          setShowVideo(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentMediaIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allMedia.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allMedia.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentMediaIndex(index);
                        setShowVideo(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentMediaIndex
                          ? "border-radiance-goldColor"
                          : "border-gray-200"
                      }`}
                    >
                      {media.includes(".mp4") ||
                      media.includes(".webm") ||
                      media.includes(".mov") ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={`Video ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={media}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category and SKU */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.category}
                </p>
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-radiance-goldColor">
                  ₦{displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="text-sm">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-radiance-charcoalTextColor">
                    Description
                  </h3>
                  <RichViewer content={product.description} />
                </div>
              )}

              {/* Attributes */}
              {product.attributes &&
                Object.keys(product.attributes).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-radiance-charcoalTextColor">
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">
                              {key.replace("_", " ")}:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Add to Cart Section */}
              {product.stock_quantity > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-15 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-radiance-charcoalTextColor text-white py-3 px-6 rounded-lg font-medium hover:bg-radiance-goldColor transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                        isWishlisted ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      <Heart
                        size={18}
                        className={isWishlisted ? "fill-current" : ""}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-radiance-charcoalTextColor">
                  Customer Reviews ({reviews.length})
                </h3>

                {reviews.length > 0 ? (
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={`${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-sm mb-1">
                            {review.title}
                          </h4>
                        )}
                        {review.review_text && (
                          <p className="text-sm text-gray-600">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {reviews.length - 3} more review
                        {reviews.length - 3 !== 1 ? "s" : ""}...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
