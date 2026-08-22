import React, { useState, useEffect } from 'react';
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
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock3,
  XCircle,
  Briefcase,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function FreelancePage() {
  const {
    freelance,
    fetchFreelance,
    addFreelance,
    updateFreelance,
    toggleFreelanceStatus,
    deleteFreelance,
    fetchProposals,
    updateProposalStatus,
  } = useAdminData();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFreelance?.();
  }, [fetchFreelance]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [deleteGigId, setDeleteGigId] = useState(null);

  // Proposals Viewer Modal State
  const [selectedGigForProposals, setSelectedGigForProposals] = useState(null);
  const [proposalsList, setProposalsList] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cloud',
    type: 'FREELANCE · REMOTE',
    rate: '$60 - $95 / hr',
    duration: '3 - 6 Months',
    skillsText: '',
    description: '',
    deliverablesText: '',
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
      deliverablesText: '',
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
      deliverablesText: Array.isArray(gig.deliverables) ? gig.deliverables.join('\n') : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim()) {
      showToast({ title: 'Validation Error', message: 'Project title and description are required', type: 'error' });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category || 'Development',
      type: formData.type.trim() || 'FREELANCE · REMOTE',
      rate: formData.rate.trim() || '$60 - $95 / hr',
      duration: formData.duration.trim() || '3 - 6 Months',
      skills: formData.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description.trim(),
      deliverables: formData.deliverablesText.split('\n').map((d) => d.trim()).filter(Boolean),
      activeStatus: editingGig ? (editingGig.activeStatus !== undefined ? editingGig.activeStatus : true) : true,
    };

    try {
      if (editingGig) {
        await updateFreelance(editingGig.id || editingGig._id, payload);
        showToast({ title: 'Updated', message: `Freelance project "${formData.title}" updated.`, type: 'success' });
      } else {
        await addFreelance(payload);
        showToast({ title: 'Created', message: `Freelance project "${formData.title}" published!`, type: 'success' });
      }
      setIsModalOpen(false);
      await fetchFreelance?.();
    } catch (err) {
      showToast({ title: 'Save Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteGigId) {
      try {
        await deleteFreelance(deleteGigId);
        showToast({ title: 'Deleted', message: 'Freelance gig removed.', type: 'warning' });
        await fetchFreelance?.();
      } catch (err) {
        showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
      } finally {
        setDeleteGigId(null);
      }
    }
  };

  // Open proposals viewer
  const handleOpenProposals = async (gig) => {
    setSelectedGigForProposals(gig);
    setLoadingProposals(true);
    try {
      const data = await fetchProposals(gig.id || gig._id);
      setProposalsList(data);
    } catch (err) {
      showToast({ title: 'Error', message: 'Failed to load proposals', type: 'error' });
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleUpdateProposalStage = async (proposalId, nextStatus) => {
    try {
      await updateProposalStatus(proposalId, nextStatus);
      setProposalsList((prev) =>
        prev.map((p) => (p.id === proposalId || p._id === proposalId ? { ...p, status: nextStatus } : p))
      );
      showToast({ title: 'Status Updated', message: `Candidate marked as ${nextStatus}.`, type: 'info' });
    } catch (err) {
      showToast({ title: 'Update Failed', message: err.message, type: 'error' });
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
        <button
          onClick={() => handleOpenProposals(row)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all font-bold cursor-pointer"
          title="Click to view candidate proposals & S3 resumes"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>{row.bidsCount || 0} Bids</span>
        </button>
      ),
    },
    {
      header: 'Status',
      accessor: 'activeStatus',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => toggleFreelanceStatus(row.id || row._id)}
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
            onClick={() => setDeleteGigId(row.id || row._id)}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Freelance Gigs & Contractor Proposals</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage remote contracts, cloud engineering gigs, contractor proposals, and direct AWS S3 resumes
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Freelance Gig</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Gigs</span>
            <div className="text-xl font-bold text-slate-100">{freelance.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Laptop className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Active Gigs</span>
            <div className="text-xl font-bold text-emerald-400">
              {freelance.filter((f) => f.activeStatus).length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Contractor Bids</span>
            <div className="text-xl font-bold text-purple-400">
              {freelance.reduce((acc, f) => acc + (f.bidsCount || 0), 0)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Avg. Hourly Rate</span>
            <div className="text-xl font-bold text-cyan-300">$85 / hr</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={freelance}
        searchPlaceholder="Search freelance gigs by title, skills, or description..."
        pageSize={8}
      />

      {/* Add / Edit Gig Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGig ? 'Edit Freelance Project' : 'Post New Freelance Gig'}
        subtitle="Manage requirements, rate budget, and required contractor skills"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Cloud Infrastructure Architect"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Development">Development</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="Cloud">Cloud</option>
                <option value="DevOps">DevOps</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Data Engineering">Data Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Contract Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="FREELANCE · REMOTE"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Hourly Rate</label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="$75 - $110 / hr"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="3 - 6 Months"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={formData.skillsText}
              onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
              placeholder="AWS, Kubernetes, Terraform, Docker, Python"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Project Scope & Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail the technical responsibilities and goals of the contract..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Key Deliverables (One per line)</label>
            <textarea
              rows={3}
              value={formData.deliverablesText}
              onChange={(e) => setFormData({ ...formData, deliverablesText: e.target.value })}
              placeholder="Multi-region AWS landing zone setup&#10;Automated Terraform deployment pipelines&#10;SOC2 compliance hardening"
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

      {/* Contractor Bids & Proposals Modal */}
      <Modal
        isOpen={Boolean(selectedGigForProposals)}
        onClose={() => setSelectedGigForProposals(null)}
        title={selectedGigForProposals ? `Contractor Proposals: ${selectedGigForProposals.title}` : 'Proposals'}
        subtitle="Review applicant proposals, hourly bids, and direct S3 resumes"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 text-xs">
          {loadingProposals ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading contractor applications...</span>
            </div>
          ) : proposalsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No contractor proposals submitted yet.</p>
              <p className="text-[11px] text-slate-500">
                When developers apply on the public freelance portal, their bids and S3 resumes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {proposalsList.map((prop) => (
                <div
                  key={prop.id || prop._id}
                  className="p-4 rounded-2xl bg-[#070c1e] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{prop.fullName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-normal">
                          Bid: {prop.hourlyRate || 'Flexible'}
                        </span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <a href={`mailto:${prop.email}`} className="hover:text-cyan-400">
                            {prop.email}
                          </a>
                        </span>
                        {prop.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{prop.phone}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(prop.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Select */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Status:</span>
                      <select
                        value={prop.status}
                        onChange={(e) => handleUpdateProposalStage(prop.id || prop._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-semibold focus:border-cyan-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Review">Under Review</option>
                        <option value="Interview">Interview Scheduled</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>

                  {/* Proposal Note */}
                  {prop.experienceNote && (
                    <div className="bg-[#0b1329] p-3 rounded-xl border border-slate-800/60 text-slate-300 leading-relaxed text-[11px]">
                      <span className="font-semibold text-slate-400 block mb-1">Contractor Note:</span>
                      "{prop.experienceNote}"
                    </div>
                  )}

                  {/* Actions & Links */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      {prop.portfolioUrl && (
                        <a
                          href={prop.portfolioUrl.startsWith('http') ? prop.portfolioUrl : `https://${prop.portfolioUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Portfolio / GitHub</span>
                        </a>
                      )}
                    </div>

                    {prop.signedResumeUrl || prop.resumeUrl ? (
                      <a
                        href={prop.signedResumeUrl || prop.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Download Resume (S3)</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No resume file attached</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={() => setSelectedGigForProposals(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteGigId)}
        onClose={() => setDeleteGigId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Freelance Project"
        message="Are you sure you want to delete this freelance gig? All contractor bids submitted for this project will also be removed."
      />
    </div>
  );
}
