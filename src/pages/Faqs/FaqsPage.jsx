import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  FolderTree,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function FaqsPage() {
  const { faqs, addFaq, updateFaq, deleteFaq } = useAdminData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deleteFaqId, setDeleteFaqId] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const [formData, setFormData] = useState({
    category: 'General',
    question: '',
    answer: '',
  });

  const categories = ['ALL', ...new Set(faqs.map((f) => f.category))];

  const filteredFaqs = activeCategory === 'ALL'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({
      category: activeCategory !== 'ALL' ? activeCategory : 'General',
      question: '',
      answer: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category || 'General',
      question: faq.question || '',
      answer: faq.answer || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      showToast({ title: 'Error', message: 'Question and Answer are required', type: 'error' });
      return;
    }

    if (editingFaq) {
      updateFaq(editingFaq.id, formData);
      showToast({ title: 'Updated', message: 'FAQ entry updated.', type: 'success' });
    } else {
      addFaq(formData);
      showToast({ title: 'Created', message: 'New FAQ added to knowledge base.', type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteFaqId) {
      deleteFaq(deleteFaqId);
      setDeleteFaqId(null);
      showToast({ title: 'Deleted', message: 'FAQ entry removed.', type: 'warning' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">FAQ Knowledge Base Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage frequently asked questions, technical answers, and category organization
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedFaqId === faq.id;

          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 hover:border-cyan-500/30 transition-all duration-200 shadow-lg overflow-hidden"
            >
              <div
                onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge label={faq.category} size="xs" variant="purple" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                    {faq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(faq);
                    }}
                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteFaqId(faq.id);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-[#070c1e]/60 animate-fadeIn">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'Add FAQ Question'}
        subtitle="Manage knowledge base question and answers"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Cloud & DevOps, Pricing, AI / ML"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Question *</label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. How quickly can you onboard dedicated engineering squads?"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Answer *</label>
            <textarea
              rows={4}
              required
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Comprehensive answer text..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
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
              {editingFaq ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteFaqId)}
        onClose={() => setDeleteFaqId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete FAQ Question"
        message="Are you sure you want to delete this FAQ entry?"
      />
    </div>
  );
}
