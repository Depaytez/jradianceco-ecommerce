/**
 * Products Catalog Page
 * 
 * Admin can create, edit, delete, and manage products.
 * Access: Admin, Chief Admin, Agent
 */

"use client";

import { useState, useEffect, useActionState } from "react";
import { getProducts } from "@/utils/supabase/services";
import { createProduct, updateProduct, deleteProduct, toggleProductStatus, checkPermission } from "../actions";
import { Package, Plus, Edit, Trash2, ToggleLeft, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/types";

export default function ProductsCatalogPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    sku: "",
    images: "",
  });

  useEffect(() => {
    checkPermissions();
    loadProducts();
  }, []);

  async function checkPermissions() {
    const hasPermission = await checkPermission("agent");
    setHasAccess(hasPermission);
  }

  async function loadProducts() {
    setLoading(true);
    const result = await getProducts({ is_active: undefined });
    setProducts(result);
    setLoading(false);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || "",
      images: product.images?.join(", ") || "",
    });
    setShowModal(true);
  }

  function handleCreate() {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      category: "",
      price: "",
      discount_price: "",
      stock_quantity: "",
      sku: "",
      images: "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("submit");

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      sku: formData.sku || null,
      images: formData.images.split(",").map((img) => img.trim()).filter(Boolean),
      attributes: {},
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productData);
    } else {
      result = await createProduct(productData);
    }

    setMessage({ type: result.success ? "success" : "error", text: result.message || result.error || "" });
    if (result.success) {
      setShowModal(false);
      loadProducts();
    }
    setActionLoading(null);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setActionLoading(productId);
    const result = await deleteProduct(productId);
    setMessage({ type: result.success ? "success" : "error", text: result.message || result.error || "" });
    if (result.success) loadProducts();
    setActionLoading(null);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleToggleStatus(productId: string) {
    setActionLoading(productId);
    const result = await toggleProductStatus(productId);
    setMessage({ type: result.success ? "success" : "error", text: result.message || result.error || "" });
    if (result.success) loadProducts();
    setActionLoading(null);
    setTimeout(() => setMessage(null), 3000);
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to manage products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Products Catalog</h1>
          <p className="text-gray-600 mt-1">Manage all products in your store</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-radiance-goldColor text-white px-6 py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku || "No SKU"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">₦{(product.discount_price || product.price).toLocaleString()}</div>
                      {product.discount_price && (
                        <div className="text-xs text-gray-500 line-through">₦{product.price.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          disabled={actionLoading === product.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title={product.is_active ? "Deactivate" : "Activate"}
                        >
                          <ToggleLeft size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={actionLoading === product.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Create Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "submit"}
                  className="flex-1 px-6 py-3 bg-radiance-goldColor text-white rounded-xl font-medium hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50"
                >
                  {actionLoading === "submit" ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
