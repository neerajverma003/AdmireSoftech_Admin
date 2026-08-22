import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Building,
  Star,
  ExternalLink,
  MapPin,
  DollarSign,
  Download,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function CareersPage() {
  const {
    jobs,
    addJob,
    updateJob,
    toggleJobStatus,
    deleteJob,
    applicants,
    addApplicant,
    updateApplicant,
    updateApplicantStage,
    deleteApplicant,
  } = useAdminData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applicants'

  // Job Modal States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);

  // Applicant Modal States
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [deleteApplicantId, setDeleteApplicantId] = useState(null);
  const [applicantNotes, setApplicantNotes] = useState('');

  // Job Form Data
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    experience: '3+ Years',
    salary: '$80,000 - $110,000 / yr',
    description: '',
    responsibilitiesText: '',
    requirementsText: '',
  });

  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      type: 'Full-time',
      experience: '3+ Years',
      salary: '$80,000 - $110,000 / yr',
      description: '',
      responsibilitiesText: '',
      requirementsText: '',
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || 'Remote',
      type: job.type || 'Full-time',
      experience: job.experience || '3+ Years',
      salary: job.salary || '$80,000 - $110,000 / yr',
      description: job.description || '',
      responsibilitiesText: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requirementsText: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobFormData.title?.trim()) {
      showToast({ title: 'Error', message: 'Job title is required', type: 'error' });
      return;
    }

    const payload = {
      title: jobFormData.title.trim(),
      department: jobFormData.department,
      location: jobFormData.location,
      type: jobFormData.type,
      experience: jobFormData.experience,
      salary: jobFormData.salary,
      description: jobFormData.description,
      responsibilities: jobFormData.responsibilitiesText.split('\n').filter((l) => l.trim() !== ''),
      requirements: jobFormData.requirementsText.split('\n').filter((l) => l.trim() !== ''),
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id || editingJob._id, payload);
        showToast({ title: 'Job Updated', message: `${jobFormData.title} updated.`, type: 'success' });
      } else {
        await addJob(payload);
        showToast({ title: 'Job Created', message: `${jobFormData.title} published.`, type: 'success' });
      }
      setIsJobModalOpen(false);
    } catch (err) {
      showToast({ title: 'Error', message: err.message || 'Failed to save job opening', type: 'error' });
    }
  };

  const handleDeleteJobConfirm = async () => {
    if (deleteJobId) {
      try {
        await deleteJob(deleteJobId);
        setDeleteJobId(null);
        showToast({ title: 'Job Deleted', message: 'Job opening removed.', type: 'warning' });
      } catch (err) {
        showToast({ title: 'Error', message: err.message || 'Failed to delete job', type: 'error' });
      }
    }
  };

  const handleOpenApplicantDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setApplicantNotes(applicant.notes || '');
    setIsApplicantModalOpen(true);
  };

  const handleSaveApplicantNotes = async () => {
    if (!selectedApplicant) return;
    try {
      await updateApplicant(selectedApplicant.id || selectedApplicant._id, { notes: applicantNotes });
      setSelectedApplicant((prev) => ({ ...prev, notes: applicantNotes }));
      showToast({ title: 'Notes Saved', message: 'Candidate notes updated in database.', type: 'success' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message || 'Failed to save notes', type: 'error' });
    }
  };

  const handleApplicantStageChange = async (stage) => {
    if (!selectedApplicant) return;
    try {
      await updateApplicantStage(selectedApplicant.id || selectedApplicant._id, stage);
      setSelectedApplicant((prev) => ({ ...prev, stage }));
      showToast({ title: 'Stage Updated', message: `Moved candidate to "${stage}" stage.`, type: 'info' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message || 'Failed to update stage', type: 'error' });
    }
  };

  const handleApplicantRatingChange = async (rating) => {
    if (!selectedApplicant) return;
    try {
      await updateApplicant(selectedApplicant.id || selectedApplicant._id, { rating });
      setSelectedApplicant((prev) => ({ ...prev, rating }));
      showToast({ title: 'Rating Updated', message: `Candidate rated ${rating}/5 stars.`, type: 'success' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message || 'Failed to update rating', type: 'error' });
    }
  };

  const handleDeleteApplicantConfirm = async () => {
    if (deleteApplicantId) {
      try {
        await deleteApplicant(deleteApplicantId);
        if ((selectedApplicant?.id || selectedApplicant?._id) === deleteApplicantId) {
          setIsApplicantModalOpen(false);
          setSelectedApplicant(null);
        }
        setDeleteApplicantId(null);
        showToast({ title: 'Applicant Removed', message: 'Candidate removed from ATS.', type: 'warning' });
      } catch (err) {
        showToast({ title: 'Error', message: err.message || 'Failed to remove applicant', type: 'error' });
      }
    }
  };

  // Columns for Jobs Table
  const jobColumns = [
    {
      header: 'Job Title & Role',
      accessor: 'title',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-100">{row.title}</span>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-cyan-400" /> {row.location}</span>
            <span>·</span>
            <span>{row.type}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
      cell: (row) => <Badge label={row.department} variant="purple" size="xs" />,
    },
    {
      header: 'Experience',
      accessor: 'experience',
      sortable: true,
      cell: (row) => <span className="font-medium text-slate-300">{row.experience}</span>,
    },
    {
      header: 'Compensation',
      accessor: 'salary',
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-400">{row.salary}</span>,
    },
    {
      header: 'Applicants',
      accessor: 'applicantsCount',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => setActiveTab('applicants')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 font-bold text-xs cursor-pointer transition-colors"
          title="View Applicants"
        >
          <Users className="w-3 h-3" />
          <span>{row.applicantsCount || 0}</span>
        </button>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => toggleJobStatus(row.id || row._id)}
          className="cursor-pointer"
          title="Click to toggle Active/Paused"
        >
          <Badge label={row.status} size="xs" dot={true} />
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEditJob(row)}
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors cursor-pointer"
            title="Edit Opening"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteJobId(row.id || row._id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Opening"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Columns for Applicants (ATS) Table
  const applicantColumns = [
    {
      header: 'Candidate Name',
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
      header: 'Applied Position',
      accessor: 'jobTitle',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-slate-200 text-xs">{row.jobTitle}</span>
      ),
    },
    {
      header: 'Experience',
      accessor: 'experience',
      sortable: true,
      cell: (row) => <span className="text-slate-300 font-medium">{row.experience || 'N/A'}</span>,
    },
    {
      header: 'Hiring Stage',
      accessor: 'stage',
      sortable: true,
      cell: (row) => <Badge label={row.stage} size="xs" />,
    },
    {
      header: 'Resume (S3)',
      cell: (row) => {
        const resumeUrl = row.signedResumeUrl || row.resumeUrl;
        if (!resumeUrl) {
          return <span className="text-[11px] text-slate-500">No Resume</span>;
        }
        return (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>PDF (S3)</span>
          </a>
        );
      },
    },
    {
      header: 'Rating',
      accessor: 'rating',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-0.5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < (row.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Date Applied',
      accessor: 'appliedAt',
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenApplicantDetail(row)}
            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
            title="Inspect Candidate"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteApplicantId(row.id || row._id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Remove Applicant"
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
          <h2 className="text-xl font-bold text-slate-100">Careers & ATS Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage full-time job openings and track candidate applications in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'jobs' && (
            <button
              onClick={handleOpenCreateJob}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job Opening</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Openings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'applicants'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Candidate Applications ({applicants.length})</span>
        </button>
      </div>

      {/* Table Content */}
      {activeTab === 'jobs' ? (
        <DataTable
          columns={jobColumns}
          data={jobs}
          searchPlaceholder="Search job openings by title, department, or location..."
        />
      ) : (
        <DataTable
          columns={applicantColumns}
          data={applicants}
          searchPlaceholder="Search candidate name, email, or applied position..."
        />
      )}

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editingJob ? `Edit Job Opening: ${editingJob.title}` : 'Post New Job Opening'}
        subtitle="This opening will appear immediately on the public careers portal"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Job Title *</label>
              <input
                type="text"
                required
                value={jobFormData.title}
                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Department *</label>
              <select
                value={jobFormData.department}
                onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Infrastructure">Infrastructure & Cloud</option>
                <option value="Design">UI/UX Design</option>
                <option value="Product">Product Management</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Location</label>
              <input
                type="text"
                value={jobFormData.location}
                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                placeholder="Remote / Hybrid"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Job Type</label>
              <input
                type="text"
                value={jobFormData.type}
                onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                placeholder="Full-time / Contract"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Experience</label>
              <input
                type="text"
                value={jobFormData.experience}
                onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                placeholder="4+ Years"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Compensation / Salary Range</label>
            <input
              type="text"
              value={jobFormData.salary}
              onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
              placeholder="$80,000 - $110,000 / yr"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Job Overview Description</label>
            <textarea
              rows={2}
              value={jobFormData.description}
              onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
              placeholder="Brief summary of what the role entails..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Key Responsibilities (1 per line)</label>
            <textarea
              rows={3}
              value={jobFormData.responsibilitiesText}
              onChange={(e) => setJobFormData({ ...jobFormData, responsibilitiesText: e.target.value })}
              placeholder="Deploy microservices on AWS&#10;Lead sprint planning meetings"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Key Requirements (1 per line)</label>
            <textarea
              rows={3}
              value={jobFormData.requirementsText}
              onChange={(e) => setJobFormData({ ...jobFormData, requirementsText: e.target.value })}
              placeholder="4+ years experience with React 19&#10;Expert knowledge of PostgreSQL"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsJobModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {editingJob ? 'Save Changes' : 'Publish Opening'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate ATS Inspector Modal */}
      {selectedApplicant && (
        <Modal
          isOpen={isApplicantModalOpen}
          onClose={() => setIsApplicantModalOpen(false)}
          title={`Candidate Profile: ${selectedApplicant.fullName}`}
          subtitle={`Applied for ${selectedApplicant.jobTitle || 'Career Opening'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Stage Pipeline Stepper */}
            <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Hiring Pipeline Stage:</span>
                <Badge label={selectedApplicant.stage || 'Applied'} size="sm" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Applied',
                  'Under Review',
                  'Shortlisted',
                  'Interview Scheduled',
                  'Offer Extended',
                  'Hired',
                  'Rejected',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleApplicantStageChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedApplicant.stage === st
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p><strong className="text-slate-400">Email:</strong> <a href={`mailto:${selectedApplicant.email}`} className="text-cyan-400 hover:underline">{selectedApplicant.email}</a></p>
                  <p><strong className="text-slate-400">Phone:</strong> {selectedApplicant.phone || 'N/A'}</p>
                  <p><strong className="text-slate-400">Experience:</strong> {selectedApplicant.experience || 'N/A'}</p>
                  <p><strong className="text-slate-400">Current Company:</strong> {selectedApplicant.currentCompany || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                  Resume & Portfolio
                </h4>
                
                {/* Resume Download / View Button */}
                {(selectedApplicant.signedResumeUrl || selectedApplicant.resumeUrl) ? (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-slate-200">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate font-semibold text-xs text-white">
                        {selectedApplicant.resumeFileName || 'Candidate_Resume.pdf'}
                      </span>
                    </div>
                    <a
                      href={selectedApplicant.signedResumeUrl || selectedApplicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / View Resume (S3)</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">No resume file attached</p>
                )}

                {selectedApplicant.portfolioUrl && (
                  <a
                    href={selectedApplicant.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold text-xs pt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Portfolio / GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Candidate Cover Note */}
            {selectedApplicant.coverNote && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                  Candidate Note / Highlights
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed italic">
                  "{selectedApplicant.coverNote}"
                </p>
              </div>
            )}

            {/* Star Rating Selection */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200">Candidate Rating</h4>
                <span className="text-amber-400 font-bold">{selectedApplicant.rating || 4} / 5 Stars</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => handleApplicantRatingChange(starVal)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        starVal <= (selectedApplicant.rating || 4)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200">Recruiter / Interviewer Notes</h4>
                <button
                  onClick={handleSaveApplicantNotes}
                  className="px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
              <textarea
                rows={3}
                value={applicantNotes}
                onChange={(e) => setApplicantNotes(e.target.value)}
                placeholder="Log candidate evaluation, technical scoring, or interview feedback..."
                className="w-full p-3 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteApplicantId(selectedApplicant.id || selectedApplicant._id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Applicant</span>
              </button>

              <a
                href={`mailto:${selectedApplicant.email}?subject=Interview Invitation with Admire Softech for ${selectedApplicant.jobTitle || 'Role'}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Candidate</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Job Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteJobId)}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleDeleteJobConfirm}
        title="Delete Job Opening"
        message="Are you sure you want to delete this opening? It will be removed from the public careers page."
      />

      {/* Delete Applicant Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteApplicantId)}
        onClose={() => setDeleteApplicantId(null)}
        onConfirm={handleDeleteApplicantConfirm}
        title="Remove Applicant"
        message="Are you sure you want to remove this applicant from the ATS pipeline?"
      />
    </div>
  );
}
