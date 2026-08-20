import React, { useState } from 'react';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Quote,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function TestimonialsPage() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdminData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const [formData, setFormData] = useState({
    author: '',
    role: '',
    company: '',
    category: 'Cloud & DevOps',
    rating: 5,
    content: '',
    isApproved: true,
    isFeatured: true,
  });

  const handleOpenCreate = () => {
    setEditingReview(null);
    setFormData({
      author: '',
      role: '',
      company: '',
      category: 'Cloud & DevOps',
      rating: 5,
      content: '',
      isApproved: true,
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setFormData({
      author: rev.author || '',
      role: rev.role || '',
      company: rev.company || '',
      category: rev.category || 'Cloud & DevOps',
      rating: rev.rating || 5,
      content: rev.content || '',
      isApproved: Boolean(rev.isApproved),
      isFeatured: Boolean(rev.isFeatured),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.author || !formData.content) {
      showToast({ title: 'Error', message: 'Author and Review content are required', type: 'error' });
      return;
    }

    if (editingReview) {
      updateTestimonial(editingReview.id, formData);
      showToast({ title: 'Updated', message: 'Testimonial updated.', type: 'success' });
    } else {
      addTestimonial(formData);
      showToast({ title: 'Created', message: 'Client review added.', type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleToggleApproved = (rev) => {
    updateTestimonial(rev.id, { isApproved: !rev.isApproved });
    showToast({
      title: 'Status Updated',
      message: `Review marked as ${!rev.isApproved ? 'Approved' : 'Pending'}.`,
      type: 'info',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteReviewId) {
      deleteTestimonial(deleteReviewId);
      setDeleteReviewId(null);
      showToast({ title: 'Deleted', message: 'Testimonial removed.', type: 'warning' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Client Reviews & Testimonials</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderate enterprise endorsements, 5-star ratings, and featured homepage quotes
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((rev) => (
          <div
            key={rev.id}
            className="group relative rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4"
          >
            {/* Top Stars & Actions */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <Badge label={rev.category} variant="cyan" size="xs" />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(rev)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer"
                  title="Edit Review"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteReviewId(rev.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Review Quote */}
            <div className="relative">
              <Quote className="w-6 h-6 text-slate-700/40 absolute -top-2 -left-2 -z-0" />
              <p className="text-xs text-slate-300 leading-relaxed italic relative z-10">
                "{rev.content}"
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">{rev.author}</h4>
                <p className="text-[11px] text-slate-400">
                  {rev.role} · <span className="text-cyan-400 font-semibold">{rev.company}</span>
                </p>
              </div>

              <button
                onClick={() => handleToggleApproved(rev)}
                className="cursor-pointer"
                title="Click to toggle approved status"
              >
                <Badge label={rev.isApproved ? 'Approved' : 'Pending'} size="xs" dot={true} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReview ? 'Edit Client Review' : 'Add Client Review'}
        subtitle="Manage client testimonials and ratings"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Author Name *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Michael Sterling"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="VP of Engineering"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="FinVortex Global"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>Cloud & DevOps</option>
                <option>AI & Machine Learning</option>
                <option>Full-Stack Development</option>
                <option>Cybersecurity & Compliance</option>
                <option>Data Engineering</option>
                <option>UI/UX Design</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Star Rating (1-5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Testimonial Content *</label>
            <textarea
              rows={3}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What the client said about Admire Softech..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300">Approved for Public Display</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300">Feature on Homepage</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {editingReview ? 'Save Review' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteReviewId)}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Testimonial"
        message="Are you sure you want to remove this client review?"
      />
    </div>
  );
}
