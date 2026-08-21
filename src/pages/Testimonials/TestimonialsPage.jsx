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
  const { testimonials, fetchTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdminData();
  const { showToast } = useToast();

  React.useEffect(() => {
    fetchTestimonials?.();
  }, [fetchTestimonials]);

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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
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
      content: rev.content || rev.quote || '',
      avatar: rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      isApproved: Boolean(rev.isApproved),
      isFeatured: Boolean(rev.isFeatured),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.author?.trim() || !formData.content?.trim()) {
      showToast({ title: 'Validation Error', message: 'Author name and review content are required.', type: 'error' });
      return;
    }

    const payload = {
      ...formData,
      author: formData.author.trim(),
      role: formData.role.trim(),
      company: formData.company.trim(),
      content: formData.content.trim(),
      avatar: formData.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    };

    try {
      if (editingReview) {
        await updateTestimonial(editingReview.id || editingReview._id, payload);
        showToast({ title: 'Updated', message: `Testimonial from "${formData.author}" updated.`, type: 'success' });
      } else {
        await addTestimonial(payload);
        showToast({ title: 'Created', message: `New testimonial from "${formData.author}" added!`, type: 'success' });
      }
      setIsModalOpen(false);
      await fetchTestimonials?.();
    } catch (err) {
      showToast({ title: 'Save Failed', message: err.message || 'Failed to save testimonial.', type: 'error' });
    }
  };

  const handleToggleApproved = async (rev) => {
    try {
      const nextStatus = !rev.isApproved;
      await updateTestimonial(rev.id || rev._id, { isApproved: nextStatus });
      showToast({
        title: 'Status Updated',
        message: `Review marked as ${nextStatus ? 'Approved' : 'Pending'}.`,
        type: 'info',
      });
      await fetchTestimonials?.();
    } catch (err) {
      showToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteReviewId) {
      try {
        await deleteTestimonial(deleteReviewId);
        showToast({ title: 'Deleted', message: 'Testimonial removed.', type: 'warning' });
        await fetchTestimonials?.();
      } catch (err) {
        showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
      } finally {
        setDeleteReviewId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Client Reviews & Testimonials</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderate enterprise endorsements, 5-star ratings, avatar headshots, and featured homepage quotes
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
            key={rev.id || rev._id}
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
                  onClick={() => setDeleteReviewId(rev._id || rev.id)}
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
                "{rev.content || rev.quote}"
              </p>
            </div>

            {/* Author Footer with Avatar */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt={rev.author}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/30 shrink-0 bg-slate-800"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80';
                  }}
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{rev.author}</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {rev.role} {rev.company ? `· ${rev.company}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleApproved(rev)}
                className="cursor-pointer shrink-0"
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
        subtitle="Manage client testimonials, avatar photos, and ratings"
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

          {/* Avatar Image URL Input with Live Preview */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Avatar / Profile Photo URL</span>
              <span className="text-[10px] text-slate-400 font-normal">Direct image link (Unsplash, HTTPS, CDN)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 w-11 h-11 rounded-xl bg-[#070c1e] border border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">No Pic</span>
                )}
              </div>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
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
