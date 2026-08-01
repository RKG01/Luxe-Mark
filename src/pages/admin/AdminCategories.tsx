import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderTree, Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { categoriesService } from '../../services/categories';
import { useToast } from '../../components/ui/Toast';
import { Category } from '../../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormInput = z.infer<typeof categorySchema>;

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
  });

  // Queries
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      reset();
      toast.success('Category created successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      categoriesService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
      toast.success('Category updated successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete category.');
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the category: ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data: CategoryFormInput) => {
    const payload = {
      name: data.name,
      description: data.description || '',
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Categories</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Configure product categories for catalog indexing</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Category List Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        {isCategoriesLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-4">ID</th>
                  <th className="py-4 px-4">Category Name</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 font-bold text-slate-500 text-xs">
                      #{c.id}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">
                      {c.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-500 max-w-sm line-clamp-1 mt-3.5">
                      {c.description || 'No description provided.'}
                    </td>
                    <td className="py-4 px-4 flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
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
            <FolderTree className="w-10 h-10 text-slate-350 mx-auto mb-3" />
            <h3 className="font-bold text-slate-750">No categories found</h3>
            <p className="text-xs text-slate-450 mt-1">Create your first category by clicking the Add Category button above.</p>
          </div>
        )}
      </div>

      {/* Category Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  placeholder="Footwear"
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
                  placeholder="Shoes, sandals, and sports running sneakers..."
                  {...register('description')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Form Actions */}
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
