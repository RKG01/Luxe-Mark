import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Plus, Edit, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { productsService } from '../../services/products';
import { categoriesService } from '../../services/categories';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils';
import { Product } from '../../types';
import { ImagePlaceholder } from '../../components/shared/ImagePlaceholder';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().min(0, 'Stock must be 0 or greater'),
  imageUrl: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  active: z.boolean().default(true),
});

type ProductFormInput = z.infer<typeof productSchema>;

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema) as any,
  });

  // Queries
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      reset();
      toast.success('Product created successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to create product.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      reset();
      toast.success('Product updated successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update product.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete product.');
    },
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      price: 0,
      stock: 10,
      imageUrl: '',
      categoryId: 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    
    // Find matching category ID from categoryName
    const cat = categories.find((c) => c.name === product.categoryName);
    
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      categoryId: cat ? cat.id : 0,
      active: product.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data: ProductFormInput) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // fallback premium placeholder
      categoryId: data.categoryId,
      active: data.active,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Products</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Add, update, and manage your products catalog</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        {isProductsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-4">Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <ImagePlaceholder
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ID: {p.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-500">
                      {p.categoryName}
                    </td>
                    <td className="py-3 px-4 text-sm font-black text-slate-800">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3 px-4">
                      {p.stock <= 0 ? (
                        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">Out of stock</span>
                      ) : p.stock <= 5 ? (
                        <span className="text-[10px] text-amber-605 font-bold bg-amber-50 px-2 py-0.5 rounded">Low: {p.stock}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">{p.stock} units</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${p.active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2 mt-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-750">No products found</h3>
            <p className="text-xs text-slate-450 mt-1">Create your first product by clicking the Add Product button above.</p>
          </div>
        )}
      </div>

      {/* Product Form Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  placeholder="Nike Air Max"
                  {...register('name')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.name ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Premium leather sports footwear..."
                  {...register('description')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.description ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message}</p>}
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2499.00"
                    {...register('price')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.price ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.price && <p className="text-[10px] text-red-500 font-bold">{errors.price.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="20"
                    {...register('stock')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.stock ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.stock && <p className="text-[10px] text-red-500 font-bold">{errors.stock.message}</p>}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/shoe.jpg"
                  {...register('imageUrl')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.imageUrl ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.imageUrl && <p className="text-[10px] text-red-500 font-bold">{errors.imageUrl.message}</p>}
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  {...register('categoryId')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition cursor-pointer ${
                    errors.categoryId ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  <option value={0}>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-[10px] text-red-500 font-bold">{errors.categoryId.message}</p>}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="active"
                  {...register('active')}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="active" className="text-xs font-semibold text-slate-650 cursor-pointer">
                  Activate this product immediately
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-250 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
