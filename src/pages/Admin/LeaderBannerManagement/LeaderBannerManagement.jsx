import { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { getLeaderBanner, upsertLeaderBanner } from "../../../utils/leaderBannerService";
import { getImageUrl } from "../../../utils/imageUtils";

const LeaderBannerManagement = () => {
  const [leaderBanner, setLeaderBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    status: "active",
    image: null,
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    loadLeaderBanner();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const loadLeaderBanner = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getLeaderBanner();

      if (response.success && response.data) {
        setLeaderBanner(response.data);
        setFormData({
          status: response.data.status || "active",
          image: response.data.image || null,
          imageFile: null,
          imagePreview: response.data.image
            ? getImageUrl(response.data.image)
            : "",
        });
      } else {
        setLeaderBanner(null);
        setFormData({
          status: "active",
          image: null,
          imageFile: null,
          imagePreview: "",
        });
      }
    } catch (err) {
      console.error("Error loading leader banner:", err);
      setError(err.message || "Failed to load leader banner data");
      setLeaderBanner(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageFileChange = (file) => {
    if (file) {
      // Revoke previous preview URL if exists
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        imagePreview: "",
      }));
    }
  };

  const handleRemoveImage = () => {
    if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: "",
      image: null, // Also clear the existing image reference
    }));
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
      setIsSaving(true);

      // Create FormData
      const submitFormData = new FormData();
      submitFormData.append("status", formData.status);

      // Add image file (required)
      if (formData.imageFile) {
        submitFormData.append("image", formData.imageFile);
      } else if (!leaderBanner) {
        // For new items, imageFile is required
        setError("Image is required");
        setIsSaving(false);
        return;
      }
      // For existing items, if no new file is selected, the existing image will remain on backend

      await upsertLeaderBanner(submitFormData);
      toast.success("Leader banner saved successfully!");
      await loadLeaderBanner();
    } catch (err) {
      const errorMessage = err.message || "Failed to save leader banner";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
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
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Leader Banner Management
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage the leader banner displayed on the homepage
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading leader banner...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                  disabled={isSaving}
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
                    alt="Leader Banner Preview"
                    className="w-full h-64 object-contain rounded-lg border border-gray-300 mb-2 bg-gray-50"
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
                <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF0000] transition-colors">
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

            {/* Current Banner Info */}
            {leaderBanner && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Current Banner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {leaderBanner.created_by_name && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Created By
                      </label>
                      <p className="text-sm text-gray-900">
                        {leaderBanner.created_by_name}
                      </p>
                    </div>
                  )}
                  {leaderBanner.created_at && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(leaderBanner.created_at)}
                      </p>
                    </div>
                  )}
                  {leaderBanner.updated_at && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(leaderBanner.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving..." : "Save Leader Banner"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LeaderBannerManagement;

