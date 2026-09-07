'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import { 
  Users, Plus, Trash2, Edit, Search, 
  Upload, Loader2, X, Check, ArrowUpDown
} from 'lucide-react';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [activeVolunteerId, setActiveVolunteerId] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/volunteers');
      const data = await res.json();
      if (data.volunteers) {
        setVolunteers(data.volunteers);
      }
    } catch (err) {
      console.error('Error loading volunteers:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setModalMode('add');
    setActiveVolunteerId(null);
    setName('');
    setImage('');
    setDescription('');
    setSortOrder((volunteers.length + 1).toString());
    setError('');
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setModalMode('edit');
    setActiveVolunteerId(v.id);
    setName(v.name);
    setImage(v.image || '');
    setDescription(v.description || '');
    setSortOrder((v.sort_order || 0).toString());
    setError('');
    setShowModal(true);
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImage(data.url);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        image,
        description,
        sort_order: parseInt(sortOrder) || 0,
      };

      const url = modalMode === 'add' 
        ? '/api/admin/volunteers' 
        : `/api/admin/volunteers/${activeVolunteerId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save volunteer');
      }

      setShowModal(false);
      fetchVolunteers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, vName) => {
    if (!confirm(`Are you sure you want to remove "${vName}" from volunteers?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVolunteers(volunteers.filter((v) => v.id !== id));
      } else {
        alert(data.error || 'Failed to delete volunteer');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.name?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              Volunteers Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add and organize volunteers displayed on the front-end table (Name, Image, Description)
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Volunteer</span>
          </button>
        </div>

        {/* Search & Stats bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search volunteers by name or seva..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Volunteers: <span className="text-slate-900 font-bold">{volunteers.length}</span>
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading volunteers...</p>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No volunteers found</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {search ? 'Try a different search query.' : 'Add your first volunteer to show on the website.'}
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gold-500 text-white rounded-xl text-xs font-semibold shadow hover:bg-gold-600 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Volunteer</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 w-16 text-center">Order</th>
                    <th className="px-5 py-3">Volunteer Name</th>
                    <th className="px-5 py-3">Image Preview</th>
                    <th className="px-5 py-3">Description / Seva</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVolunteers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 text-center font-mono text-slate-400 font-bold">
                        {v.sort_order}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        {v.name}
                      </td>
                      <td className="px-5 py-3.5">
                        {v.image ? (
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1">
                            <img
                              src={v.image}
                              alt={v.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No image</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {v.description}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(v)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 font-semibold rounded-lg text-xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="inline-flex items-center px-2.5 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs transition"
                          title="Delete Volunteer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Volunteer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif-heading">
                {modalMode === 'add' ? 'Add New Volunteer' : `Edit Volunteer: ${name}`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volunteer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. S. Harvinder Singh Wadhwa or Organization"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image (Upload or Image URL)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gold-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="or paste image URL /uploads/..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono"
                  />
                </div>

                {image && (
                  <div className="mt-2.5 flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden border border-slate-300 p-1 flex items-center justify-center">
                      <img src={image} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[11px] text-slate-500 truncate flex-1 font-mono">{image}</span>
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="text-xs text-red-500 hover:underline px-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Seva Role
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Dailyhukamnama update seva or Full Stack Developer"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sort Order Number
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-28 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-gold-500 hover:bg-gold-600 rounded-xl shadow transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{submitting ? 'Saving...' : 'Save Volunteer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
