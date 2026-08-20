import React, { useState } from 'react';
import {
  Laptop,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Code2,
  Layers,
  Users,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function FreelancePage() {
  const { freelance, addFreelance, updateFreelance, toggleFreelanceStatus, deleteFreelance } = useAdminData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [deleteGigId, setDeleteGigId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cloud',
    type: 'FREELANCE · REMOTE',
    rate: '$60 - $95 / hr',
    duration: '3 - 6 Months',
    skillsText: '',
    description: '',
  });

  const handleOpenCreate = () => {
    setEditingGig(null);
    setFormData({
      title: '',
      category: 'Cloud',
      type: 'FREELANCE · REMOTE',
      rate: '$60 - $95 / hr',
      duration: '3 - 6 Months',
      skillsText: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gig) => {
    setEditingGig(gig);
    setFormData({
      title: gig.title || '',
      category: gig.category || 'Cloud',
      type: gig.type || 'FREELANCE · REMOTE',
      rate: gig.rate || '$60 - $95 / hr',
      duration: gig.duration || '3 - 6 Months',
      skillsText: Array.isArray(gig.skills) ? gig.skills.join(', ') : '',
      description: gig.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast({ title: 'Error', message: 'Project title is required', type: 'error' });
      return;
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      type: formData.type,
      rate: formData.rate,
      duration: formData.duration,
      skills: formData.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description,
    };

    if (editingGig) {
      updateFreelance(editingGig.id, payload);
      showToast({ title: 'Updated', message: 'Freelance project updated.', type: 'success' });
    } else {
      addFreelance(payload);
      showToast({ title: 'Created', message: 'Freelance gig published.', type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteGigId) {
      deleteFreelance(deleteGigId);
      setDeleteGigId(null);
      showToast({ title: 'Deleted', message: 'Freelance gig removed.', type: 'warning' });
    }
  };

  const columns = [
    {
      header: 'Project Title',
      accessor: 'title',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-100">{row.title}</div>
          <div className="text-[11px] text-slate-400 max-w-sm truncate">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      cell: (row) => <Badge label={row.category} variant="cyan" size="xs" />,
    },
    {
      header: 'Hourly Rate',
      accessor: 'rate',
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-400">{row.rate}</span>,
    },
    {
      header: 'Duration',
      accessor: 'duration',
      sortable: true,
      cell: (row) => <span className="text-slate-300">{row.duration}</span>,
    },
    {
      header: 'Required Skills',
      accessor: 'skills',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.skills?.slice(0, 3).map((sk) => (
            <span
              key={sk}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
            >
              {sk}
            </span>
          ))}
          {row.skills?.length > 3 && (
            <span className="text-[10px] text-slate-500">+{row.skills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Contractor Bids',
      accessor: 'bidsCount',
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-purple-300">
          <Users className="w-3 h-3" />
          {row.bidsCount || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'activeStatus',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => toggleFreelanceStatus(row.id)}
          className="cursor-pointer"
          title="Click to toggle Active status"
        >
          <Badge label={row.activeStatus ? 'Active' : 'Paused'} size="xs" dot={true} />
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors cursor-pointer"
            title="Edit Gig"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteGigId(row.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Gig"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Freelance Project Hub"
        subtitle="Manage remote contractor opportunities, hourly budgets, and skill requirements"
        columns={columns}
        data={freelance}
        searchPlaceholder="Search freelance gigs by title, skills, or category..."
        filterOptions={[
          {
            key: 'category',
            label: 'All Categories',
            options: ['Cloud', 'DevOps', 'AI', 'Development', 'Data', 'Security', 'Design'],
          },
        ]}
        actionButton={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Freelance Project</span>
          </button>
        }
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGig ? 'Edit Freelance Project' : 'Post Freelance Contract'}
        subtitle="Set hourly budget and contractor skills"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. GenAI & LLM Freelance Projects"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>Cloud</option>
                <option>DevOps</option>
                <option>AI</option>
                <option>Development</option>
                <option>Data</option>
                <option>Security</option>
                <option>Design</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Hourly Rate</label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="$60 - $95 / hr"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="3 - 6 Months (Extendable)"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Skills (Comma-separated)</label>
            <input
              type="text"
              value={formData.skillsText}
              onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
              placeholder="AWS, Terraform, Kubernetes, Docker"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Project Scope & Deliverables</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe deliverables and milestones..."
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
              {editingGig ? 'Save Changes' : 'Publish Gig'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteGigId)}
        onClose={() => setDeleteGigId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Freelance Project"
        message="Are you sure you want to delete this freelance gig?"
      />
    </div>
  );
}
