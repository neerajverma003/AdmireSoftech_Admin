import React, { useState } from 'react';
import {
  Inbox,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Trash2,
  Plus,
  Send,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function InquiriesPage() {
  const { inquiries, addInquiry, updateInquiry, updateInquiryStatus, deleteInquiry } = useAdminData();
  const { showToast } = useToast();

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form states for manual lead creation
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    service: 'Cloud Services & DevOps',
    budget: '$25,000 - $50,000',
    timeline: '1-3 Months',
    priority: 'Medium',
    message: '',
  });

  // Notes state for selected inquiry
  const [currentNotes, setCurrentNotes] = useState('');

  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setCurrentNotes(inquiry.notes || '');
    setIsDetailModalOpen(true);
  };

  const handleSaveNotes = () => {
    if (!selectedInquiry) return;
    updateInquiry(selectedInquiry.id, { notes: currentNotes });
    setSelectedInquiry((prev) => ({ ...prev, notes: currentNotes }));
    showToast({
      title: 'Notes Saved',
      message: 'Internal lead notes have been updated.',
      type: 'success',
    });
  };

  const handleStatusChange = (status) => {
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, status);
    setSelectedInquiry((prev) => ({ ...prev, status }));
    showToast({
      title: 'Status Updated',
      message: `Lead status changed to "${status}"`,
      type: 'info',
    });
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      showToast({
        title: 'Validation Error',
        message: 'Name and Email are required fields.',
        type: 'error',
      });
      return;
    }

    addInquiry(formData);
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      service: 'Cloud Services & DevOps',
      budget: '$25,000 - $50,000',
      timeline: '1-3 Months',
      priority: 'Medium',
      message: '',
    });

    showToast({
      title: 'Lead Created',
      message: 'New manual contact inquiry added to pipeline.',
      type: 'success',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteInquiry(deleteTargetId);
      if (selectedInquiry?.id === deleteTargetId) {
        setIsDetailModalOpen(false);
        setSelectedInquiry(null);
      }
      setDeleteTargetId(null);
      showToast({
        title: 'Lead Deleted',
        message: 'The inquiry record has been removed.',
        type: 'warning',
      });
    }
  };

  const columns = [
    {
      header: 'Client Name & Contact',
      accessor: 'fullName',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-100">{row.fullName}</div>
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
      header: 'Company',
      accessor: 'company',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-slate-300">
          {row.company || <span className="text-slate-600 italic">Individual / Startup</span>}
        </span>
      ),
    },
    {
      header: 'Service Requested',
      accessor: 'service',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-cyan-300 font-medium">{row.service}</span>
      ),
    },
    {
      header: 'Budget',
      accessor: 'budget',
      sortable: true,
      cell: (row) => <span className="font-semibold text-emerald-400">{row.budget}</span>,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: (row) => <Badge label={row.priority} size="xs" />,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <Badge label={row.status} size="xs" />,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(row)}
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors cursor-pointer"
            title="View Lead Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <DataTable
        title="Contact Leads CRM"
        subtitle="Manage inbound inquiries and enterprise lead opportunities"
        columns={columns}
        data={inquiries}
        searchPlaceholder="Search by name, email, company, or service..."
        filterOptions={[
          {
            key: 'status',
            label: 'All Statuses',
            options: ['New', 'In Discussion', 'Contacted', 'Converted', 'Closed'],
          },
          {
            key: 'priority',
            label: 'All Priorities',
            options: ['High', 'Urgent', 'Medium', 'Low'],
          },
        ]}
        actionButton={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Lead</span>
          </button>
        }
      />

      {/* Slide-over Detail Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Lead Details: ${selectedInquiry.fullName}`}
          subtitle={`Submitted on ${new Date(selectedInquiry.createdAt).toLocaleString()}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0e1738] border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Status:</span>
                <Badge label={selectedInquiry.status} size="sm" />
                <Badge label={selectedInquiry.priority} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 mr-1">Move to:</span>
                {['New', 'In Discussion', 'Contacted', 'Converted', 'Closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedInquiry.status === st
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] text-cyan-400">
                  Client Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Full Name:</span>
                    <span className="font-semibold text-slate-200">{selectedInquiry.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Email:</span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Phone:</span>
                    <span className="text-slate-300">{selectedInquiry.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Company:</span>
                    <span className="text-slate-300">{selectedInquiry.company || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] text-cyan-400">
                  Project Scope
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Service:</span>
                    <span className="font-semibold text-slate-200">{selectedInquiry.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Estimated Budget:</span>
                    <span className="font-semibold text-emerald-400">{selectedInquiry.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-24">Timeline:</span>
                    <span className="text-slate-300">{selectedInquiry.timeline}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Inquiry Message
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-[#070c1e] p-3.5 rounded-lg border border-slate-800/60">
                {selectedInquiry.message || 'No description provided.'}
              </p>
            </div>

            {/* Internal Team Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200 text-xs">Internal Lead Notes</h4>
                <button
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Add meeting notes, call summaries, or next action items here..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl bg-[#070c1e] border border-slate-700/80 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteTargetId(selectedInquiry.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding Your Inquiry with Admire Softech`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email Reply</span>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inbound Lead Manually"
        subtitle="Record an offline lead or phone inquiry"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>Cloud Services & DevOps</option>
                <option>Artificial Intelligence & ML</option>
                <option>Full-Stack Web & Mobile Development</option>
                <option>Cybersecurity & Compliance</option>
                <option>Data Engineering & Analytics</option>
                <option>Product Strategy & UI/UX Design</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Budget Range</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>$10,000 - $25,000</option>
                <option>$25,000 - $50,000</option>
                <option>$50,000 - $100,000</option>
                <option>$100,000+</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>High</option>
                <option>Urgent</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Project Requirements</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Detailed description of client needs..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
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
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Create Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Inquiry Record"
        message="Are you sure you want to permanently delete this inquiry from your CRM pipeline?"
      />
    </div>
  );
}
