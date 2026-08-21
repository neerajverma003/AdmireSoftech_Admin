import React, { useState, useEffect } from 'react';
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
  const { faqs, fetchFaqs, addFaq, updateFaq, deleteFaq } = useAdminData();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFaqs?.();
  }, [fetchFaqs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deleteFaqId, setDeleteFaqId] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const [formData, setFormData] = useState({
    category: 'Engineering & Tech',
    question: '',
    answer: '',
    highlights: '',
  });

  const categories = ['ALL', ...new Set(faqs.map((f) => f.category).filter(Boolean))];

  const filteredFaqs = activeCategory === 'ALL'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({
      category: activeCategory !== 'ALL' ? activeCategory : 'Engineering & Tech',
      question: '',
      answer: '',
      highlights: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category || 'General',
      question: faq.question || '',
      answer: faq.answer || '',
      highlights: Array.isArray(faq.highlights) ? faq.highlights.join('\n') : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast({ title: 'Validation Error', message: 'Question and Answer are required.', type: 'error' });
      return;
    }

    const payload = {
      category: formData.category.trim() || 'General',
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      highlights: formData.highlights
        ? formData.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingFaq) {
        await updateFaq(editingFaq._id || editingFaq.id, payload);
        showToast({ title: 'Updated', message: 'FAQ entry updated.', type: 'success' });
      } else {
        await addFaq(payload);
        showToast({ title: 'Created', message: 'New FAQ added to knowledge base.', type: 'success' });
      }
      setIsModalOpen(false);
      await fetchFaqs?.();
    } catch (err) {
      showToast({ title: 'Save Failed', message: err.message || 'Failed to save FAQ.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteFaqId) {
      try {
        await deleteFaq(deleteFaqId);
        showToast({ title: 'Deleted', message: 'FAQ entry removed.', type: 'warning' });
        await fetchFaqs?.();
      } catch (err) {
        showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
      } finally {
        setDeleteFaqId(null);
      }
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
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-[#0b1329]/60 border border-slate-800/80">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No FAQ questions found</p>
            <p className="text-xs text-slate-500 mt-1">Create an entry or switch category filter</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === (faq._id || faq.id);
            const faqId = faq._id || faq.id;

            return (
              <div
                key={faqId}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0b1329] border-cyan-500/40 shadow-lg'
                    : 'bg-[#0b1329]/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => setExpandedFaqId(isExpanded ? null : faqId)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge label={faq.category || 'General'} variant="cyan" size="xs" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(faq);
                      }}
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteFaqId(faqId);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1 text-slate-500">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-3">
                    <p className="leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                    {Array.isArray(faq.highlights) && faq.highlights.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 space-y-1">
                        <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                          Key Highlights:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                          {faq.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
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
              placeholder="e.g. Engineering & Tech, Security & NDA, Process & Timelines, Pricing & Engagement"
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

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">
              Highlights / Takeaways (Optional - One bullet per line)
            </label>
            <textarea
              rows={3}
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              placeholder="Full legal IP assignment upon completion&#10;SOC 2 Type II readiness&#10;Zero-downtime database replication"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
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
