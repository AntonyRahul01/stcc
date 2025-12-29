import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Newspaper,
  AlertTriangle,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getNewsAndEvents,
  createNewsAndEvent,
  updateNewsAndEvent,
  deleteNewsAndEvent,
} from "../../../utils/newsAndEventsService";
import { getCategories } from "../../../utils/categoryService";
import { Editor } from "@tinymce/tinymce-react";

// Simple Rich Text Editor Component
const RichTextEditor = ({ value, onChange, disabled, placeholder }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = (e) => {
    isInternalChange.current = true;
    onChange(e.target.innerHTML);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
          title="Bold"
          disabled={disabled}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
          title="Italic"
          disabled={disabled}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded"
          title="Underline"
          disabled={disabled}
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "h2")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Heading"
          disabled={disabled}
        >
          H
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Bullet List"
          disabled={disabled}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Numbered List"
          disabled={disabled}
        >
          1.
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Link"
          disabled={disabled}
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Align Left"
          disabled={disabled}
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Align Center"
          disabled={disabled}
        >
          ⬌
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Align Right"
          disabled={disabled}
        >
          ➡
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Remove Format"
          disabled={disabled}
        >
          Clear
        </button>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className="min-h-[350px] p-4 focus:outline-none overflow-y-auto"
        style={{ minHeight: "350px" }}
        data-placeholder={placeholder || "Enter description..."}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const NewsAndEventsManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
    category_id: "",
    title: "",
    description: "",
    location: "",
    date_time: "",
    status: "active",
    cover_image: null,
    images: [],
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
    loadCategories();
  }, []);

  useEffect(() => {
    loadNewsAndEvents();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      let categoriesArray = [];
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
      }
      setCategories(categoriesArray);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadNewsAndEvents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getNewsAndEvents(currentPage, 10);

      // Handle response structure: response.data.newsAndEvents
      let itemsArray = [];
      if (
        response &&
        response.data &&
        Array.isArray(response.data.newsAndEvents)
      ) {
        itemsArray = response.data.newsAndEvents;
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
        // Sync currentPage with pagination data
        setCurrentPage(paginationData.currentPage);
      }
    } catch (err) {
      console.error("Error loading news and events:", err);
      setError(err.message || "Failed to load news and events");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      // Format date_time for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDateTime = "";
      if (item.date_time) {
        try {
          const date = new Date(item.date_time);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          console.error("Error formatting date:", e);
        }
      }
      setFormData({
        category_id: item.category_id || "",
        title: item.title || "",
        description: item.description || "",
        location: item.location || "",
        date_time: formattedDateTime,
        status: item.status || "active",
        cover_image: null,
        images: [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        category_id: "",
        title: "",
        description: "",
        location: "",
        date_time: "",
        status: "active",
        cover_image: null,
        images: [],
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      category_id: "",
      title: "",
      description: "",
      location: "",
      date_time: "",
      status: "active",
      cover_image: null,
      images: [],
    });
    setError("");
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("location", formData.location.trim());
      formDataToSend.append(
        "date_time",
        new Date(formData.date_time).toISOString()
      );
      formDataToSend.append("status", formData.status || "active");

      if (formData.cover_image) {
        formDataToSend.append("cover_image", formData.cover_image);
      }

      // Append multiple images
      formData.images.forEach((image, index) => {
        formDataToSend.append("images", image);
      });

      if (editingItem) {
        await updateNewsAndEvent(editingItem.id, formDataToSend);
        toast.success("News/Event updated successfully!");
      } else {
        await createNewsAndEvent(formDataToSend);
        toast.success("News/Event created successfully!");
        // Reset to first page after creating new item
        setCurrentPage(1);
      }
      await loadNewsAndEvents();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message || "Failed to save news/event";
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
      await deleteNewsAndEvent(itemToDelete.id);
      await loadNewsAndEvents();
      toast.success("News/Event deleted successfully!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to delete news/event";
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
    console.log(item);
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
            News & Events Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage news articles and events
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
            <p className="mt-4 text-gray-500">Loading news and events...</p>
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
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        No news or events found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Get started by creating your first news or event
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
                        <div className="flex items-center gap-2">
                          {item.cover_image && (
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.category_name ||
                            categories.find(
                              (cat) => cat.id === item.category_id
                            )?.name ||
                            `Category ${item.category_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(item.date_time)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {item.images &&
                          Array.isArray(item.images) &&
                          item.images.length > 0 ? (
                            <div className="flex -space-x-2">
                              {item.images.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Image ${idx + 1}`}
                                  className="w-8 h-8 rounded border-2 border-white object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ))}
                              {item.images.length > 3 && (
                                <div className="w-8 h-8 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-semibold">
                                  +{item.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No images
                            </span>
                          )}
                        </div>
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
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (page === 1 || page === pagination.totalPages)
                      return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          disabled={isLoading}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-red-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          type="button"
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto relative z-[10000]">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-red-600" />
                </div>
                {editingItem ? "Edit News/Event" : "Add New News/Event"}
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
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter title"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <Editor
                  apiKey="bq62g1x2ye26eyil4ssn3dhx7cwcgfqm2w8opl17ikl7jfzt"
                  value={formData.description || ""}
                  onEditorChange={(content) => {
                    setFormData({ ...formData, description: content });
                  }}
                  init={{
                    plugins: [
                      // Core editing features
                      "anchor",
                      "autolink",
                      "charmap",
                      "codesample",
                      "emoticons",
                      "link",
                      "lists",
                      "media",
                      "searchreplace",
                      "table",
                      "visualblocks",
                      "wordcount",
                      // Your account includes a free trial of TinyMCE premium features
                      // Try the most popular premium features until Jan 12, 2026:
                      "checklist",
                      "mediaembed",
                      "casechange",
                      "formatpainter",
                      "pageembed",
                      "a11ychecker",
                      "tinymcespellchecker",
                      "permanentpen",
                      "powerpaste",
                      "advtable",
                      "advcode",
                      "advtemplate",
                      "ai",
                      "uploadcare",
                      "mentions",
                      "tinycomments",
                      "tableofcontents",
                      "footnotes",
                      "mergetags",
                      "autocorrect",
                      "typography",
                      "inlinecss",
                      "markdown",
                      "importword",
                      "exportword",
                      "exportpdf",
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    tinycomments_author: "Author name",
                    mergetags_list: [
                      { value: "First.Name", title: "First Name" },
                      { value: "Email", title: "Email" },
                    ],
                    ai_request: (request, respondWith) =>
                      respondWith.string(() =>
                        Promise.reject("See docs to implement AI Assistant")
                      ),
                    uploadcare_public_key: "21249131f4092f82e578",
                    height: 400,
                    menubar: false,
                    branding: false,
                  }}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter location"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) =>
                    setFormData({ ...formData, date_time: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                />
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.cover_image
                          ? formData.cover_image.name
                          : "Choose cover image"}
                      </span>
                    </div>
                  </label>
                  {formData.cover_image && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, cover_image: null })
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Images (Multiple)
                </label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Choose multiple images
                      </span>
                    </div>
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group border border-gray-200 rounded-lg p-2"
                        >
                          <div className="text-xs text-gray-600 truncate">
                            {image.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Saving..."
                    : editingItem
                    ? "Update Item"
                    : "Create Item"}
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
                    Delete News/Event
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    "{itemToDelete?.title}"
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
                  {isLoading ? "Deleting..." : "Delete Item"}
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

      {/* View Modal */}
      {isViewModalOpen && viewingItem && (
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
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto relative z-[10000]">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-green-600" />
                </div>
                View News/Event Details
              </h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover Image */}
              {viewingItem.cover_image && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={viewingItem.cover_image}
                      alt={viewingItem.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/800x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {viewingItem.title}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <p className="text-base text-gray-900">
                  {viewingItem.category_name ||
                    categories.find((cat) => cat.id === viewingItem.category_id)
                      ?.name ||
                    `Category ${viewingItem.category_id}`}
                </p>
              </div>

              {/* Description */}
              {viewingItem.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <div
                    className="text-base text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: viewingItem.description,
                    }}
                  />
                </div>
              )}

              {/* Location and Date Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingItem.location && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <p className="text-base text-gray-900">
                      {viewingItem.location}
                    </p>
                  </div>
                )}
                {viewingItem.date_time && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <p className="text-base text-gray-900">
                      {formatDateTime(viewingItem.date_time)}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    viewingItem.status === "active"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  {viewingItem.status || "active"}
                </span>
              </div>

              {/* Additional Images */}
              {viewingItem.images &&
                Array.isArray(viewingItem.images) &&
                viewingItem.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Additional Images ({viewingItem.images.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {viewingItem.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={img}
                            alt={`Image ${index + 1}`}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x300?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {viewingItem.created_by_name && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Created By
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewingItem.created_by_name}
                      </p>
                    </div>
                  )}
                  {viewingItem.created_at && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(viewingItem.created_at)}
                      </p>
                    </div>
                  )}
                  {viewingItem.updated_at && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(viewingItem.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAndEventsManagement;
