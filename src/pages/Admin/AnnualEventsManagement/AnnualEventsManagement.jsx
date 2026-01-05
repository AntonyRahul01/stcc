import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAnnualEvents,
  createAnnualEvents,
  updateAnnualEvents,
  deleteAnnualEvents,
} from "../../../utils/annualEventsService";
import { getImageUrl } from "../../../utils/imageUtils";

const AnnualEventsManagement = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    status: "active",
    image: null,
    imageFile: null,
    imagePreview: "",
  });

  // Ensure items is always an array
  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn("Items is not an array, defaulting to empty array");
      return [];
    }
    return items;
  }, [items]);

  useEffect(() => {
    loadAnnualEvents();
  }, [currentPage]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const loadAnnualEvents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAnnualEvents();

      // Handle response structure: response.data.annualEventSchedules
      let itemsArray = [];
      if (
        response &&
        response.data &&
        Array.isArray(response.data.annualEventSchedules)
      ) {
        itemsArray = response.data.annualEventSchedules;
      } else if (response && response.data && Array.isArray(response.data)) {
        itemsArray = response.data;
      } else if (Array.isArray(response)) {
        itemsArray = response;
      }

      setItems(itemsArray);

      // Handle pagination
      if (response && response.data && response.data.pagination) {
        const paginationData = {
          currentPage: response.data.pagination.currentPage || 1,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || 0,
          itemsPerPage: response.data.pagination.itemsPerPage || 10,
          hasNext: response.data.pagination.hasNext || false,
          hasPrev: response.data.pagination.hasPrev || false,
        };
        setPagination(paginationData);
        setCurrentPage(paginationData.currentPage);
      }
    } catch (err) {
      console.error("Error loading annual events:", err);
      setError(err.message || "Failed to load annual events");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        status: item.status || "active",
        image: item.image || null,
        imageFile: null,
        imagePreview: item.image ? getImageUrl(item.image) : "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        status: "active",
        image: null,
        imageFile: null,
        imagePreview: "",
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      status: "active",
      image: null,
      imageFile: null,
      imagePreview: "",
    });
    setError("");
  };

  const handleImageFileChange = (file) => {
    if (file) {
      // Revoke previous preview URL if exists
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    } else {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setFormData({
        ...formData,
        imageFile: null,
        imagePreview: "",
      });
    }
  };

  const handleRemoveImage = () => {
    if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: "",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation - Image is required
    if (!formData.imageFile && !formData.image) {
      setError("Image is required");
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData
      const submitFormData = new FormData();
      submitFormData.append("status", formData.status);

      // Add image file (required)
      if (formData.imageFile) {
        submitFormData.append("image", formData.imageFile);
      } else if (!editingItem) {
        // For new items, imageFile is required
        setError("Image is required");
        setIsLoading(false);
        return;
      }
      // For editing, if no new file is selected, the existing image will remain on backend

      if (editingItem) {
        await updateAnnualEvents(editingItem.id, submitFormData);
        toast.success("Annual event updated successfully!");
      } else {
        await createAnnualEvents(submitFormData);
        toast.success("Annual event created successfully!");
        setCurrentPage(1);
      }
      await loadAnnualEvents();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message || "Failed to save annual event";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    const item = safeItems.find((item) => item.id === id);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      setError("");
      await deleteAnnualEvents(itemToDelete.id);
      await loadAnnualEvents();
      toast.success("Annual event deleted successfully!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to delete annual event";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleViewClick = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch {
      return dateTimeString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Annual Events Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage annual event schedules
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {isLoading && safeItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading annual events...</p>
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
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        No annual events found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Get started by creating your first annual event
                      </p>
                    </td>
                  </tr>
                ) : (
                  safeItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {(currentPage - 1) * pagination.itemsPerPage +
                            index +
                            1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt="Annual Event"
                            className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-gray-50"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            விரைவில்...
                          </span>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(item.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewClick(item)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center w-10 h-10 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-green-300 shadow-sm"
                            title="View"
                            type="button"
                          >
                            <Eye
                              className="w-5 h-5 flex-shrink-0"
                              strokeWidth={2}
                            />
                          </button>
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(
                  currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.totalItems}
              </span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 px-4">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div
          className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? "Edit Annual Event" : "Create Annual Event"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Inactive</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status:
                          formData.status === "active" ? "inactive" : "active",
                      })
                    }
                    disabled={isLoading}
                    className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                      formData.status === "active"
                        ? "bg-[#34C759]"
                        : "bg-[#D1D5DB]"
                    }`}
                    role="switch"
                    aria-checked={formData.status === "active"}
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                {formData.imagePreview || formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview || getImageUrl(formData.image)}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg border border-gray-300 mb-2 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF0000] transition-colors">
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageFileChange(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this annual event? This action
              cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingItem && (
        <div
          className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                View Annual Event
              </h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    viewingItem.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {viewingItem.status || "active"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                {viewingItem.image ? (
                  <img
                    src={getImageUrl(viewingItem.image)}
                    alt="Annual Event"
                    className="w-full h-auto rounded-lg border border-gray-300"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-300">
                    <span className="text-gray-500 italic">விரைவில்...</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900">
                  {formatDateTime(viewingItem.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated At
                </label>
                <p className="text-gray-900">
                  {formatDateTime(viewingItem.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualEventsManagement;
