import React, { useState } from 'react';
import {
  FileSpreadsheet,
  DollarSign,
  Calendar,
  Clock,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Mail,
  Phone,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function QuotesPage() {
  const { quotes, fetchQuotes, addQuote, updateQuote, deleteQuote } = useAdminData();
  const { showToast } = useToast();

  React.useEffect(() => {
    fetchQuotes?.();
  }, [fetchQuotes]);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Manual Quote Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Enterprise Cloud Infrastructure',
    projectScope: '',
    estimatedBudget: '$20,000 - $35,000',
    timeline: '1 - 2 Months',
    urgency: 'Medium',
    status: 'Pending Review',
  });

  const handleOpenDetail = (quote) => {
    setSelectedQuote(quote);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (status) => {
    if (!selectedQuote) return;
    updateQuote(selectedQuote.id, { status });
    setSelectedQuote((prev) => ({ ...prev, status }));
    showToast({
      title: 'Quote Updated',
      message: `Status updated to "${status}"`,
      type: 'info',
    });
  };

  const handleCreateQuote = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast({
        title: 'Missing Fields',
        message: 'Name and Email are required.',
        type: 'error',
      });
      return;
    }

    addQuote(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: 'Enterprise Cloud Infrastructure',
      projectScope: '',
      estimatedBudget: '$20,000 - $35,000',
      timeline: '1 - 2 Months',
      urgency: 'Medium',
      status: 'Pending Review',
    });

    showToast({
      title: 'Quote Created',
      message: 'New project estimation added.',
      type: 'success',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteQuote(deleteTargetId);
      if (selectedQuote?.id === deleteTargetId) {
        setIsDetailModalOpen(false);
        setSelectedQuote(null);
      }
      setDeleteTargetId(null);
      showToast({
        title: 'Quote Removed',
        message: 'The quote entry has been deleted.',
        type: 'warning',
      });
    }
  };

  const columns = [
    {
      header: 'Client & Contact',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-100">{row.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-cyan-400" />
            <span>{row.email}</span>
          </div>
          {row.phone && (
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <Phone className="w-2.5 h-2.5" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Service / Scope',
      accessor: 'serviceType',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-[220px]">
          <div className="font-semibold text-slate-200 truncate">{row.serviceType}</div>
          <div className="text-[11px] text-slate-400 truncate">{row.projectScope}</div>
        </div>
      ),
    },
    {
      header: 'Budget Estimation',
      accessor: 'estimatedBudget',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-amber-400">{row.estimatedBudget}</span>
      ),
    },
    {
      header: 'Timeline',
      accessor: 'timeline',
      sortable: true,
      cell: (row) => <span className="text-slate-300">{row.timeline}</span>,
    },
    {
      header: 'Urgency',
      accessor: 'urgency',
      sortable: true,
      cell: (row) => <Badge label={row.urgency} size="xs" />,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <Badge label={row.status} size="xs" />,
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(row)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title="Review Quote"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Quote"
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
        title="Project Estimations & Quotes"
        subtitle="Review prospective project estimates and budget submissions"
        columns={columns}
        data={quotes}
        searchPlaceholder="Search by name, email, or service..."
        filterOptions={[
          {
            key: 'status',
            label: 'All Statuses',
            options: ['Pending Review', 'Estimate Sent', 'Approved', 'Declined'],
          },
          {
            key: 'urgency',
            label: 'All Urgencies',
            options: ['High', 'Urgent', 'Medium', 'Low'],
          },
        ]}
        actionButton={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quote</span>
          </button>
        }
      />

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Quote Estimation: ${selectedQuote.serviceType}`}
          subtitle={`Submitted by ${selectedQuote.name} on ${new Date(selectedQuote.submittedAt).toLocaleString()}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0e1738] border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <Badge label={selectedQuote.status} size="sm" />
              </div>
              <div className="flex items-center gap-1.5">
                {['Pending Review', 'Estimate Sent', 'Approved', 'Declined'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedQuote.status === st
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                  Client Contact
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p><strong className="text-slate-400">Name:</strong> {selectedQuote.name}</p>
                  <p><strong className="text-slate-400">Email:</strong> {selectedQuote.email}</p>
                  <p><strong className="text-slate-400">Phone:</strong> {selectedQuote.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                  Budget & Timeline
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p><strong className="text-slate-400">Target Budget:</strong> <span className="font-bold text-amber-400">{selectedQuote.estimatedBudget}</span></p>
                  <p><strong className="text-slate-400">Delivery Timeline:</strong> {selectedQuote.timeline}</p>
                  <p><strong className="text-slate-400">Priority:</strong> {selectedQuote.urgency}</p>
                </div>
              </div>
            </div>

            {/* Project Scope Description */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200">Full Project Scope</h4>
              <p className="p-3 rounded-lg bg-[#070c1e] text-slate-300 leading-relaxed border border-slate-800">
                {selectedQuote.projectScope || 'No detailed scope text submitted.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteTargetId(selectedQuote.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Quote</span>
              </button>

              <a
                href={`mailto:${selectedQuote.email}?subject=Project Proposal & Estimate for ${selectedQuote.serviceType}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Proposal PDF / Email</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Quote Creator Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Project Estimate"
        subtitle="Log an estimate requested via phone or meeting"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Client Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Client Name"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@company.com"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service Type</label>
              <input
                type="text"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="e.g. Cloud Infrastructure Architecture"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Budget Range</label>
              <select
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option>$10,000 - $25,000</option>
                <option>$25,000 - $50,000</option>
                <option>$50,000 - $100,000</option>
                <option>$100,000+</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Project Scope</label>
            <textarea
              rows={3}
              value={formData.projectScope}
              onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
              placeholder="Scope details and requirements..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Save Quote
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Estimate"
        message="Are you sure you want to remove this quote calculation?"
      />
    </div>
  );
}
