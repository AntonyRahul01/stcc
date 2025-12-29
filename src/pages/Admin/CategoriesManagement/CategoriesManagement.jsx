import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, X, Tag, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../utils/categoryService";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  // Ensure categories is always an array
  const safeCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      console.warn("Categories is not an array, defaulting to empty array");
      return [];
    }
    return categories;
  }, [categories]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getCategories();

      // Ensure we always have an array
      let categoriesArray = [];

      // Handle nested structure: response.data.categories
      if (
        response &&
        response.data &&
        Array.isArray(response.data.categories)
      ) {
        categoriesArray = response.data.categories;
      } else if (Array.isArray(response)) {
        categoriesArray = response;
      } else if (response && Array.isArray(response.categories)) {
        categoriesArray = response.categories;
      } else if (response && Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else {
        categoriesArray = [];
      }

      setCategories(categoriesArray);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (categoryItem = null) => {
    if (categoryItem) {
      setEditingCategory(categoryItem);
      setFormData({
        name: categoryItem.name || "",
        slug: categoryItem.slug || "",
        description: categoryItem.description || "",
        status: categoryItem.status || "active",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: "active",
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "active",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prepare payload matching API structure
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description?.trim() || null,
      status: formData.status || "active",
    };

    try {
      setIsLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success("Category updated successfully!");
      } else {
        await createCategory(payload);
        toast.success("Category created successfully!");
      }
      await loadCategories();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message || "Failed to save category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    const category = safeCategories.find((cat) => cat.id === id);
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setIsLoading(true);
      setError("");
      await deleteCategory(categoryToDelete.id);
      await loadCategories();
      toast.success("Category deleted successfully!");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to delete category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Categories Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and organize your content categories
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add New Category
        </button>
      </div>

      {/* Error Message */}
      {error && !isModalOpen && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {isLoading && safeCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        No categories found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Get started by creating your first category
                      </p>
                    </td>
                  </tr>
                ) : (
                  safeCategories.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                          {item.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {item.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {item.description || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-300 shadow-sm"
                            title="Edit"
                            type="button"
                          >
                            <Edit
                              className="w-5 h-5 flex-shrink-0"
                              strokeWidth={2}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center w-10 h-10 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 shadow-sm"
                            title="Delete"
                            type="button"
                          >
                            <Trash2
                              className="w-5 h-5 flex-shrink-0"
                              strokeWidth={2}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: "1rem",
            overflow: "auto",
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto relative z-[10000]">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-red-600" />
                </div>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter category name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed font-mono text-sm"
                  placeholder="category-slug"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name (e.g., "events", "news")
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status
                </label>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Inactive</span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.status === "active"}
                    disabled={isLoading}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status:
                          formData.status === "active" ? "inactive" : "active",
                      })
                    }
                    className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                      formData.status === "active"
                        ? "bg-[#34C759]"
                        : "bg-[#D1D5DB]"
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-[24px] h-[24px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                        formData.status === "active"
                          ? "translate-x-[20px]"
                          : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span
                    className={`text-sm ${
                      formData.status === "active"
                        ? "text-[#34C759] font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    Active
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter category description (optional)"
                  rows="4"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: "1rem",
            overflow: "auto",
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 relative z-[10000]">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Delete Category
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete the category{" "}
                  <span className="font-semibold text-gray-900">
                    "{categoryToDelete?.name}"
                  </span>
                  ? This will permanently remove it from the system.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isLoading ? "Deleting..." : "Delete Category"}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
