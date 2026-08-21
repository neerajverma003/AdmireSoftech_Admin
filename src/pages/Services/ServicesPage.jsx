import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Cpu,
  Cloud,
  Code2,
  ShieldCheck,
  BarChart3,
  Palette,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function ServicesPage() {
  const { services, fetchServices, addService, updateService, deleteService } = useAdminData();
  const { showToast } = useToast();

  React.useEffect(() => {
    fetchServices?.();
  }, [fetchServices]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteServiceId, setDeleteServiceId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cloud',
    badge: 'Popular',
    color: 'from-blue-500 to-cyan-400',
    description: '',
    fullDescription: '',
    featuresText: '',
    techStackText: '',
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'Cloud',
      badge: 'Popular',
      color: 'from-blue-500 to-cyan-400',
      description: '',
      fullDescription: '',
      featuresText: '',
      techStackText: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      title: svc.title || '',
      category: svc.category || 'Cloud',
      badge: svc.badge || 'Popular',
      color: svc.color || 'from-blue-500 to-cyan-400',
      description: svc.description || '',
      fullDescription: svc.fullDescription || '',
      featuresText: Array.isArray(svc.features) ? svc.features.join('\n') : '',
      techStackText: Array.isArray(svc.techStack) ? svc.techStack.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast({ title: 'Validation Error', message: 'Service title is required.', type: 'error' });
      return;
    }

    const serviceTitle = formData.title.trim();
    const serviceDesc = formData.description?.trim() || `${serviceTitle} engineering and consulting services.`;

    const payload = {
      title: serviceTitle,
      category: formData.category || 'Cloud',
      badge: formData.badge || 'Popular',
      color: formData.color || 'from-blue-500 to-cyan-400',
      description: serviceDesc,
      fullDescription: formData.fullDescription?.trim() || serviceDesc,
      features: formData.featuresText
        ? formData.featuresText.split('\n').map((f) => f.trim()).filter(Boolean)
        : [],
      techStack: formData.techStackText
        ? formData.techStackText.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      isActive: true,
    };

    try {
      if (editingService) {
        await updateService(editingService.id || editingService._id, payload);
        showToast({ title: 'Updated', message: `"${serviceTitle}" updated successfully.`, type: 'success' });
      } else {
        await addService(payload);
        showToast({ title: 'Created', message: `"${serviceTitle}" added to services catalog!`, type: 'success' });
      }
      setIsModalOpen(false);
      await fetchServices?.();
    } catch (err) {
      showToast({ title: 'Save Failed', message: err.message || 'Could not save service.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteServiceId) {
      try {
        await deleteService(deleteServiceId);
        showToast({ title: 'Deleted', message: 'Service practice area removed.', type: 'warning' });
        await fetchServices?.();
      } catch (err) {
        showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
      } finally {
        setDeleteServiceId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Services & Solutions Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage offerings, features, tech stack badges, and styling for the main website
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="group relative rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4"
          >
            {/* Top badges & actions */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge label={svc.badge || 'Core'} size="xs" />
                <span className="text-[11px] font-semibold text-slate-400">{svc.category}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer"
                  title="Edit Service"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteServiceId(svc.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {svc.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {svc.description}
              </p>
            </div>

            {/* Feature Bullets */}
            {svc.features?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Key Capabilities
                </p>
                <div className="space-y-1">
                  {svc.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                  {svc.features.length > 3 && (
                    <p className="text-[10px] text-cyan-400/80 font-medium pl-5">
                      +{svc.features.length - 3} more capabilities
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tech Stack Pills */}
            {svc.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/60">
                {svc.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#0e1738] border border-cyan-500/20 text-cyan-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Practice Service' : 'Add New Service Offering'}
        subtitle="Configure service specifications and tech stack tags"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Cloud Services & DevOps"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Cloud, AI, Development, etc."
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Badge Highlight</label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>Popular</option>
                <option>Trending</option>
                <option>Core</option>
                <option>Enterprise</option>
                <option>Data-Driven</option>
                <option>Creative</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Color Gradient</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="from-blue-500 to-cyan-400"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Short Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="1-2 sentences summarizing this service..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Full Overview Description</label>
            <textarea
              rows={3}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              placeholder="In-depth service description..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Key Capabilities (1 per line)</label>
            <textarea
              rows={3}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="Multi-Cloud Architecture&#10;Automated CI/CD Pipelines&#10;Container Orchestration"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Tech Stack (Comma-separated)</label>
            <input
              type="text"
              value={formData.techStackText}
              onChange={(e) => setFormData({ ...formData, techStackText: e.target.value })}
              placeholder="AWS, Azure, Kubernetes, Docker, Terraform"
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
              {editingService ? 'Save Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteServiceId)}
        onClose={() => setDeleteServiceId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Offering"
        message="Are you sure you want to remove this service from your catalog?"
      />
    </div>
  );
}
