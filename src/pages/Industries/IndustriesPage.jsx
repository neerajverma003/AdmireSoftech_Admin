import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Link as LinkIcon,
  Loader2,
  Code2,
  Smartphone,
  Cloud,
  Cpu,
  TrendingUp,
  Activity,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  Truck,
  Building2,
  Lock,
  Zap,
  Layers,
  ArrowUpRight,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import { uploadFileToS3 } from '../../api/uploadApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const AVAILABLE_ICONS = [
  { name: 'Code2', icon: Code2, label: 'Code & Web' },
  { name: 'Smartphone', icon: Smartphone, label: 'Mobile Apps' },
  { name: 'Cloud', icon: Cloud, label: 'Cloud & DevOps' },
  { name: 'Cpu', icon: Cpu, label: 'AI & Systems' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'FinTech / Finance' },
  { name: 'Activity', icon: Activity, label: 'Healthcare & Biotech' },
  { name: 'BarChart3', icon: BarChart3, label: 'Marketing & Ads' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Blockchain & Security' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'EdTech & Learning' },
  { name: 'Truck', icon: Truck, label: 'Logistics & Supply' },
  { name: 'Building2', icon: Building2, label: 'Real Estate & PropTech' },
  { name: 'Lock', icon: Lock, label: 'Cybersecurity' },
  { name: 'Globe', icon: Globe, label: 'Global / Enterprise' },
  { name: 'Zap', icon: Zap, label: 'Fast / Performance' },
  { name: 'Layers', icon: Layers, label: 'Architecture' },
  { name: 'Sparkles', icon: Sparkles, label: 'Innovation' },
];

const iconMap = AVAILABLE_ICONS.reduce((acc, curr) => {
  acc[curr.name] = curr.icon;
  return acc;
}, {});

