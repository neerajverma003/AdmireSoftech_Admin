import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Mail,
  User,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Code,
  Eraser,
  X,
  File,
  AlertCircle,
  ExternalLink,
  Plus,
  RotateCcw,
  RotateCw,
  ChevronDown,
  Minus,
  Strikethrough,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table,
  Maximize2,
  Download,
  MoreVertical,
  Loader2,
  Settings,
  Key,
  ShieldCheck,
  Star,
  Lock,
  EyeOff,
  Layout,
  Layers,
} from 'lucide-react';
import {
  fetchOutreachHistory,
  sendOutreachEmail,
  deleteOutreachLog,
  fetchSenderAccounts,
  createSenderAccount,
  deleteSenderAccount,
  setDefaultSenderAccount,
} from '../../api/outreachApi';
import { uploadFileToS3 } from '../../api/uploadApi';
import { convertImageToWebP } from '../../utils/imageConverter';
import { useToast } from '../../context/ToastContext';

export default function OutreachPage() {
  const { showToast } = useToast();

  // Active Tab: 'compose' or 'history'
  const [activeTab, setActiveTab] = useState('compose');

  // Multi-Sender Accounts state
  const [senderAccounts, setSenderAccounts] = useState([]);
  const [defaultSenderEmail, setDefaultSenderEmail] = useState('');
  const [customFromEmail, setCustomFromEmail] = useState('');
  const [fromName, setFromName] = useState('Admire Softech');

  // Manage Senders Modal state
  const [isManageSendersOpen, setIsManageSendersOpen] = useState(false);
  const [isAddingSender, setIsAddingSender] = useState(false);
  const [isVerifyingSender, setIsVerifyingSender] = useState(false);
  const [showSenderPassword, setShowSenderPassword] = useState(false);
  const [newSenderForm, setNewSenderForm] = useState({
    email: '',
    password: '',
    label: '',
    service: 'gmail',
    isDefault: false,
  });

  // Recipient fields
  const [toInput, setToInput] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [subject, setSubject] = useState('');

  // Email format: 'normal' (direct 1-on-1) vs 'template' (branded card)
  const [emailFormat, setEmailFormat] = useState('normal');

  // Attachments: [{ id, name, size, type, content (base64) }]
  const [attachments, setAttachments] = useState([]);

  // Live preview toggle
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);

  // History logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogModal, setSelectedLogModal] = useState(null);

  // ──── Modern UI RichTextEditor state ────
  const [openDropdown, setOpenDropdown] = useState(null); // 'paragraph' | 'font' | 'format' | 'colors' | 'align' | null
  const [fontSize, setFontSize] = useState(16);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [editorTextColor, setEditorTextColor] = useState('#00000');
  const [imageUploading, setImageUploading] = useState(false);

  // Rich Text Editor Ref
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Live character/word count updater
  const updateWordCount = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, []);

  // Fetch sender accounts list
  const loadSenders = useCallback(async () => {
    try {
      const res = await fetchSenderAccounts();
      if (res && res.success) {
        const list = res.senders || [];
        setSenderAccounts(list);
        if (res.defaultEnvEmail) {
          setDefaultSenderEmail(res.defaultEnvEmail);
        }
        // If an account is marked default, select it initially if no sender is selected
        const def = list.find((a) => a.isDefault);
        if (def) {
          setCustomFromEmail((prev) => prev || def.email);
        } else if (res.defaultEnvEmail) {
          setCustomFromEmail((prev) => prev || res.defaultEnvEmail);
        }
      }
    } catch (err) {
      console.warn('Could not load sender accounts:', err.message);
    }
  }, []);

  // Fetch email history & default sender from backend
  const fetchHistory = useCallback(async () => {
    try {
      setLogsLoading(true);
      const [historyRes] = await Promise.allSettled([
        fetchOutreachHistory(),
        loadSenders(),
      ]);

      if (historyRes.status === 'fulfilled' && historyRes.value) {
        if (historyRes.value.defaultSender) {
          setDefaultSenderEmail(historyRes.value.defaultSender);
          setCustomFromEmail((prev) => (!prev ? historyRes.value.defaultSender : prev));
        }
        if (historyRes.value.logs) {
          setLogs(historyRes.value.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load outreach history:', err);
    } finally {
      setLogsLoading(false);
    }
  }, [loadSenders]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle Add Sender Form Submit with live SMTP verify
  const handleCreateSender = async (e) => {
    e.preventDefault();
    if (!newSenderForm.email || !newSenderForm.password) {
      showToast({
        title: 'Missing Fields',
        message: 'Please provide both email address and App password.',
        type: 'error',
      });
      return;
    }

    try {
      setIsVerifyingSender(true);
      const res = await createSenderAccount(newSenderForm);
      if (res && res.success) {
        showToast({
          title: 'Account Verified & Added',
          message: res.message || `Sender account "${newSenderForm.email}" verified successfully!`,
          type: 'success',
        });
        setNewSenderForm({
          email: '',
          password: '',
          label: '',
          service: 'gmail',
          isDefault: false,
        });
        setIsAddingSender(false);
        await loadSenders();
        if (res.account?.email) {
          setCustomFromEmail(res.account.email);
        }
      }
    } catch (err) {
      showToast({
        title: 'SMTP Verification Failed',
        message: err.message || 'Google rejected the email or App password.',
        type: 'error',
      });
    } finally {
      setIsVerifyingSender(false);
    }
  };

  // Handle Delete Sender Account
  const handleDeleteSender = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete sender account "${email}"?`)) return;
    try {
      const res = await deleteSenderAccount(id);
      if (res && res.success) {
        showToast({
          title: 'Account Deleted',
          message: res.message || `Sender account "${email}" removed.`,
          type: 'warning',
        });
        await loadSenders();
        if (customFromEmail === email) {
          setCustomFromEmail(defaultSenderEmail);
        }
      }
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Failed to delete sender account.',
        type: 'error',
      });
    }
  };

  // Handle Set Default Sender Account
  const handleSetDefaultSender = async (id, email) => {
    try {
      const res = await setDefaultSenderAccount(id);
      if (res && res.success) {
        showToast({
          title: 'Default Sender Updated',
          message: `"${email}" is now the default sender account.`,
          type: 'success',
        });
        await loadSenders();
        setCustomFromEmail(email);
      }
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Failed to set default sender.',
        type: 'error',
      });
    }
  };

  // Execute formatting command in contentEditable box
  const formatDoc = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      updateWordCount();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g. https://admiresoftech.com):', 'https://');
    if (url && url.trim()) {
      formatDoc('createLink', url.trim());
    }
  };

  // Upload & embed inline image into the editor via WebP conversion + AWS S3 upload
  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        title: 'Invalid File Type',
        message: 'Please select an image file (PNG, JPG, WebP, SVG, GIF).',
        type: 'error',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast({
        title: 'Image Too Large',
        message: 'Image size exceeds 15MB limit.',
        type: 'error',
      });
      return;
    }

    try {
      setImageUploading(true);
      showToast({
        title: 'Optimizing & Uploading',
        message: 'Converting to WebP and uploading to AWS S3...',
        type: 'info',
      });

      // 1. Convert to optimized WebP format
      const webpFile = await convertImageToWebP(file, { quality: 0.85 });

      // 2. Upload to S3 under emails/outreach folder structure
      const uploadResult = await uploadFileToS3(webpFile, {
        module: 'emails',
        category: 'outreach',
        email: customFromEmail || defaultSenderEmail || 'admin@admiresoftech.com',
      });

      if (!uploadResult || !uploadResult.publicUrl) {
        throw new Error('Could not retrieve public image URL from AWS S3');
      }

      // 3. Insert S3 hosted WebP image directly into editor HTML
      if (editorRef.current) {
        editorRef.current.focus();
        const imgHtml = `<img src="${uploadResult.publicUrl}" alt="${uploadResult.fileName || file.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block;" />`;
        document.execCommand('insertHTML', false, imgHtml);
        updateWordCount();
        showToast({
          title: 'WebP Image Uploaded! 🚀',
          message: 'Image saved to S3 and embedded in email.',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('[OutreachPage] Image upload failed:', err);
      showToast({
        title: 'Upload Failed',
        message: err.message || 'Failed to convert or upload image to S3.',
        type: 'error',
      });
    } finally {
      setImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Insert Table into editor
  const handleInsertTable = () => {
    const rows = parseInt(prompt('Enter number of rows:', '3') || '0', 10);
    const cols = parseInt(prompt('Enter number of columns:', '3') || '0', 10);

    if (rows > 0 && cols > 0) {
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #334155;">';
      for (let r = 0; r < rows; r++) {
        tableHtml += '<tr>';
        for (let c = 0; c < cols; c++) {
          if (r === 0) {
            tableHtml += '<th style="border: 1px solid #334155; padding: 8px 12px; background: #1e293b; font-weight: bold; text-align: left;">Header</th>';
          } else {
            tableHtml += '<td style="border: 1px solid #334155; padding: 8px 12px;">Cell</td>';
          }
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table><p></p>';
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, tableHtml);
        updateWordCount();
      }
    }
  };

  // Handle file attachment selection (Auto-converts images to WebP)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      // 15MB limit per file
      if (file.size > 15 * 1024 * 1024) {
        showToast({
          title: 'File Too Large',
          message: `"${file.name}" exceeds the 15MB limit.`,
          type: 'error',
        });
        continue;
      }

      try {
        let fileToProcess = file;
        // If file is an image, convert to WebP format first
        if (file.type.startsWith('image/')) {
          fileToProcess = await convertImageToWebP(file, { quality: 0.85 });
        }

        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${fileToProcess.name}-${Date.now()}-${Math.random()}`,
              filename: fileToProcess.name,
              size: fileToProcess.size,
              contentType: fileToProcess.type || 'application/octet-stream',
              content: reader.result, // data URL base64
            },
          ]);
        };
        reader.readAsDataURL(fileToProcess);
      } catch (err) {
        console.warn('Could not convert attached image to webp, attaching original:', err);
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              filename: file.name,
              size: file.size,
              contentType: file.type || 'application/octet-stream',
              content: reader.result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Clear composer
  const handleClearComposer = () => {
    if (window.confirm('Are you sure you want to clear the entire composer?')) {
      setToInput('');
      setCcInput('');
      setBccInput('');
      setSubject('');
      setAttachments([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  // Handle Send Email
  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();

    const editorContent = editorRef.current ? editorRef.current.innerHTML.trim() : '';
    const textOnly = editorRef.current ? editorRef.current.innerText.trim() : '';

    if (!toInput.trim()) {
      showToast({
        title: 'Missing Recipient',
        message: 'Please provide at least one recipient email in "To".',
        type: 'warning',
      });
      return;
    }

    if (!subject.trim()) {
      showToast({
        title: 'Missing Subject',
        message: 'Please provide an email subject line.',
        type: 'warning',
      });
      return;
    }

    if (!textOnly && !editorContent) {
      showToast({
        title: 'Empty Message Body',
        message: 'Please write the message body before sending.',
        type: 'warning',
      });
      return;
    }

    try {
      setSending(true);

      const payload = {
        to: toInput,
        cc: ccInput,
        bcc: bccInput,
        subject: subject.trim(),
        fromName: fromName.trim(),
        fromEmail: (customFromEmail || defaultSenderEmail).trim(),
        htmlContent: editorContent,
        emailFormat: emailFormat,
        attachments: attachments.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
          content: att.content,
        })),
      };

      const res = await sendOutreachEmail(payload);

      if (res && res.success) {
        showToast({
          title: 'Email Sent Successfully! 🚀',
          message: res.message || `Outreach email delivered to ${toInput}`,
          type: 'success',
        });

        // Optimistically update logs list with new record
        if (res.record) {
          setLogs((prev) => [res.record, ...prev.filter((l) => l._id !== res.record._id)]);
        }

        // Reset form
        setToInput('');
        setCcInput('');
        setBccInput('');
        setSubject('');
        setAttachments([]);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
    } catch (err) {
      console.error('Error sending email:', err);
      showToast({
        title: 'Sending Failed',
        message: err.message || 'Could not send outreach email. Please verify SMTP settings.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Delete this outreach email record from history?')) return;
    try {
      await deleteOutreachLog(id);
      setLogs((prev) => prev.filter((item) => item._id !== id));
      if (selectedLogModal && selectedLogModal._id === id) {
        setSelectedLogModal(null);
      }
      showToast({
        title: 'Record Deleted',
        message: 'Outreach history record removed.',
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete record.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>ADMIN</span>
            <span>&rsaquo;</span>
            <span className="text-cyan-400 font-bold">CONNECTION</span>
            <span>&rsaquo;</span>
            <span className="text-slate-300">INBOX</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Direct Outreach &amp; IT Service Mailer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Direct Gmail-style composer for pitching website development, maintenance, and IT services to clients.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sent History ({logs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        /* Compose Box (Gmail Style) */
        <div className="rounded-2xl border border-slate-800/90 bg-[#091124] shadow-2xl overflow-hidden flex flex-col">
          {/* Top Window Header */}
          <div className="px-5 py-3.5 bg-[#060b18] border-b border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-xs font-bold text-slate-300 ml-2">
                New Message &bull; IT Proposal &amp; Outreach
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 font-semibold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* Form Header Area: From, To, Cc/Bcc, Subject */}
          <div className="p-5 space-y-3.5 border-b border-slate-800/70 bg-[#080e21]">
            {/* From Row with both Display Name and Specific Sender Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
              <label className="sm:col-span-2 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>From Identity:</span>
              </label>
              
              {/* Sender Name */}
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Sender Name (e.g. Admire Softech)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#060a17] border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Sender Email Dropdown with Account Selector & Manage Modal Trigger */}
              <div className="sm:col-span-6 flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <select
                    value={customFromEmail}
                    onChange={(e) => setCustomFromEmail(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs font-mono rounded-xl bg-[#060a17] border border-slate-700/80 text-emerald-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                  >
                    {senderAccounts && senderAccounts.length > 0 ? (
                      <>
                        {senderAccounts.map((acc) => (
                          <option key={acc._id} value={acc.email}>
                            {acc.email}
                          </option>
                        ))}
                        {defaultSenderEmail && !senderAccounts.some((a) => a.email === defaultSenderEmail) && (
                          <option value={defaultSenderEmail}>
                            {defaultSenderEmail}
                          </option>
                        )}
                      </>
                    ) : (
                      <option value={defaultSenderEmail || "support@admiresoftech.com"}>
                        {defaultSenderEmail || "support@admiresoftech.com"}
                      </option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Manage Senders Button */}
                <button
                  type="button"
                  onClick={() => setIsManageSendersOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Manage Multi-Sender Accounts"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Manage Senders</span>
                </button>
              </div>
            </div>

            {/* To Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
              <label className="sm:col-span-2 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>To (Recipient):</span>
              </label>
              <div className="sm:col-span-8">
                <input
                  type="text"
                  required
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="client@company.com or multiple emails separated by comma"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#060a17] border border-slate-700/80 text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-xs text-slate-400 hover:text-cyan-400 font-semibold cursor-pointer underline"
                >
                  {showCcBcc ? 'Hide Cc/Bcc' : 'Cc / Bcc'}
                </button>
              </div>
            </div>

            {/* Optional Cc / Bcc Rows */}
            {showCcBcc && (
              <div className="space-y-2 pt-1 border-t border-slate-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <label className="sm:col-span-2 text-xs font-bold text-slate-500">Cc:</label>
                  <div className="sm:col-span-10">
                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      placeholder="Optional copy recipients (comma-separated)"
                      className="w-full px-3.5 py-1.5 text-xs font-mono rounded-xl bg-[#060a17] border border-slate-700/80 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <label className="sm:col-span-2 text-xs font-bold text-slate-500">Bcc:</label>
                  <div className="sm:col-span-10">
                    <input
                      type="text"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      placeholder="Optional blind copy recipients (comma-separated)"
                      className="w-full px-3.5 py-1.5 text-xs font-mono rounded-xl bg-[#060a17] border border-slate-700/80 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subject Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
              <label className="sm:col-span-2 text-xs font-bold text-slate-400">Subject:</label>
              <div className="sm:col-span-10">
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Website Modernization Proposal &amp; IT Solutions for [Company Name]"
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-[#060a17] border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Email Format / Style Mode Selector: Normal (Direct 1-on-1) vs Branded Template */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center pt-1 border-t border-slate-800/60">
              <label className="sm:col-span-2 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Style:</span>
              </label>
              <div className="sm:col-span-10 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEmailFormat('normal')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    emailFormat === 'normal'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'bg-[#060a17] text-slate-400 border-slate-700/80 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Normal Mail </span>
                  {emailFormat === 'normal' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEmailFormat('template')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    emailFormat === 'template'
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/10'
                      : 'bg-[#060a17] text-slate-400 border-slate-700/80 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5 text-purple-400" />
                  <span>Branded Template</span>
                  {emailFormat === 'template' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </button>

                
              </div>
            </div>
          </div>

          {/* ═══════════ Modern UI RichTextEditor Toolbar ═══════════ */}
          <div className="px-3 py-2 bg-[#0c1222] border-b border-slate-700/60 flex items-center gap-0 text-slate-300 select-none relative">

            {/* Undo / Redo */}
            <button type="button" onClick={() => formatDoc('undo')} title="Undo"
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => formatDoc('redo')} title="Redo"
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Paragraph Dropdown Popover */}
            <div className="relative">
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'paragraph' ? null : 'paragraph')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md hover:bg-slate-700/50 text-slate-200 transition-colors">
                <span>Paragraph</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openDropdown === 'paragraph' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#141c2e] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 py-1.5 overflow-hidden">
                  {[
                    { label: 'Paragraph', tag: '<p>', icon: null },
                    { label: 'Heading 1', tag: '<h1>', icon: 'H₁' },
                    { label: 'Heading 2', tag: '<h2>', icon: 'H₂' },
                    { label: 'Heading 3', tag: '<h3>', icon: 'H₃' },
                    { label: 'Numbered List', tag: 'insertOrderedList', icon: '1.' },
                    { label: 'Bulleted List', tag: 'insertUnorderedList', icon: '•' },
                    { label: 'Code Block', tag: '<pre>', icon: '< >' },
                    { label: 'Quote', tag: '<blockquote>', icon: '❝' },
                  ].map((item) => (
                    <button key={item.label} type="button"
                      onClick={() => {
                        if (item.tag === 'insertOrderedList' || item.tag === 'insertUnorderedList') {
                          formatDoc(item.tag);
                        } else {
                          formatDoc('formatBlock', item.tag);
                        }
                        setOpenDropdown(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-left">
                      {item.icon && <span className="w-6 text-center text-xs font-bold text-slate-400">{item.icon}</span>}
                      {!item.icon && <span className="w-6" />}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Font Family Dropdown Popover */}
            <div className="relative">
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'font' ? null : 'font')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md hover:bg-slate-700/50 text-slate-200 transition-colors">
                <span>Arial</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openDropdown === 'font' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#141c2e] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 py-1.5 overflow-hidden">
                  {[
                    { label: 'Arial', value: 'Arial, sans-serif' },
                    { label: 'Times New Roman', value: 'Times New Roman, serif' },
                    { label: 'Courier New', value: 'Courier New, monospace' },
                    { label: 'Georgia', value: 'Georgia, serif' },
                    { label: 'Verdana', value: 'Verdana, sans-serif' },
                  ].map((f) => (
                    <button key={f.label} type="button"
                      onClick={() => { formatDoc('fontName', f.value); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-[13px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                      style={{ fontFamily: f.value }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Font Size Stepper: — 16 + */}
            <div className="flex items-center gap-0">
              <button type="button" onClick={() => { setFontSize(prev => Math.max(8, prev - 1)); formatDoc('fontSize', '2'); }}
                title="Decrease"
                className="p-1.5 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-[13px] font-bold text-slate-200 tabular-nums">{fontSize}</span>
              <button type="button" onClick={() => { setFontSize(prev => Math.min(72, prev + 1)); formatDoc('fontSize', '5'); }}
                title="Increase"
                className="p-1.5 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Text Format Dropdown Popover */}
            <div className="relative">
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'format' ? null : 'format')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md hover:bg-slate-700/50 text-slate-200 transition-colors">
                <span>Text Format</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openDropdown === 'format' && (
                <div className="absolute top-full left-0 mt-1 bg-[#141c2e] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 p-2 overflow-hidden">
                  {/* Row 1: B I U S x² x₂ */}
                  <div className="flex items-center gap-1 mb-1">
                    <button type="button" onClick={() => formatDoc('bold')} title="Bold"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('italic')} title="Italic"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('underline')} title="Underline"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <Underline className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('strikeThrough')} title="Strikethrough"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <Strikethrough className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('superscript')} title="Superscript"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors text-[11px] font-bold">
                      x<sup>²</sup>
                    </button>
                    <button type="button" onClick={() => formatDoc('subscript')} title="Subscript"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors text-[11px] font-bold">
                      x<sub>₂</sub>
                    </button>
                  </div>
                  <div className="w-full h-px bg-slate-700/60 my-1" />
                  {/* Row 2: Align + Lists */}
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => formatDoc('justifyLeft')} title="Align Left"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('justifyCenter')} title="Align Center"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('insertUnorderedList')} title="Bullet List"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <List className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => formatDoc('insertOrderedList')} title="Numbered List"
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors">
                      <ListOrdered className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Colors Dropdown Popover */}
            <div className="relative">
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'colors' ? null : 'colors')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md hover:bg-slate-700/50 text-slate-200 transition-colors">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Colors</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openDropdown === 'colors' && (
                <div className="absolute top-full left-0 mt-1 w-[260px] bg-[#141c2e] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 p-3 overflow-hidden">
                  {/* Text Color Section */}
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Text Color</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded border border-slate-600" style={{ backgroundColor: editorTextColor }} />
                    <input type="text" value={editorTextColor} onChange={(e) => setEditorTextColor(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { formatDoc('foreColor', editorTextColor); } }}
                      className="flex-1 px-2 py-1 text-xs font-mono bg-[#0c1222] border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button type="button" onClick={() => formatDoc('foreColor', editorTextColor)} title="Apply Color"
                      className="text-[10px] px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-bold transition-colors">
                      T
                    </button>
                  </div>
                  <div className="grid grid-cols-10 gap-1 mb-3">
                    {[
                      '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff',
                      '#980000','#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff',
                      '#e6b8af','#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc',
                      '#dd7e6b','#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd',
                    ].map((c) => (
                      <button key={`tc-${c}`} type="button"
                        onClick={() => { setEditorTextColor(c); formatDoc('foreColor', c); }}
                        className="w-5 h-5 rounded-sm border border-slate-700/60 hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>

                  <div className="w-full h-px bg-slate-700/60 my-2" />

                  {/* Background Color Section */}
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Background Color</p>
                  <div className="grid grid-cols-10 gap-1">
                    {[
                      '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff',
                      '#980000','#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff',
                      '#e6b8af','#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc',
                    ].map((c) => (
                      <button key={`bg-${c}`} type="button"
                        onClick={() => formatDoc('hiliteColor', c)}
                        className="w-5 h-5 rounded-sm border border-slate-700/60 hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Alignment Dropdown Popover */}
            <div className="relative">
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'align' ? null : 'align')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md hover:bg-slate-700/50 text-slate-200 transition-colors">
                <AlignLeft className="w-3.5 h-3.5" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openDropdown === 'align' && (
                <div className="absolute top-full left-0 mt-1 bg-[#141c2e] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 z-50 py-1.5 overflow-hidden">
                  {[
                    { label: 'Align Left', cmd: 'justifyLeft', Icon: AlignLeft },
                    { label: 'Align Center', cmd: 'justifyCenter', Icon: AlignCenter },
                    { label: 'Align Right', cmd: 'justifyRight', Icon: AlignRight },
                  ].map((a) => (
                    <button key={a.cmd} type="button"
                      onClick={() => { formatDoc(a.cmd); setOpenDropdown(null); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      <a.Icon className="w-4 h-4 text-slate-400" />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Upload Image (Modern UI Image button) */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleInlineImageUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={imageUploading}
              onClick={() => imageInputRef.current?.click()}
              title={imageUploading ? "Optimizing & uploading WebP to S3..." : "Upload image (Auto-converts to .webp & uploads to S3)"}
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {imageUploading ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </button>

            {/* Insert Table */}
            <button
              type="button"
              onClick={handleInsertTable}
              title="Insert Table"
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <Table className="w-4 h-4" />
            </button>

            <span className="w-px h-6 bg-slate-700/80 mx-1.5" />

            {/* Link */}
            <button type="button" onClick={handleInsertLink} title="Insert Link"
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
              <Link2 className="w-4 h-4" />
            </button>

            {/* Clear Formatting */}
            <button type="button" onClick={() => formatDoc('removeFormat')} title="Clear Formatting"
              className="p-2 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-rose-400 transition-colors">
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Click-away overlay to close dropdowns */}
          {openDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
          )}

          {/* Editable Content Area */}
          <div className="relative flex-1 min-h-[320px] sm:min-h-[400px] bg-[#0c1222] p-6 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateWordCount}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
                if (e.clipboardData.getData('text/html')) {
                  const cleanHtml = text
                    .replace(/background-color:[^;"]+;?/gi, '')
                    .replace(/background:[^;"]+;?/gi, '');
                  document.execCommand('insertHTML', false, cleanHtml);
                } else {
                  document.execCommand('insertText', false, text);
                }
                updateWordCount();
              }}
              className="w-full h-full min-h-[280px] sm:min-h-[360px] outline-none text-slate-100 text-[15px] leading-relaxed overflow-y-auto custom-scrollbar"
              style={{ caretColor: '#22d3ee' }}
            />
            {/* Visual placeholder when empty */}
            {charCount === 0 && (
              <div
                onClick={() => editorRef.current?.focus()}
                className="absolute top-6 left-6 text-slate-500 text-[15px] pointer-events-none select-none"
              >
                Type something...
              </div>
            )}
          </div>

          {/* Character / Word count footer bar (Modern UI style) */}
          <div className="px-5 py-2.5 bg-[#080e1c] border-t border-slate-700/60 flex items-center justify-between text-[12px] text-slate-400 font-mono select-none">
            <span className="tracking-tight">{charCount} characters &nbsp; {wordCount} words</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Download / Export HTML"
                onClick={() => {
                  if (!editorRef.current) return;
                  const blob = new Blob([editorRef.current.innerHTML], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${subject ? subject.replace(/[^a-z0-9]/gi, '_') : 'outreach-email'}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Exported email content as HTML!', 'success');
                }}
                className="p-1.5 hover:bg-slate-800 rounded-md hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="More options"
                onClick={() => {
                  showToast('RichTextEditor powered by Tiptap & Modern UI format standard', 'info');
                }}
                className="p-1.5 hover:bg-slate-800 rounded-md hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div className="p-4 bg-[#060b18] border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                <span>Attached Files ({attachments.length}):</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 group"
                  >
                    <File className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium max-w-[200px] truncate">{att.filename}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({formatFileSize(att.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Bar (Send, Attach File, Reset) */}
          <div className="p-4 bg-[#050914] border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Send Button */}
              <button
                type="button"
                disabled={sending}
                onClick={handleSendEmail}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {/* Hidden File Input & Attach Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="email-file-attachment"
              />
              <label
                htmlFor="email-file-attachment"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                title="Attach files (PDF, Images, Docs)"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Files</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearComposer}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Discard & Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Sent History View */
        <div className="rounded-2xl border border-slate-800/90 bg-[#091124] shadow-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Outreach Email Dispatch Logs</span>
            </h3>
            <button
              onClick={fetchHistory}
              disabled={logsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
              <Mail className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60" />
              <p className="text-xs text-slate-400 font-medium">No outreach emails sent yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Switch to the Compose tab to dispatch your first client pitch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-[#070d1e]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-900/60">
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Recipient(s)</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Style</th>
                    <th className="py-3 px-4 text-center">Attachments</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {Array.isArray(log.to) ? log.to.join(', ') : log.to}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                        {log.subject}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {log.emailFormat === 'template' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            <Layout className="w-2.5 h-2.5" /> Template
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            <Mail className="w-2.5 h-2.5" /> Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">
                        {log.attachments && log.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                            <Paperclip className="w-3 h-3" />
                            {log.attachments.length}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {log.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setSelectedLogModal(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030611]/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#091124] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-[#060b18] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Email Client Preview</span>
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-[#070d1e]">
              <div className="bg-[#050916] p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div>
                  <strong className="text-slate-400">From:</strong> {fromName} &lt;{customFromEmail || defaultSenderEmail}&gt;
                </div>
                <div>
                  <strong className="text-slate-400">To:</strong> {toInput || '(No recipient)'}
                </div>
                <div>
                  <strong className="text-slate-400">Subject:</strong> {subject || '(No subject)'}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  <strong className="text-slate-400">Format Mode:</strong>
                  {emailFormat === 'normal' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Mail className="w-3 h-3" /> Normal Mail (Direct 1-on-1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Layout className="w-3 h-3" /> Branded Template (Corporate Card &amp; Logo)
                    </span>
                  )}
                </div>
              </div>

              {/* Render simulated email body according to active format */}
              {emailFormat === 'normal' ? (
                <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 overflow-hidden shadow-sm text-slate-900">
                  <div
                    className="text-slate-900 text-[15px] leading-relaxed max-w-none prose"
                    dangerouslySetInnerHTML={{
                      __html: editorRef.current?.innerHTML || '<p class="text-slate-500">No content entered yet.</p>',
                    }}
                  />
                </div>
              ) : (
                <div className="bg-[#f1f5f9] border border-slate-700/80 rounded-xl p-4 sm:p-6 overflow-hidden shadow-xl">
                  <div className="max-w-[600px] mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
                    {/* Header Logo Centered */}
                    <div className="p-6 bg-[#070d1e] border-b-2 border-cyan-400 flex justify-center items-center text-center">
                      <img
                        src="https://media.admiresoftech.com/emails/assets/logo.png"
                        alt="Admire Softech"
                        className="h-10 w-auto object-contain mx-auto"
                      />
                    </div>

                    {/* Body Content */}
                    <div
                      className="p-8 text-slate-900 text-sm leading-relaxed max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: editorRef.current?.innerHTML || '<p class="text-slate-500">No content entered yet.</p>',
                      }}
                    />

                    {/* Footer */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 text-center">
                      <p className="font-bold text-xs text-slate-900 mb-1">
                        Admire Softech Solution Pvt. Ltd
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Admire Softech Solution Pvt. Ltd &bull; Premium IT, Web Engineering &amp; Software Solutions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#060b18] border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030611]/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#091124] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-[#060b18] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Outreach Email Record</span>
              </h3>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-[#070d1e]">
              <div className="bg-[#050916] p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div>
                  <strong className="text-slate-400">Status:</strong>{' '}
                  <span className={`font-bold ${selectedLogModal.status === 'SENT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedLogModal.status}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-400">Date:</strong>{' '}
                  {new Date(selectedLogModal.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong className="text-slate-400">To:</strong>{' '}
                  {Array.isArray(selectedLogModal.to) ? selectedLogModal.to.join(', ') : selectedLogModal.to}
                </div>
                <div>
                  <strong className="text-slate-400">Subject:</strong> {selectedLogModal.subject}
                </div>
                <div>
                  <strong className="text-slate-400">Email Style:</strong>{' '}
                  {selectedLogModal.emailFormat === 'template' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Layout className="w-2.5 h-2.5" /> Branded Template
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Mail className="w-2.5 h-2.5" /> Normal Mail (Direct)
                    </span>
                  )}
                </div>
                {selectedLogModal.errorMessage && (
                  <div className="text-rose-400">
                    <strong>Error:</strong> {selectedLogModal.errorMessage}
                  </div>
                )}
              </div>

              {/* Body rendering based on format recorded at send time */}
              {selectedLogModal.emailFormat === 'template' ? (
                <div className="bg-[#f8fafc] border border-slate-700/80 p-4 sm:p-6 rounded-xl overflow-x-auto">
                  <div className="max-w-[620px] mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
                    <div className="p-6 bg-[#070d1e] border-b-2 border-cyan-400 flex justify-center items-center text-center">
                      <img
                        src="https://media.admiresoftech.com/emails/assets/logo.png"
                        alt="Admire Softech"
                        className="h-10 w-auto object-contain mx-auto"
                      />
                    </div>
                    <div
                      className="p-8 text-slate-700 text-sm leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedLogModal.htmlContent,
                      }}
                    />
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
                      Admire Softech Solution Pvt. Ltd &bull; Premium IT, Web Engineering &amp; Software Solutions
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 overflow-x-auto shadow-sm text-slate-900">
                  <div
                    className="text-slate-900 text-[15px] leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedLogModal.htmlContent,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-[#060b18] border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Manage Multi-Sender Email Accounts Modal ──── */}
      {isManageSendersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030611]/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#091124] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-[#060b18] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Multi-Sender Email Accounts</span>
              </h3>
              <button
                onClick={() => {
                  setIsManageSendersOpen(false);
                  setIsAddingSender(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-[#070d1e]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Configured SMTP Senders ({senderAccounts.length})
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Passwords are encrypted with AES-256 and authenticated directly with Gmail/SMTP servers.
                  </p>
                </div>
                {!isAddingSender && (
                  <button
                    type="button"
                    onClick={() => setIsAddingSender(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Sender</span>
                  </button>
                )}
              </div>

              {/* Add New Sender Form */}
              {isAddingSender && (
                <form
                  onSubmit={handleCreateSender}
                  className="p-4 rounded-xl border border-cyan-500/30 bg-[#050916] space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      Add &amp; Verify Email Account
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSender(false)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={newSenderForm.email}
                        onChange={(e) =>
                          setNewSenderForm({ ...newSenderForm, email: e.target.value })
                        }
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-[#080f24] border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Account Label / Display Name
                      </label>
                      <input
                        type="text"
                        value={newSenderForm.label}
                        onChange={(e) =>
                          setNewSenderForm({ ...newSenderForm, label: e.target.value })
                        }
                        placeholder="e.g. Kaif Personal / Support Mail"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#080f24] border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                      <span>Gmail 16-Character App Password *</span>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Generate App Password <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </label>
                    <div className="relative">
                      <input
                        type={showSenderPassword ? 'text' : 'password'}
                        required
                        value={newSenderForm.password}
                        onChange={(e) =>
                          setNewSenderForm({ ...newSenderForm, password: e.target.value })
                        }
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full pl-3 pr-9 py-1.5 text-xs font-mono rounded-lg bg-[#080f24] border border-slate-700 text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenderPassword(!showSenderPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors"
                        title={showSenderPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSenderPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Stored in MongoDB as an AES-256 encrypted string with secret key.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newSenderForm.isDefault}
                        onChange={(e) =>
                          setNewSenderForm({
                            ...newSenderForm,
                            isDefault: e.target.checked,
                          })
                        }
                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Set as Default Sender</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isVerifyingSender}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingSender ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify &amp; Save Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Sender Accounts List */}
              <div className="space-y-2.5">
                {/* Fallback Env Account */}
                {defaultSenderEmail && (
                  <div className="p-3 rounded-xl border border-slate-800 bg-[#050916] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-slate-200">
                          {defaultSenderEmail}
                        </p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      .env
                    </span>
                  </div>
                )}

                {/* MongoDB Saved Accounts */}
                {senderAccounts.map((acc) => (
                  <div
                    key={acc._id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      acc.isDefault
                        ? 'border-cyan-500/50 bg-cyan-950/10'
                        : 'border-slate-800 bg-[#050916] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-slate-200">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!acc.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultSender(acc._id, acc.email)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSender(acc._id, acc.email)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {senderAccounts.length === 0 && !defaultSenderEmail && (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                    <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No sender accounts configured yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#060b18] border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManageSendersOpen(false);
                  setIsAddingSender(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
