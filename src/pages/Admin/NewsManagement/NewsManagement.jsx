import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { getNews, addNews, updateNews, deleteNews } from '../../../utils/dataService';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    category: 'செய்திகள்',
    date: '',
    title: '',
    location: '',
    image: '',
    url: '',
    content: [],
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
    const newsData = getNews();
    setNews(newsData);
  };

  const handleOpenModal = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        category: newsItem.category || 'செய்திகள்',
        date: newsItem.date || '',
        title: newsItem.title || '',
        location: newsItem.location || '',
        image: newsItem.image || '',
        url: newsItem.url || `/news/${newsItem.id}`,
        content: newsItem.content || [],
      });
    } else {
      setEditingNews(null);
      setFormData({
        category: 'செய்திகள்',
        date: '',
        title: '',
        location: '',
        image: '',
        url: '',
        content: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    setFormData({
      category: 'செய்திகள்',
      date: '',
      title: '',
      location: '',
      image: '',
      url: '',
      content: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newsItem = {
      ...formData,
      type: 'news',
      url: formData.url || `/news/${editingNews?.id || Date.now()}`,
    };

    if (editingNews) {
      updateNews(editingNews.id, newsItem);
    } else {
      addNews(newsItem);
    }

    loadNews();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      deleteNews(id);
      loadNews();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-[700] text-gray-900">News Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600]"
        >
          <Plus className="w-5 h-5" />
          Add New News
        </button>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <th className="px-6 py-3 text-right text-xs font-[700] text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No news found
                  </td>
                </tr>
              ) : (
                news.map((item) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-[700] text-gray-900">
                {editingNews ? 'Edit News' : 'Add New News'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                >
                  <option value="செய்திகள்">செய்திகள்</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Date (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="04/12/2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  Image URL (Image path from assets)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="../../assets/images/img001.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[600] text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/news/1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-[600]"
                >
                  {editingNews ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-[600]"
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

export default NewsManagement;