export default function IndustriesPage() {
  const { industries, fetchIndustries, addIndustry, updateIndustry, deleteIndustry, toggleIndustryStatus } = useAdminData();
  const { showToast } = useToast();

  useEffect(() => {
    fetchIndustries?.();
  }, [fetchIndustries]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [deleteIndustryId, setDeleteIndustryId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    badge: 'Vertical',
    icon: 'Code2',
    image: '',
    description: '',
    metrics: '',
    order: 0,
    isActive: true,
  });

  const [imageUploadMode, setImageUploadMode] = useState('s3'); // 's3' | 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingS3, setIsUploadingS3] = useState(false);
  const fileInputRef = useRef(null);

  // Unique categories list for filtering
  const categories = ['All', ...Array.from(new Set(industries.map((ind) => ind.category).filter(Boolean)))];

  // Filtered industries
  const filteredIndustries = industries.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metrics?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingIndustry(null);
    setFormData({
      title: '',
      category: 'Engineering',
      badge: 'Vertical',
      icon: 'Code2',
      image: '',
      description: '',
      metrics: '',
      order: industries.length + 1,
      isActive: true,
    });
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingIndustry(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Engineering',
      badge: item.badge || 'Vertical',
      icon: item.icon || 'Code2',
      image: item.image || '',
      description: item.description || '',
      metrics: item.metrics || '',
      order: item.order !== undefined ? item.order : 0,
      isActive: Boolean(item.isActive),
    });
    setImageUrlInput(item.image || '');
    setIsModalOpen(true);
  };

  // Direct S3 Upload
  const handleFileSelectAndUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Invalid File', message: 'Please select an image file (PNG, JPG, WebP).', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: 'File Too Large', message: 'Image size should be less than 5MB.', type: 'error' });
      return;
    }

    setIsUploadingS3(true);
    try {
      showToast({ title: 'Uploading...', message: 'Uploading image to AWS S3 bucket...', type: 'info' });

      const { publicUrl } = await uploadFileToS3(file, {
        module: 'industries',
        category: formData.category || formData.title || 'general',
      });

      setFormData((prev) => ({ ...prev, image: publicUrl }));
      setImageUrlInput(publicUrl);

      showToast({
        title: 'Upload Successful',
        message: 'Image uploaded cleanly to AWS S3 industries bucket directory!',
        type: 'success',
      });
    } catch (err) {
      console.error('[Industries] Upload error:', err);
      showToast({
        title: 'Upload Failed',
        message: err.message || 'Failed to upload to S3. You can paste an image URL instead.',
        type: 'error',
      });
    } finally {
      setIsUploadingS3(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply Direct URL
  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) {
      showToast({ title: 'URL Required', message: 'Please enter a valid image URL.', type: 'error' });
      return;
    }
    setFormData((prev) => ({ ...prev, image: imageUrlInput.trim() }));
    showToast({ title: 'Image Applied', message: 'Image URL loaded successfully.', type: 'success' });
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast({ title: 'Validation Error', message: 'Industry title is required.', type: 'error' });
      return;
    }

    if (!formData.category?.trim()) {
      showToast({ title: 'Validation Error', message: 'Industry category is required.', type: 'error' });
      return;
    }

    if (!formData.image?.trim()) {
      showToast({ title: 'Validation Error', message: 'Cover image URL is required. Please upload or paste a URL.', type: 'error' });
      return;
    }

    if (!formData.description?.trim()) {
      showToast({ title: 'Validation Error', message: 'Description is required.', type: 'error' });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      badge: formData.badge?.trim() || 'Vertical',
      icon: formData.icon || 'Code2',
      image: formData.image.trim(),
      description: formData.description.trim(),
      metrics: formData.metrics?.trim() || '',
      order: Number(formData.order) || 0,
      isActive: Boolean(formData.isActive),
    };

    try {
      if (editingIndustry) {
        await updateIndustry(editingIndustry.id || editingIndustry._id, payload);
        showToast({
          title: 'Industry Updated',
          message: `"${payload.title}" vertical updated successfully.`,
          type: 'success',
        });
      } else {
        await addIndustry(payload);
        showToast({
          title: 'Industry Created',
          message: `"${payload.title}" vertical added to public catalog.`,
          type: 'success',
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not save industry vertical.',
        type: 'error',
      });
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteIndustryId) return;
    try {
      await deleteIndustry(deleteIndustryId);
      showToast({
        title: 'Industry Deleted',
        message: 'Industry vertical removed from database and public site.',
        type: 'info',
      });
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Failed to delete industry vertical.',
        type: 'error',
      });
    } finally {
      setDeleteIndustryId(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item) => {
    try {
      const id = item.id || item._id;
      await toggleIndustryStatus(id);
      showToast({
        title: 'Status Toggled',
        message: `"${item.title}" is now ${!item.isActive ? 'Active (Visible on Website)' : 'Inactive (Hidden)'}.`,
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Failed to toggle industry status.',
        type: 'error',
      });
    }
  };

  const SelectedIconComponent = iconMap[formData.icon] || Code2;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header & Stats Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0c1938] via-[#0b142d] to-[#070c1e] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public Website Vertical Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Industry <span className="text-cyan-400">Verticals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage industry cards, custom S3 visual banners, live metrics, and domain-specific engineering solutions displayed dynamically across the public website.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vertical</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Verticals</span>
          <div className="text-xl font-bold text-slate-100">{industries.length}</div>
        </div>
        <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Live & Active</span>
          <div className="text-xl font-bold text-emerald-400">{industries.filter((i) => i.isActive).length}</div>
        </div>
        <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Draft / Hidden</span>
          <div className="text-xl font-bold text-rose-400">{industries.filter((i) => !i.isActive).length}</div>
        </div>
        <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Categories</span>
          <div className="text-xl font-bold text-purple-400">{categories.length - 1}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search industries by title, category, badge, metrics, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070c1e] border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070c1e] border border-slate-800 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({industries.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({industries.filter((i) => i.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hidden ({industries.filter((i) => !i.isActive).length})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Industries Grid */}
      {filteredIndustries.length === 0 ? (
        <div className="rounded-3xl bg-[#0b1329]/60 border border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No industry verticals found</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new industry vertical.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Industry</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIndustries.map((item) => {
            const Icon = iconMap[item.icon] || Code2;
            const itemId = item.id || item._id;

            return (
              <div
                key={itemId}
                className={`group rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                  item.isActive
                    ? 'bg-[#0b1329]/90 border-slate-800 hover:border-cyan-500/40'
                    : 'bg-[#0b1329]/40 border-slate-800/50 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-[#0b1329]/40 to-transparent" />

                  {/* Icon & Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 backdrop-blur-md shadow-md">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Badge & Status */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {item.badge && (
                      <span className="rounded-full bg-blue-600/40 border border-blue-400/40 px-2 py-0.5 text-[9px] font-mono font-semibold text-cyan-200 backdrop-blur-md">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Key Metric & Order */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Metric:</span>
                      <span className="text-emerald-400 font-semibold truncate max-w-[140px]">
                        {item.metrics || 'N/A'}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                      {/* Active Status Switch */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                        title="Click to toggle visibility on public website"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>{item.isActive ? 'Live' : 'Draft'}</span>
                      </button>

                      {/* Edit and Delete Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition-colors cursor-pointer"
                          title="Edit Industry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteIndustryId(itemId)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
                          title="Delete Industry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndustry ? 'Edit Industry Vertical' : 'Add New Industry Vertical'}
        subtitle="Manage vertical metadata, cover imagery, and performance indicators."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Vertical Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Web Development & SaaS"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Industry Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Engineering, FinTech, Healthcare"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Badge & Key Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Badge Label</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Web Dev, AI / ML, HealthTech"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Key Metric / KPI</label>
              <input
                type="text"
                value={formData.metrics}
                onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                placeholder="e.g. 99.9% Uptime, $2.5B+ Processed"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Category Icon</span>
              <span className="text-slate-500 font-normal">(Selected: {formData.icon})</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#070c1e] border border-slate-800 custom-scrollbar">
              {AVAILABLE_ICONS.map((ico) => {
                const IconComp = ico.icon;
                const isSelected = formData.icon === ico.name;
                return (
                  <button
                    key={ico.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: ico.name })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={ico.label}
                  >
                    <IconComp className="w-4 h-4 mb-1" />
                    <span className="text-[9px] truncate max-w-full">{ico.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Short Description *</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what services and architecture you provide for this vertical..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Cover Image Section with Direct S3 Upload */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#070c1e] border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cover Image *</span>
              </label>

              {/* Upload Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('s3')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    imageUploadMode === 's3' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload to AWS S3
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    imageUploadMode === 'url' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Image URL
                </button>
              </div>
            </div>

            {/* S3 File Upload Mode */}
            {imageUploadMode === 's3' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelectAndUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingS3}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploadingS3 ? (
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transferring to AWS S3 (industries/{formData.category?.toLowerCase() || 'general'})...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 font-semibold">Click to select image file</span>
                      <span className="text-[10px] text-slate-500">Auto-saved to bucket folder: industries/{formData.category?.toLowerCase() || 'general'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Direct URL Input Mode */}
            {imageUploadMode === 'url' && (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyImageUrl}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 font-bold border border-slate-700 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Thumbnail Preview */}
            {formData.image && (
              <div className="relative aspect-[16/8] w-full rounded-xl overflow-hidden border border-slate-700 mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-400 border border-slate-700 backdrop-blur-md">
                    Image Linked
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: '' });
                      setImageUrlInput('');
                    }}
                    className="p-1 rounded bg-rose-500/80 hover:bg-rose-500 text-white text-[10px] cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Display Sort Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#070c1e] border-slate-700 cursor-pointer"
                />
                <span className="text-slate-300 font-semibold">Publish & Show on Public Site</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {editingIndustry ? 'Save Changes' : 'Create Industry Vertical'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteIndustryId)}
        onClose={() => setDeleteIndustryId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Industry Vertical?"
        message="Are you sure you want to delete this industry vertical? This will immediately remove it from both the admin management panel and public website."
        confirmText="Delete Vertical"
        type="danger"
      />
    </div>
  );
}
