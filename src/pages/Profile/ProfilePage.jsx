import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Lock,
  Camera,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  Sparkles,
  ArrowRight,
  Shield,
  Link as LinkIcon,
  CloudUpload,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadFileToS3 } from '../../api/uploadApi';

export default function ProfilePage() {
  const { user, updateProfile, sendPasswordResetOtp, resetPassword } = useAuth();
  const { showToast } = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [avatarMode, setAvatarMode] = useState('s3'); // 's3' (Upload to S3) or 'url' (Direct Image URL)
  const [isUploadingS3, setIsUploadingS3] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password reset OTP states
  const [otpStep, setOtpStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP & New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const fileInputRef = useRef(null);

  // Sync state with logged-in user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      // If user avatar is already an HTTPS URL, use it
      if (user.avatar && !user.avatar.startsWith('data:')) {
        setAvatar(user.avatar);
        setImageUrlInput(user.avatar);
      } else if (!user.avatar) {
        setAvatar('');
        setImageUrlInput('');
      }
    }
  }, [user]);

  // Resend timer countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 1. Direct AWS S3 Upload via Presigned URL
  const handleFileSelectAndUploadToS3 = async (e) => {
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
      showToast({ title: 'Uploading...', message: 'Transferring file to AWS S3 bucket...', type: 'info' });
      
      const { publicUrl } = await uploadFileToS3(file, {
        module: 'avatars',
        category: user?.role || 'admin',
        email: email || user?.email || 'admin',
        candidateName: name || user?.name || 'admin-user',
      });
      
      setAvatar(publicUrl);
      setImageUrlInput(publicUrl);
      
      showToast({
        title: ' Upload Complete',
        message: 'Image uploaded! Click "Save Profile Changes" to apply.',
        type: 'success',
      });
    } catch (err) {
      console.error(' Upload Error:', err);
      showToast({
        title: 'Upload Failed',
        message: err.message || 'Failed to upload image . You can also paste a direct image URL.',
        type: 'error',
      });
    } finally {
      setIsUploadingS3(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Direct Image URL Apply
  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) {
      showToast({ title: 'URL Empty', message: 'Please enter an image URL.', type: 'error' });
      return;
    }

    if (imageUrlInput.startsWith('data:')) {
      showToast({ title: 'Base64 Not Allowed', message: 'Please provide a standard HTTPS image URL (e.g. https://...).', type: 'error' });
      return;
    }

    if (!imageUrlInput.startsWith('http://') && !imageUrlInput.startsWith('https://')) {
      showToast({ title: 'Invalid URL', message: 'URL must start with http:// or https://', type: 'error' });
      return;
    }

    setAvatar(imageUrlInput.trim());
    showToast({ title: 'Image URL Applied', message: 'Click "Save Profile Changes" to apply.', type: 'success' });
  };

  // 3. Remove Photo
  const handleRemoveAvatar = () => {
    setAvatar('');
    setImageUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast({ title: 'Photo Removed', message: 'Click "Save Profile Changes" to apply.', type: 'info' });
  };

  // Save profile changes (Name, Email, Avatar URL)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast({ title: 'Validation Error', message: 'Name and email are required.', type: 'error' });
      return;
    }

    // Disallow base64 strings to keep database clean
    if (avatar && avatar.startsWith('data:')) {
      showToast({
        title: 'Upload Required',
        message: 'Base64 images are not saved to database. Please upload to S3 or provide an image URL.',
        type: 'error',
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatar: avatar || null,
      });

      showToast({
        title: 'Profile Updated',
        message: res.message || 'Your administrator profile was updated successfully.',
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Failed to update profile details.',
        type: 'error',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Request OTP for password change
  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await sendPasswordResetOtp(email || user?.email);
      showToast({
        title: 'OTP Code Sent',
        message: res.message || `A 6-digit verification code was sent to ${email || user?.email}`,
        type: 'success',
      });
      setOtpStep(2);
      setResendTimer(60);
    } catch (err) {
      showToast({
        title: 'Request Failed',
        message: err.message || 'Failed to send OTP code. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Reset password using verified OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword || !confirmPassword) {
      showToast({ title: 'Validation Error', message: 'Please provide the OTP and your new password.', type: 'error' });
      return;
    }

    if (otp.trim().length < 6) {
      showToast({ title: 'Validation Error', message: 'Please enter the 6-digit OTP code.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ title: 'Validation Error', message: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ title: 'Validation Error', message: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await resetPassword(email || user?.email, otp.trim(), newPassword);
      showToast({
        title: 'Password Updated',
        message: res.message || 'Your password was successfully updated.',
        type: 'success',
      });
      // Reset form
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpStep(1);
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Invalid or expired OTP code.',
        type: 'error',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0b1429] via-[#091024] to-[#070d1e] p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Profile & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your credentials, profile picture, contact details, and OTP password recovery.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assigned Role</p>
            <p className="text-xs font-extrabold text-cyan-400 uppercase">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ────────── LEFT COLUMN: PROFILE & AVATAR EDITOR (7 cols) ────────── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#091024]/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>Personal Information</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Update your photo (AWS S3 / Image URL), display name, and login email address.
            </p>

            {/* Profile Picture Card with S3 Upload & Image URL options */}
            <div className="p-5 rounded-2xl bg-[#060b18] border border-slate-800/80 mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Circular Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-cyan-950 to-blue-950 flex items-center justify-center">
                    {isUploadingS3 ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-cyan-400">
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span className="text-[10px] font-bold">Uploading...</span>
                      </div>
                    ) : avatar ? (
                      <img src={avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold text-cyan-400">
                        {name ? name.charAt(0).toUpperCase() : 'A'}
                      </span>
                    )}
                  </div>

                  {/* Camera Click Overlay */}
                  {!isUploadingS3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-cyan-400 text-xs font-semibold transition-all cursor-pointer backdrop-blur-xs"
                      title="Upload to AWS S3"
                    >
                      <Camera className="w-5 h-5 mb-1" />
                      <span>Upload S3</span>
                    </button>
                  )}
                </div>

                {/* Avatar Controls & Mode Switcher */}
                <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-center sm:justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-200">Profile Picture</h3>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAvatarMode('s3')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          avatarMode === 's3'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('url')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          avatarMode === 'url'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Direct URL
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Upload directly to AWS S3 */}
                  {avatarMode === 's3' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">
                        Uploads file directly
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelectAndUploadToS3}
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingS3}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isUploadingS3 ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-3.5 h-3.5" />
                              <span>Choose & Upload</span>
                            </>
                          )}
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Paste Direct Image URL */
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">
                        Paste a permanent HTTPS image URL (e.g. Unsplash, CDN link).
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0b1329] border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:border-cyan-500 focus:outline-none transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyImageUrl}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          Apply URL
                        </button>
                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active URL indicator badge */}
                  {avatar && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 truncate">
                      <Check className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[280px]">Active URL: {avatar}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kaif Ansari"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Administrator Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admiresoftech.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Password reset codes and security notifications will be delivered to this email.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile || isUploadingS3}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider disabled:opacity-60"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ────────── RIGHT COLUMN: OTP PASSWORD RESET (5 cols) ────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#091024]/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <span>Password & Security</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Change your password securely using a 6-digit email OTP verification code.
            </p>

            {otpStep === 1 ? (
              /* Step 1: Request OTP */
              <div className="space-y-5 p-5 rounded-2xl bg-[#060b18] border border-slate-800">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-200">Email OTP Verification Required</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      For enhanced security, password changes require a 6-digit one-time passcode sent to your registered email:
                    </p>
                    <p className="text-xs font-mono font-bold text-cyan-300 break-all pt-1">
                      {email || user?.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: Enter OTP & New Password */
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between">
                  <span>Code sent to {email || user?.email}</span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resendTimer > 0 || isSendingOtp}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{resendTimer > 0 ? `${resendTimer}s` : 'Resend'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 482910"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all tracking-widest font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Update</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
                      setOtp('');
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Cloud Storage & Security Highlights */}
          <div className="p-5 rounded-3xl bg-[#091024]/60 border border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Storage & Security Highlights</span>
            </div>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>AWS S3 Presigned Uploads (Zero Base64 DB bloat)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Encrypted JWT Session Authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>10-Minute Expiring OTP Password Reset</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
