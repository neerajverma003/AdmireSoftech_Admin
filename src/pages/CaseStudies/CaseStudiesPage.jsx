import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import { uploadFileToS3 } from '../../api/uploadApi';
import { convertImageToWebP } from '../../utils/imageConverter';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const CATEGORIES = [
  'Cloud & DevOps',
  'AI & Machine Learning',
  'Full-Stack Web & SaaS',
  'Mobile Engineering',
  'Cybersecurity & Audit',
  'FinTech',
  'Healthcare',
  'Enterprise Systems',
];

const DEFAULT_METRICS = [
  { label: 'Uptime SLA', value: '99.99%' },
  { label: 'Latency Cut', value: '65%' },
];

export default function CaseStudiesPage() {
  const {
    caseStudies,
    fetchCaseStudies,
    addCaseStudy,
    updateCaseStudy,
    deleteCaseStudy,
    toggleCaseStudyStatus,
  } = useAdminData();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCaseStudies?.();
  }, [fetchCaseStudies]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState(null);
  const [deleteCaseStudyId, setDeleteCaseStudyId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    category: 'Cloud & DevOps',
    badge: 'Featured Impact',
    thumbnail: '',
    summary: '',
    challenge: '',
    solution: '',
    impactMetrics: DEFAULT_METRICS,
    techStack: ['AWS', 'Kubernetes', 'Docker'],
    clientQuote: { quote: '', author: '', role: '' },
    isFeatured: true,
    isPublished: true,
    order: 0,
  });

  const [newTechInput, setNewTechInput] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState('s3'); // 's3' | 'url'
  const [isUploadingS3, setIsUploadingS3] = useState(false);
  const fileInputRef = useRef(null);

  // Unique categories list for filtering
  const filterCategories = ['All', ...CATEGORIES];

  const handleOpenCreateModal = () => {
    setEditingCaseStudy(null);
    setFormData({
      title: '',
      client: '',
      category: 'Cloud & DevOps',
      badge: 'Featured Impact',
      thumbnail: '',
      summary: '',
      challenge: '',
      solution: '',
      impactMetrics: [
        { label: 'Uptime SLA', value: '99.99%' },
        { label: 'Latency Cut', value: '65%' },
      ],
      techStack: ['AWS', 'Kubernetes', 'Docker'],
      clientQuote: { quote: '', author: '', role: '' },
      isFeatured: true,
      isPublished: true,
      order: caseStudies.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingCaseStudy(item);
    setFormData({
      title: item.title || '',
      client: item.client || '',
      category: item.category || 'Cloud & DevOps',
      badge: item.badge || 'Featured Impact',
      thumbnail: item.thumbnail || '',
      summary: item.summary || '',
      challenge: item.challenge || '',
      solution: item.solution || '',
      impactMetrics: Array.isArray(item.impactMetrics) && item.impactMetrics.length > 0
        ? item.impactMetrics
        : [
            { label: 'Uptime SLA', value: '99.99%' },
            { label: 'Latency Cut', value: '65%' },
          ],
      techStack: Array.isArray(item.techStack) ? item.techStack : [],
      clientQuote: item.clientQuote || { quote: '', author: '', role: '' },
      isFeatured: item.isFeatured !== undefined ? item.isFeatured : true,
      isPublished: item.isPublished !== undefined ? item.isPublished : true,
      order: item.order !== undefined ? item.order : 0,
    });
    setIsModalOpen(true);
  };

  // WebP Image Conversion & S3 Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingS3(true);
      showToast({ title: 'Converting', message: 'Converting image to WebP format...', type: 'info' });

      // 1. Convert to WebP format in-browser via Canvas
      const webpFile = await convertImageToWebP(file, {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      // 2. Format slug for folder hierarchy
      const titleSlug = formData.title
        ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : 'project';

      showToast({ title: 'Uploading', message: 'Uploading WebP thumbnail to AWS S3...', type: 'info' });

      // 3. Upload to S3 with structured folder format
      const uploadResult = await uploadFileToS3(webpFile, {
        module: 'case-studies',
        category: formData.category,
        folder: titleSlug,
      });

      const publicUrl = uploadResult?.publicUrl || (typeof uploadResult === 'string' ? uploadResult : '');

      setFormData((prev) => ({ ...prev, thumbnail: publicUrl }));
      showToast({ title: 'Success', message: 'WebP thumbnail uploaded successfully!', type: 'success' });
    } catch (err) {
      console.error('S3 Upload Error:', err);
      showToast({ title: 'Upload Failed', message: err.message || 'Failed to upload image', type: 'error' });
    } finally {
      setIsUploadingS3(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Metrics Management
  const handleAddMetric = () => {
    setFormData((prev) => ({
      ...prev,
      impactMetrics: [...prev.impactMetrics, { label: '', value: '' }],
    }));
  };

  const handleRemoveMetric = (index) => {
    setFormData((prev) => ({
      ...prev,
      impactMetrics: prev.impactMetrics.filter((_, i) => i !== index),
    }));
  };

  const handleMetricChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.impactMetrics];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, impactMetrics: updated };
    });
  };

  // Tech Stack Tag Management
  const handleAddTechTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newTechInput.trim()) return;
      const tag = newTechInput.trim();
      if (!formData.techStack.includes(tag)) {
        setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, tag] }));
      }
      setNewTechInput('');
    }
  };

  const handleRemoveTechTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tagToRemove),
    }));
  };

  // Form Submit (Save / Create)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleTrimmed = formData.title?.trim();
    const clientTrimmed = formData.client?.trim();
    const thumbnailTrimmed = typeof formData.thumbnail === 'string'
      ? formData.thumbnail.trim()
      : formData.thumbnail?.publicUrl || '';
    const summaryTrimmed = formData.summary?.trim();
    const challengeTrimmed = formData.challenge?.trim();
    const solutionTrimmed = formData.solution?.trim();

    if (!titleTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please enter a case study title', type: 'error' });
      return;
    }
    if (!clientTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please specify a client or industry descriptor', type: 'error' });
      return;
    }
    if (!thumbnailTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please upload or specify a cover thumbnail image', type: 'error' });
      return;
    }
    if (!summaryTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please enter an executive summary', type: 'error' });
      return;
    }
    if (!challengeTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please enter the challenge problem statement', type: 'error' });
      return;
    }
    if (!solutionTrimmed) {
      showToast({ title: 'Validation Error', message: 'Please enter the technical solution details', type: 'error' });
      return;
    }

    const payload = {
      ...formData,
      title: titleTrimmed,
      client: clientTrimmed,
      thumbnail: thumbnailTrimmed,
      summary: summaryTrimmed,
      challenge: challengeTrimmed,
      solution: solutionTrimmed,
    };

    try {
      if (editingCaseStudy) {
        await updateCaseStudy(editingCaseStudy.id || editingCaseStudy._id, payload);
        showToast({ title: 'Success', message: 'Case study updated successfully!', type: 'success' });
      } else {
        await addCaseStudy(payload);
        showToast({ title: 'Success', message: 'Case study created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Case study save error:', err);
      showToast({ title: 'Error', message: err.message || 'Failed to save case study', type: 'error' });
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteCaseStudyId) return;
    try {
      await deleteCaseStudy(deleteCaseStudyId);
      showToast({ title: 'Success', message: 'Case study deleted successfully', type: 'success' });
      setDeleteCaseStudyId(null);
    } catch (err) {
      console.error('Delete case study error:', err);
      showToast({ title: 'Error', message: err.message || 'Failed to delete case study', type: 'error' });
    }
  };

  // Filtered List
  const filteredCaseStudies = caseStudies.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(item.techStack) &&
        item.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? item.isPublished
        : !item.isPublished;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ──── PAGE HEADER ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#080E24]/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Case Studies & Portfolio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            Manage mission-critical engineering deliveries, impact metrics, and client outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Case Study</span>
          </button>
        </div>
      </div>

      {/* ──── FILTERS & SEARCH BAR ──── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#080E24]/40 border border-slate-800/80 rounded-2xl p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, client, stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            {filterCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                Category: {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="published">Status: Published</option>
            <option value="draft">Status: Draft</option>
          </select>
        </div>
      </div>

      {/* ──── CASE STUDIES GRID ──── */}
      {filteredCaseStudies.length === 0 ? (
        <div className="text-center py-16 bg-[#080E24]/30 border border-slate-800/60 rounded-3xl space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Case Studies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' || statusFilter !== 'all'
              ? 'Try clearing your search query or filters.'
              : 'Click "Add Case Study" to create your first client success story.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCaseStudies.map((item) => (
            <div
              key={item.id || item._id}
              className="group relative flex flex-col rounded-3xl border border-slate-800/80 bg-[#080E24]/70 backdrop-blur-xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 shadow-xl shadow-black/40"
            >
              {/* Cover Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080E24] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase backdrop-blur-md">
                    {item.category}
                  </span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase backdrop-blur-md">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      item.isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span>{item.isPublished ? 'Published' : 'Draft'}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    {item.client}
                  </div>
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Impact Metrics Highlights */}
                {Array.isArray(item.impactMetrics) && item.impactMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                    {item.impactMetrics.slice(0, 2).map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-2 text-center"
                      >
                        <div className="text-xs sm:text-sm font-extrabold text-cyan-300 font-mono">
                          {m.value}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Stack Chips */}
                {Array.isArray(item.techStack) && item.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 text-[10px] font-mono border border-slate-700/60"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.techStack.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 text-[10px] font-mono">
                        +{item.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  {/* Publish Toggle */}
                  <button
                    onClick={() => toggleCaseStudyStatus(item.id || item._id, 'isPublished')}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      item.isPublished
                        ? 'text-emerald-300 hover:bg-emerald-500/10'
                        : 'text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.isPublished ? 'Live' : 'Draft'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-slate-700 transition-all cursor-pointer"
                      title="Edit Case Study"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCaseStudyId(item.id || item._id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 border border-slate-700 transition-all cursor-pointer"
                      title="Delete Case Study"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── CREATE / EDIT CASE STUDY MODAL ──── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCaseStudy ? 'Edit Case Study' : 'Create New Case Study'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-left font-poppins">
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Project Title <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Global FinTech Microservices Migration"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Category Domain <span className="text-cyan-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client & Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Client / Industry Descriptor <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tier-1 Digital Payments Group"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Badge Pill Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Enterprise Scale / Mission Critical"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Thumbnail Image (S3 WebP Upload) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Cover Thumbnail (WebP Upload) <span className="text-cyan-400">*</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('s3')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    imageUploadMode === 's3'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                   Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    imageUploadMode === 'url'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {imageUploadMode === 's3' ? (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingS3}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingS3 ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing WebP & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Choose Image (Auto-Converts to .webp)</span>
                    </>
                  )}
                </button>
                {formData.thumbnail && (
                  <span className="text-[11px] font-mono text-emerald-400 truncate max-w-xs">
                    ✓ WebP Uploaded
                  </span>
                )}
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            )}

            {formData.thumbnail && (
              <div className="relative h-28 w-48 rounded-xl overflow-hidden border border-slate-700 mt-2">
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Executive Summary <span className="text-cyan-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Brief 2-line summary of project outcomes..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                The Challenge / Bottlenecks <span className="text-cyan-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe legacy hurdles, scaling problems, downtime..."
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                The Technical Solution <span className="text-cyan-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe architecture, pipelines, frameworks, and deployment strategy..."
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Impact Metrics Builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Key Impact Metrics & SLAs
              </label>
              <button
                type="button"
                onClick={handleAddMetric}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.impactMetrics.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Metric Value (e.g. 99.99%)"
                    value={m.value}
                    onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                    className="w-1/3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Metric Label (e.g. Uptime SLA)"
                    value={m.label}
                    onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMetric(idx)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Tag Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Technology Stack Tags
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type tech (e.g. AWS, Kubernetes) & press Enter..."
                value={newTechInput}
                onChange={(e) => setNewTechInput(e.target.value)}
                onKeyDown={handleAddTechTag}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTechTag}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-cyan-300 hover:bg-slate-700 cursor-pointer"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechTag(tech)}
                    className="hover:text-rose-400 cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Toggles (Published & Featured) */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4"
              />
              <span>Published (Visible on Public Website)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4"
              />
              <span>Featured Spotlight</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              {editingCaseStudy ? 'Save Changes' : 'Create Case Study'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ──── DELETE CONFIRMATION MODAL ──── */}
      <ConfirmModal
        isOpen={!!deleteCaseStudyId}
        onClose={() => setDeleteCaseStudyId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Case Study"
        message="Are you sure you want to delete this case study? This action cannot be undone."
        confirmText="Delete Story"
      />
    </div>
  );
}
