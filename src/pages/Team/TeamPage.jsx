import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Link2,
  Sparkles,
  Star,
  Building,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

// Brand icon SVGs
const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function TeamPage() {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useAdminData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteMemberId, setDeleteMemberId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Leadership',
    experience: '5+ Years Exp',
    bio: '',
    specialtiesText: '',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    linkedin: '',
    github: '',
    twitter: '',
    isFeatured: true,
  });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      department: 'Leadership',
      experience: '5+ Years Exp',
      bio: '',
      specialtiesText: '',
      avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: '',
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mem) => {
    setEditingMember(mem);
    setFormData({
      name: mem.name || '',
      role: mem.role || '',
      department: mem.department || 'Leadership',
      experience: mem.experience || '5+ Years Exp',
      bio: mem.bio || '',
      specialtiesText: Array.isArray(mem.specialties) ? mem.specialties.join(', ') : '',
      avatarImg: mem.avatarImg || '',
      linkedin: mem.social?.linkedin || '',
      github: mem.social?.github || '',
      twitter: mem.social?.twitter || '',
      isFeatured: Boolean(mem.isFeatured),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      showToast({ title: 'Error', message: 'Name and Role are required', type: 'error' });
      return;
    }

    const payload = {
      name: formData.name,
      role: formData.role,
      department: formData.department,
      experience: formData.experience,
      bio: formData.bio,
      specialties: formData.specialtiesText.split(',').map((s) => s.trim()).filter(Boolean),
      avatarImg: formData.avatarImg,
      social: {
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
      },
      isFeatured: formData.isFeatured,
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, payload);
      showToast({ title: 'Updated', message: `${formData.name}'s profile updated.`, type: 'success' });
    } else {
      addTeamMember(payload);
      showToast({ title: 'Created', message: `Added ${formData.name} to team directory.`, type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteMemberId) {
      deleteTeamMember(deleteMemberId);
      setDeleteMemberId(null);
      showToast({ title: 'Removed', message: 'Team member profile removed.', type: 'warning' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Team & Leadership Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage executive profiles, engineering leads, bios, and social handles
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((mem) => (
          <div
            key={mem.id}
            className="group relative rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4"
          >
            {/* Top Avatar & Actions */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={mem.avatarImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={mem.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/15 shrink-0"
                />
                <div className="space-y-0.5 truncate">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                    {mem.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate">{mem.role}</p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Badge label={mem.department} size="xs" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(mem)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteMemberId(mem.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {mem.bio || 'Architecting software solutions at Admire Softech.'}
            </p>

            {/* Specialties */}
            {mem.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
                {mem.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#0e1738] border border-slate-700/60 text-slate-300 font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Socials */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">{mem.experience}</span>
              <div className="flex items-center gap-2 text-slate-400">
                {mem.social?.linkedin && (
                  <a
                    href={mem.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {mem.social?.github && (
                  <a
                    href={mem.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {mem.social?.twitter && (
                  <a
                    href={mem.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        subtitle="Manage leadership profile details and social links"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Allen"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Role / Title *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Founder & Chief Executive Officer"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option>Leadership</option>
                <option>AI & Engineering</option>
                <option>Infrastructure</option>
                <option>Design</option>
                <option>Engineering</option>
                <option>Security</option>
                <option>Data</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="8+ Years Exp"
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Avatar Image URL</label>
            <input
              type="text"
              value={formData.avatarImg}
              onChange={(e) => setFormData({ ...formData, avatarImg: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Short bio description..."
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Specialties (Comma-separated)</label>
            <input
              type="text"
              value={formData.specialtiesText}
              onChange={(e) => setFormData({ ...formData, specialtiesText: e.target.value })}
              placeholder="Enterprise Architecture, Cloud Strategy, Product Leadership"
              className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">LinkedIn URL</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">GitHub URL</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Twitter / X URL</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
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
              {editingMember ? 'Save Profile' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteMemberId)}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Profile"
        message="Are you sure you want to remove this team member?"
      />
    </div>
  );
}
