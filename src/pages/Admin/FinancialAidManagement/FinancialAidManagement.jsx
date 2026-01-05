import { useState, useEffect } from "react";
import { Edit, X, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import {
  getFinancialAid,
  createFinancialAid,
  updateFinancialAid,
} from "../../../utils/financialAidService";

const FinancialAidManagement = () => {
  const [financialAid, setFinancialAid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    card1: {
      amount: "",
      currency: "CHF",
      label: "",
    },
    card2: {
      amount: "",
      currency: "SLR",
      label: "",
    },
  });

  useEffect(() => {
    loadFinancialAid();
  }, []);

  const loadFinancialAid = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getFinancialAid();

      if (response.success && response.data) {
        setFinancialAid(response.data);
        setFormData({
          year: response.data.year || "",
          title: response.data.title || "",
          card1: response.data.card1 || {
            amount: "",
            currency: "CHF",
            label: "",
          },
          card2: response.data.card2 || {
            amount: "",
            currency: "SLR",
            label: "",
          },
        });
      }
    } catch (err) {
      console.error("Error loading financial aid:", err);
      setError(err.message || "Failed to load financial aid data");
      toast.error("Failed to load financial aid data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (financialAid) {
      setFormData({
        year: financialAid.year || "",
        title: financialAid.title || "",
        card1: financialAid.card1 || {
          amount: "",
          currency: "CHF",
          label: "",
        },
        card2: financialAid.card2 || {
          amount: "",
          currency: "SLR",
          label: "",
        },
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const handleCardChange = (cardKey, field, value) => {
    setFormData({
      ...formData,
      [cardKey]: {
        ...formData[cardKey],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.year || !formData.title) {
      setError("Year and title are required");
      return;
    }

    if (
      !formData.card1.amount ||
      !formData.card1.label ||
      !formData.card2.amount ||
      !formData.card2.label
    ) {
      setError("All card amounts and labels are required");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        year: formData.year.trim(),
        title: formData.title.trim(),
        card1: {
          amount: formData.card1.amount.toString().trim(),
          currency: formData.card1.currency,
          label: formData.card1.label.trim(),
        },
        card2: {
          amount: formData.card2.amount.toString().trim(),
          currency: formData.card2.currency,
          label: formData.card2.label.trim(),
        },
      };

      // Check if financial aid exists (has id) - if yes, update; if no, create
      if (financialAid && financialAid.id) {
        // Update existing
        await updateFinancialAid(financialAid.id, payload);
        toast.success("Financial aid data updated successfully!");
      } else {
        // Create new
        await createFinancialAid(payload);
        toast.success("Financial aid data created successfully!");
      }

      await loadFinancialAid();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.message || "Failed to save financial aid data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-[700] text-gray-900">
          Financial Aid Management
        </h2>
        <button
          onClick={handleOpenModal}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit className="w-5 h-5" />
          Edit Financial Aid
        </button>
      </div>

      {/* Current Data Display */}
      {isLoading && !financialAid ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-500">Loading financial aid data...</p>
        </div>
      ) : financialAid ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Year</h3>
              <p className="text-gray-900">{financialAid.year}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Title
              </h3>
              <p className="text-gray-900">{financialAid.title}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 */}
                {financialAid.card1 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-[#FF0000]" />
                      <span className="font-semibold text-gray-700">
                        Card 1 ({financialAid.card1.currency})
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Amount:</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {financialAid.card1.amount}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Label:</span>
                        <p className="text-gray-900">
                          {financialAid.card1.label}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 2 */}
                {financialAid.card2 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-[#FF0000]" />
                      <span className="font-semibold text-gray-700">
                        Card 2 ({financialAid.card2.currency})
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Amount:</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {financialAid.card2.amount}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Label:</span>
                        <p className="text-gray-900">
                          {financialAid.card2.label}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No financial aid data found</p>
        </div>
      )}

      {/* Edit Modal */}
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
                Edit Financial Aid Data
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

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              {/* Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Cards *
                </label>
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Card 1 ({formData.card1.currency})
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Amount *
                        </label>
                        <input
                          type="text"
                          value={formData.card1.amount}
                          onChange={(e) =>
                            handleCardChange("card1", "amount", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={formData.card1.label}
                          onChange={(e) =>
                            handleCardChange("card1", "label", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Card 2 ({formData.card2.currency})
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Amount *
                        </label>
                        <input
                          type="text"
                          value={formData.card2.amount}
                          onChange={(e) =>
                            handleCardChange("card2", "amount", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={formData.card2.label}
                          onChange={(e) =>
                            handleCardChange("card2", "label", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
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
    </div>
  );
};

export default FinancialAidManagement;
