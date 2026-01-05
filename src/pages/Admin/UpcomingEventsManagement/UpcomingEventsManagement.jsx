import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getUpcomingEvents,
  createUpcomingEvent,
  updateUpcomingEvent,
  deleteUpcomingEvent,
} from "../../../utils/upcomingEventsService";
import { getCoverImageUrl } from "../../../utils/imageUtils";

const UpcomingEventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
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
    category: "நிகழ்வுகள்",
    date: "",
    title: "",
    location: "",
    locationUrl: "",
    timeStart: "",
    timeEnd: "",
    image: null,
    imagePreview: "",
    description: "",
    content: [],
  });

  useEffect(() => {
    loadEvents();
  }, [currentPage]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getUpcomingEvents(currentPage, 10);

      // Handle API response structure: response.data.upcomingEvents
      let eventsArray = [];
      if (
        response &&
        response.data &&
        response.data.upcomingEvents &&
        Array.isArray(response.data.upcomingEvents)
      ) {
        // Map snake_case API fields to camelCase for component
        eventsArray = response.data.upcomingEvents.map((event) => ({
          ...event,
          locationUrl: event.location_url || event.locationUrl,
          coverimage: event.cover_image || event.coverimage,
          image: event.cover_image || event.coverimage || event.image,
        }));
      } else if (response && response.data && Array.isArray(response.data)) {
        eventsArray = response.data.map((event) => ({
          ...event,
          locationUrl: event.location_url || event.locationUrl,
          coverimage: event.cover_image || event.coverimage,
          image: event.cover_image || event.coverimage || event.image,
        }));
      } else if (response && Array.isArray(response)) {
        eventsArray = response.map((event) => ({
          ...event,
          locationUrl: event.location_url || event.locationUrl,
          coverimage: event.cover_image || event.coverimage,
          image: event.cover_image || event.coverimage || event.image,
        }));
      }

      setEvents(eventsArray);

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
      console.error("Error loading upcoming events:", err);
      setError(err.message || "Failed to load upcoming events");
      setEvents([]);
      toast.error(err.message || "Failed to load upcoming events");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input
  const convertToDateInput = (dateStr) => {
    if (!dateStr) return "";
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const convertFromDateInput = (dateStr) => {
    if (!dateStr) return "";
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const handleOpenModal = (eventItem = null) => {
    if (eventItem) {
      setEditingEvent(eventItem);
      // Parse time range if it exists (format: "15:30 மணி - 17:30 மணி")
      let timeStart = "";
      let timeEnd = "";
      if (eventItem.time) {
        const timeMatch = eventItem.time.match(
          /(\d{2}:\d{2})\s*மணி\s*-\s*(\d{2}:\d{2})\s*மணி/
        );
        if (timeMatch) {
          timeStart = timeMatch[1];
          timeEnd = timeMatch[2];
        }
      }
      // Get the cover image URL for preview
      const coverImagePath =
        eventItem.coverimage || eventItem.cover_image || eventItem.image || "";
      const coverImageUrl = coverImagePath
        ? getCoverImageUrl(coverImagePath)
        : "";

      setFormData({
        category: eventItem.category || "நிகழ்வுகள்",
        date: convertToDateInput(eventItem.date || ""),
        title: eventItem.title || "",
        location: eventItem.location || "",
        locationUrl: eventItem.locationUrl || eventItem.location_url || "",
        timeStart: timeStart,
        timeEnd: timeEnd,
        image: null,
        imagePreview: coverImageUrl,
        description: eventItem.description || "",
        content: eventItem.content || [],
      });
    } else {
      setEditingEvent(null);
      setFormData({
        category: "நிகழ்வுகள்",
        date: "",
        title: "",
        location: "",
        locationUrl: "",
        timeStart: "",
        timeEnd: "",
        image: null,
        imagePreview: "",
        description: "",
        content: [],
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      category: "நிகழ்வுகள்",
      date: "",
      title: "",
      location: "",
      locationUrl: "",
      timeStart: "",
      timeEnd: "",
      image: null,
      imagePreview: "",
      description: "",
      content: [],
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate time: end time must be after start time
    if (formData.timeStart && formData.timeEnd) {
      if (formData.timeEnd <= formData.timeStart) {
        toast.error("End time must be after start time", {
          position: "top-center",
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");

      // Format time range
      const time =
        formData.timeStart && formData.timeEnd
          ? `${formData.timeStart} மணி - ${formData.timeEnd} மணி`
          : formData.timeStart
          ? `${formData.timeStart} மணி`
          : "";

      // Convert date from YYYY-MM-DD to DD/MM/YYYY
      const formattedDate = convertFromDateInput(formData.date);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("date", formattedDate);
      formDataToSend.append("time", time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("locationUrl", formData.locationUrl);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("status", "active");

      // Append cover image if it's a new file
      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("coverimage", formData.image);
      }

      if (editingEvent) {
        await updateUpcomingEvent(editingEvent.id, formDataToSend);
        toast.success("Upcoming event updated successfully!");
      } else {
        await createUpcomingEvent(formDataToSend);
        toast.success("Upcoming event created successfully!");
      }

      await loadEvents();
      // Reset to first page after creating new item
      if (!editingEvent) {
        setCurrentPage(1);
      }
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message || "Failed to save upcoming event";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this upcoming event?")
    ) {
      try {
        setIsLoading(true);
        setError("");
        await deleteUpcomingEvent(id);
        await loadEvents();
        toast.success("Upcoming event deleted successfully!");
      } catch (err) {
        const errorMessage = err.message || "Failed to delete upcoming event";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewClick = (eventItem) => {
    setViewingEvent(eventItem);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-[700] text-gray-900">
          Upcoming Events Management
        </h2>
        <button
          onClick={() => handleOpenModal()}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add New Event
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading upcoming events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-[700] text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No upcoming events found
                    </td>
                  </tr>
                ) : (
                  events.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.time || "-"}
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
                            onClick={() => handleDelete(item.id)}
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
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
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
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
            overflow: "auto",
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-[700] text-gray-900">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                >
                  <option value="நிகழ்வுகள்">நிகழ்வுகள்</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Cover Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF0000] transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.imagePreview
                          ? "Change image"
                          : "Choose cover image"}
                      </span>
                    </div>
                  </label>
                  {formData.imagePreview && (
                    <div className="relative">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter event title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="வணக்க நிகழ்வு பற்றிய விரிவான தகவல்கள்."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.timeStart}
                      onChange={(e) =>
                        setFormData({ ...formData, timeStart: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.timeEnd}
                      onChange={(e) => {
                        const newEndTime = e.target.value;
                        // Validate end time is after start time
                        if (
                          formData.timeStart &&
                          newEndTime <= formData.timeStart
                        ) {
                          toast.error("End time must be after start time", {
                            position: "top-center",
                          });
                          return;
                        }
                        setFormData({ ...formData, timeEnd: newEndTime });
                      }}
                      min={formData.timeStart || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                      required
                    />
                  </div>
                </div>
                {formData.timeStart &&
                  formData.timeEnd &&
                  formData.timeEnd <= formData.timeStart && (
                    <p className="mt-1 text-xs text-red-500">
                      End time must be after start time
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Salle Route Alloys Fauquez 21, Lausanne, 1018"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Location URL (Google Maps){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, locationUrl: e.target.value })
                  }
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : editingEvent ? "Update" : "Add"}
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

      {/* View Modal */}
      {isViewModalOpen && viewingEvent && (
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
                View Event Details
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
              {(viewingEvent.coverimage ||
                viewingEvent.cover_image ||
                viewingEvent.image) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={
                        viewingEvent.coverimage || viewingEvent.cover_image
                          ? getCoverImageUrl(
                              viewingEvent.coverimage ||
                                viewingEvent.cover_image
                            )
                          : viewingEvent.image
                      }
                      alt={viewingEvent.title}
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
                  {viewingEvent.title}
                </p>
              </div>

              {/* Description */}
              {viewingEvent.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-base text-gray-700 whitespace-pre-wrap">
                    {viewingEvent.description}
                  </p>
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingEvent.date && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <p className="text-base text-gray-900">
                      {viewingEvent.date}
                    </p>
                  </div>
                )}
                {viewingEvent.time && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time
                    </label>
                    <p className="text-base text-gray-900">
                      {viewingEvent.time}
                    </p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingEvent.location && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <p className="text-base text-gray-900">
                      {viewingEvent.location}
                    </p>
                  </div>
                )}
                {(viewingEvent.locationUrl || viewingEvent.location_url) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location URL
                    </label>
                    <a
                      href={
                        viewingEvent.locationUrl || viewingEvent.location_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {viewingEvent.locationUrl || viewingEvent.location_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Status */}
              {viewingEvent.status && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      viewingEvent.status === "active"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {viewingEvent.status}
                  </span>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
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

export default UpcomingEventsManagement;
