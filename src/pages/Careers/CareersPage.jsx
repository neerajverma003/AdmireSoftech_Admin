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

  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!jobFormData.title) {
      showToast({ title: 'Error', message: 'Job title is required', type: 'error' });
      return;
    }

    const payload = {
      title: jobFormData.title,
      department: jobFormData.department,
      location: jobFormData.location,
      type: jobFormData.type,
      experience: jobFormData.experience,
      salary: jobFormData.salary,
      description: jobFormData.description,
      responsibilities: jobFormData.responsibilitiesText.split('\n').filter((l) => l.trim() !== ''),
      requirements: jobFormData.requirementsText.split('\n').filter((l) => l.trim() !== ''),
    };

    if (editingJob) {
      updateJob(editingJob.id, payload);
      showToast({ title: 'Job Updated', message: `${jobFormData.title} updated.`, type: 'success' });
    } else {
      addJob(payload);
      showToast({ title: 'Job Created', message: `${jobFormData.title} published.`, type: 'success' });
    }

    setIsJobModalOpen(false);
  };

  const handleDeleteJobConfirm = () => {
    if (deleteJobId) {
      deleteJob(deleteJobId);
      setDeleteJobId(null);
      showToast({ title: 'Job Deleted', message: 'Job opening removed.', type: 'warning' });
    }
  };

  const handleOpenApplicantDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setApplicantNotes(applicant.notes || '');
    setIsApplicantModalOpen(true);
  };

  const handleSaveApplicantNotes = () => {
    if (!selectedApplicant) return;
    updateApplicant(selectedApplicant.id, { notes: applicantNotes });
    setSelectedApplicant((prev) => ({ ...prev, notes: applicantNotes }));
    showToast({ title: 'Notes Saved', message: 'Candidate notes updated.', type: 'success' });
  };

  const handleApplicantStageChange = (stage) => {
    if (!selectedApplicant) return;
    updateApplicantStage(selectedApplicant.id, stage);
    setSelectedApplicant((prev) => ({ ...prev, stage }));
    showToast({ title: 'Stage Updated', message: `Moved to "${stage}" stage.`, type: 'info' });
  };

  const handleDeleteApplicantConfirm = () => {
    if (deleteApplicantId) {
      deleteApplicant(deleteApplicantId);
      if (selectedApplicant?.id === deleteApplicantId) {
        setIsApplicantModalOpen(false);
        setSelectedApplicant(null);
      }
      setDeleteApplicantId(null);
      showToast({ title: 'Applicant Removed', message: 'Candidate removed from ATS.', type: 'warning' });
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold text-xs">
          <Users className="w-3 h-3" />
          {row.applicantsCount || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => toggleJobStatus(row.id)}
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
            onClick={() => setDeleteJobId(row.id)}
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
      cell: (row) => <span className="text-slate-300 font-medium">{row.experience}</span>,
    },
    {
      header: 'Hiring Stage',
      accessor: 'stage',
      sortable: true,
      cell: (row) => <Badge label={row.stage} size="xs" />,
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
          {new Date(row.appliedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenApplicantDetail(row)}
            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors cursor-pointer"
            title="Inspect Candidate"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteApplicantId(row.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Applicant"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Openings ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'applicants'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-extrabold'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate ATS Pipeline ({applicants.length})</span>
          </button>
        </div>

        {activeTab === 'jobs' && (
          <button
            onClick={handleOpenCreateJob}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Opening</span>
          </button>
        )}
      </div>

      {/* View 1: Job Openings Table */}
      {activeTab === 'jobs' && (
        <DataTable
          title="Active Job Openings"
          subtitle="Publish and update positions appearing on the Careers page"
          columns={jobColumns}
          data={jobs}
          searchPlaceholder="Search jobs by title, department, or location..."
          filterOptions={[
            {
              key: 'department',
              label: 'All Departments',
              options: ['Engineering', 'Artificial Intelligence', 'Infrastructure', 'Design', 'Data'],
            },
            {
              key: 'status',
              label: 'All Statuses',
              options: ['Active', 'Paused'],
            },
          ]}
        />
      )}

      {/* View 2: ATS Candidate Applications Table */}
      {activeTab === 'applicants' && (
        <DataTable
          title="Applicant Tracking System (ATS)"
          subtitle="Screen candidate applications, review resumes, and manage hiring stages"
          columns={applicantColumns}
          data={applicants}
          searchPlaceholder="Search candidates by name, email, or role..."
          filterOptions={[
            {
              key: 'stage',
              label: 'All Hiring Stages',
              options: [
                'Under Review',
                'Shortlisted',
                'Interview Scheduled',
                'Offer Extended',
                'Hired',
                'Rejected',
              ],
            },
          ]}
        />
      )}

      {/* Job Create/Edit Modal */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
        subtitle="Manage job specifications and qualifications"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-slate-300 font-semibold">Department</label>
              <select
                value={jobFormData.department}
                onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option>Engineering</option>
                <option>Artificial Intelligence</option>
                <option>Infrastructure</option>
                <option>Design</option>
                <option>Data</option>
                <option>Security</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="text-slate-300 font-semibold">Experience</label>
              <input
                type="text"
                value={jobFormData.experience}
                onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                placeholder="4+ Years"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Salary Range</label>
              <input
                type="text"
                value={jobFormData.salary}
                onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                placeholder="$80k - $120k / yr"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
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
          subtitle={`Applied for ${selectedApplicant.jobTitle}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Stage Pipeline Stepper */}
            <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Hiring Pipeline Stage:</span>
                <Badge label={selectedApplicant.stage} size="sm" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
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
                  <p><strong className="text-slate-400">Experience:</strong> {selectedApplicant.experience}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                  Resume & Portfolio
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate text-slate-200 font-medium">
                      {selectedApplicant.resumeFileName || 'Resume_Document.pdf'}
                    </span>
                  </div>
                  {selectedApplicant.portfolioUrl && (
                    <a
                      href={selectedApplicant.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Portfolio / GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Notes & Rating */}
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
                onClick={() => setDeleteApplicantId(selectedApplicant.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Applicant</span>
              </button>

              <a
                href={`mailto:${selectedApplicant.email}?subject=Interview Invitation with Admire Softech for ${selectedApplicant.jobTitle}`}
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
        message="Are you sure you want to remove this candidate from your hiring ATS pipeline?"
      />
    </div>
  );
}
