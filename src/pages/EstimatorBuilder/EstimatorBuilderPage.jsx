import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Code2,
  Cpu,
  Cloud,
  Smartphone,
  ShieldCheck,
  Layers,
  Globe,
  Database,
  Sparkles,
  IndianRupee,
  Clock,
  HelpCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Phone,
  Mail,
  User,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  getEstimatorConfig,
  updateEstimatorConfig,
  resetEstimatorConfig,
} from '../../api/estimatorConfigApi';

const ICON_MAP = {
  Code2: Code2,
  Cpu: Cpu,
  Cloud: Cloud,
  Smartphone: Smartphone,
  ShieldCheck: ShieldCheck,
  Layers: Layers,
  Globe: Globe,
  Database: Database,
  Sparkles: Sparkles,
};

const AVAILABLE_ICONS = [
  'Code2',
  'Cpu',
  'Cloud',
  'Smartphone',
  'ShieldCheck',
  'Layers',
  'Globe',
  'Database',
  'Sparkles',
];

export default function EstimatorBuilderPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('scopes'); // 'header' | 'services' | 'scopes' | 'timelines' | 'contact' | 'fields'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewStep, setPreviewStep] = useState(2);

  // Form State
  const [config, setConfig] = useState({
    header: {
      title: 'Instant Project Estimator',
      subtitle: 'Architecting Future-Ready Cloud, AI & Enterprise Solutions',
      badge: 'Direct Architect Access',
      avgResponseTime: '< 2 hours',
    },
    services: [],
    scopes: [],
    timelines: [],
    contactModalConfig: {
      title: "Let's Build Something Amazing",
      subtitle: 'Share your project vision or technical requirements with our engineering leaders.',
      badge: 'Direct Architect Access',
      budgetRanges: ['< ₹50k', '₹50k - ₹1.5L', '₹1.5L - ₹5L', '₹5L - ₹15L', '₹15L+'],
      servicesList: [],
    },
    fieldSettings: {
      requirePhone: false,
      minMessageLength: 10,
      requireAuthForQuote: false,
    },
  });

  // Fetch initial config
  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getEstimatorConfig();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
          header: { ...prev.header, ...(data.header || {}) },
          contactModalConfig: { ...prev.contactModalConfig, ...(data.contactModalConfig || {}) },
          fieldSettings: { ...prev.fieldSettings, ...(data.fieldSettings || {}) },
        }));
      }
    } catch (err) {
      console.error('Failed to load estimator config:', err);
      showToast({
        title: 'Network Warning',
        message: 'Could not fetch live config from server. Using local defaults.',
        type: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save Config
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEstimatorConfig(config);
      showToast({
        title: 'Estimator Form Updated',
        message: 'All step configurations and pricing brackets have been synced live to the website.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error saving config:', err);
      showToast({
        title: 'Save Failed',
        message: err.message || 'Failed to save configuration. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all estimator steps, pricing, and services to factory defaults?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await resetEstimatorConfig();
      if (res?.config) {
        setConfig(res.config);
      } else {
        await loadConfig();
      }
      showToast({
        title: 'Reset Completed',
        message: 'Estimator form restored to factory default settings.',
        type: 'info',
      });
    } catch (err) {
      showToast({
        title: 'Reset Failed',
        message: err.message || 'Failed to reset settings.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // ──── Service Helpers ────
  const addService = () => {
    const newId = `srv-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          id: newId,
          title: 'New Service Package',
          desc: 'Custom enterprise software deliverables',
          iconName: 'Code2',
          isEnabled: true,
          order: prev.services.length + 1,
        },
      ],
    }));
  };

  const updateService = (idx, field, value) => {
    setConfig((prev) => {
      const updated = [...prev.services];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const removeService = (idx) => {
    setConfig((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx),
    }));
  };

  // ──── Scope & Pricing Helpers ────
  const addScope = () => {
    const newId = `scope-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      scopes: [
        ...prev.scopes,
        {
          id: newId,
          title: 'Custom Engineering Tier',
          subtitle: 'Tailored architecture with dedicated resources',
          estPrice: '₹1.0 Lakh - ₹3.0 Lakhs',
          minPrice: 100000,
          maxPrice: 300000,
          currency: 'INR',
          badge: '',
          isEnabled: true,
          order: prev.scopes.length + 1,
        },
      ],
    }));
  };

  const updateScope = (idx, field, value) => {
    setConfig((prev) => {
      const updated = [...prev.scopes];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, scopes: updated };
    });
  };

  const removeScope = (idx) => {
    setConfig((prev) => ({
      ...prev,
      scopes: prev.scopes.filter((_, i) => i !== idx),
    }));
  };

  // ──── Timeline Helpers ────
  const addTimeline = () => {
    const newId = `time-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      timelines: [
        ...prev.timelines,
        {
          id: newId,
          label: '4 - 8 Weeks',
          note: 'Rapid Acceleration',
          isEnabled: true,
          order: prev.timelines.length + 1,
        },
      ],
    }));
  };

  const updateTimeline = (idx, field, value) => {
    setConfig((prev) => {
      const updated = [...prev.timelines];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, timelines: updated };
    });
  };

  const removeTimeline = (idx) => {
    setConfig((prev) => ({
      ...prev,
      timelines: prev.timelines.filter((_, i) => i !== idx),
    }));
  };

  // ──── Budget Range Tag Helpers ────
  const [newRangeInput, setNewRangeInput] = useState('');
  const addBudgetRangeTag = () => {
    if (!newRangeInput.trim()) return;
    setConfig((prev) => ({
      ...prev,
      contactModalConfig: {
        ...prev.contactModalConfig,
        budgetRanges: [...(prev.contactModalConfig.budgetRanges || []), newRangeInput.trim()],
      },
    }));
    setNewRangeInput('');
  };

  const removeBudgetRangeTag = (idx) => {
    setConfig((prev) => ({
      ...prev,
      contactModalConfig: {
        ...prev.contactModalConfig,
        budgetRanges: prev.contactModalConfig.budgetRanges.filter((_, i) => i !== idx),
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent" />
          <span className="text-sm text-slate-400 font-mono">Loading Estimator Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ──── TOP HEADER ──── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Estimator & Quote Form Builder
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Step-wise management of services, pricing brackets, delivery timelines, and contact settings.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              showPreview
                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* ──── TAB NAVIGATION ──── */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-800 bg-[#0B132B]/80 p-1.5 gap-1.5 no-scrollbar">
        {[
          { id: 'scopes', label: 'Step 2: Scopes & Pricing', count: config.scopes?.length },
          { id: 'timelines', label: 'Step 2: Timelines', count: config.timelines?.length },
          { id: 'services', label: 'Step 1: Services Catalog', count: config.services?.length },
          { id: 'header', label: 'Modal Header & Badges' },
          { id: 'contact', label: 'Direct Contact Modal' },
          { id: 'fields', label: 'Validation & Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  activeTab === tab.id
                    ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ──── MAIN CONTENT GRID (FORM + LIVE PREVIEW) ──── */}
      <div className={`grid gap-6 ${showPreview ? 'xl:grid-cols-12' : 'grid-cols-1'}`}>
        {/* LEFT COLUMN: EDITING TABS */}
        <div className={showPreview ? 'xl:col-span-7 space-y-6' : 'space-y-6'}>
          {/* TAB 1: SCOPES & PRICING BRACKETS */}
          {activeTab === 'scopes' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Step 2: Project Scope & Pricing Packages</h2>
                  <p className="text-xs text-slate-400">
                    Define the tiered engineering packages, deliverables subtitle, and pricing estimates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addScope}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Scope Tier</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {config.scopes?.map((scope, idx) => (
                  <div
                    key={scope.id || idx}
                    className={`relative rounded-2xl border p-4 transition-all ${
                      scope.isEnabled
                        ? 'border-slate-700/80 bg-slate-900/60 shadow-lg'
                        : 'border-slate-800/60 bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={scope.title}
                          onChange={(e) => updateScope(idx, 'title', e.target.value)}
                          placeholder="e.g. MVP / Initial Release"
                          className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:outline-none px-1 text-sm sm:text-base w-full max-w-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scope.isEnabled}
                            onChange={(e) => updateScope(idx, 'isEnabled', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Active</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeScope(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete Scope"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 pt-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-medium text-slate-400">Subtitle / Deliverables Summary</label>
                        <input
                          type="text"
                          value={scope.subtitle}
                          onChange={(e) => updateScope(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Core features, agile prototype launch"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400">Display Price Tag (e.g. ₹50k - ₹1.5 Lakhs)</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            value={scope.estPrice}
                            onChange={(e) => updateScope(idx, 'estPrice', e.target.value)}
                            placeholder="₹50k - ₹1.5 Lakhs"
                            className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs font-mono font-semibold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400">Badge Label (Optional)</label>
                        <input
                          type="text"
                          value={scope.badge || ''}
                          onChange={(e) => updateScope(idx, 'badge', e.target.value)}
                          placeholder="e.g. Most Popular / Enterprise"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERY TIMELINES */}
          {activeTab === 'timelines' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Step 2: Desired Target Timelines</h2>
                  <p className="text-xs text-slate-400">
                    Set target delivery sprints and delivery notes shown on the estimator timeline selector.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTimeline}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Timeline</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {config.timelines?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2 flex-1">
                        <div>
                          <label className="text-[10px] text-slate-400">Timeline Label</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateTimeline(idx, 'label', e.target.value)}
                            placeholder="e.g. 1 - 2 Months"
                            className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Sprint Note</label>
                          <input
                            type="text"
                            value={item.note}
                            onChange={(e) => updateTimeline(idx, 'note', e.target.value)}
                            placeholder="e.g. Fast-track Sprint"
                            className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isEnabled}
                          onChange={(e) => updateTimeline(idx, 'isEnabled', e.target.checked)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTimeline(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES CATALOG */}
          {activeTab === 'services' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Step 1: Services & Categories</h2>
                  <p className="text-xs text-slate-400">
                    Manage the selectable primary engineering domains shown on Step 1.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {config.services?.map((svc, idx) => (
                  <div
                    key={svc.id || idx}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
                          {(() => {
                            const IconComponent = ICON_MAP[svc.iconName] || Code2;
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                        </div>
                        <input
                          type="text"
                          value={svc.title}
                          onChange={(e) => updateService(idx, 'title', e.target.value)}
                          placeholder="Service Name"
                          className="font-semibold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none text-sm w-full"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={svc.iconName || 'Code2'}
                          onChange={(e) => updateService(idx, 'iconName', e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                        >
                          {AVAILABLE_ICONS.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={svc.isEnabled}
                            onChange={(e) => updateService(idx, 'isEnabled', e.target.checked)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Active</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={svc.desc || ''}
                        onChange={(e) => updateService(idx, 'desc', e.target.value)}
                        placeholder="Short description (e.g. Custom web apps, platforms & portals)"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HEADER & BADGES */}
          {activeTab === 'header' && (
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div>
                <h2 className="text-lg font-bold text-white">Modal Header & Badge Labels</h2>
                <p className="text-xs text-slate-400">
                  Configure top headlines, pill badges, and response time indicators.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300">Modal Main Title</label>
                  <input
                    type="text"
                    value={config.header?.title || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, title: e.target.value },
                      }))
                    }
                    placeholder="Instant Project Estimator"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={config.header?.subtitle || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, subtitle: e.target.value },
                      }))
                    }
                    placeholder="Architecting Future-Ready Cloud, AI & Enterprise Solutions"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Top Badge Pill</label>
                    <input
                      type="text"
                      value={config.header?.badge || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          header: { ...prev.header, badge: e.target.value },
                        }))
                      }
                      placeholder="Direct Architect Access"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Average Response Time</label>
                    <input
                      type="text"
                      value={config.header?.avgResponseTime || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          header: { ...prev.header, avgResponseTime: e.target.value },
                        }))
                      }
                      placeholder="< 2 hours"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DIRECT CONTACT MODAL */}
          {activeTab === 'contact' && (
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div>
                <h2 className="text-lg font-bold text-white">Direct Contact Modal Settings</h2>
                <p className="text-xs text-slate-400">
                  Manage the direct architect contact dialog and its budget bracket chips.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300">Contact Dialog Title</label>
                  <input
                    type="text"
                    value={config.contactModalConfig?.title || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        contactModalConfig: { ...prev.contactModalConfig, title: e.target.value },
                      }))
                    }
                    placeholder="Let's Build Something Amazing"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Contact Subtitle</label>
                  <textarea
                    rows={2}
                    value={config.contactModalConfig?.subtitle || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        contactModalConfig: { ...prev.contactModalConfig, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Budget Range Tags */}
                <div>
                  <label className="text-xs font-medium text-slate-300">Budget Range Quick Chips</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {config.contactModalConfig?.budgetRanges?.map((range, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-medium text-cyan-300 shadow-sm"
                      >
                        <span>{range}</span>
                        <button
                          type="button"
                          onClick={() => removeBudgetRangeTag(idx)}
                          className="text-cyan-400/60 hover:text-rose-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newRangeInput}
                      onChange={(e) => setNewRangeInput(e.target.value)}
                      placeholder="Add budget chip (e.g. ₹15L - ₹30L)"
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none w-64"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addBudgetRangeTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addBudgetRangeTag}
                      className="rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VALIDATION & RULES */}
          {activeTab === 'fields' && (
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-[#0B132B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <div>
                <h2 className="text-lg font-bold text-white">Validation & Submission Rules</h2>
                <p className="text-xs text-slate-400">
                  Configure field mandatory constraints and authentication requirements.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Require Phone Number</h3>
                    <p className="text-xs text-slate-400">Make the phone number field mandatory on submission.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.fieldSettings?.requirePhone || false}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          fieldSettings: { ...prev.fieldSettings, requirePhone: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Require User Account for Instant Quote</h3>
                    <p className="text-xs text-slate-400">Prompt login/signup modal before submitting quote request.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={config.fieldSettings?.requireAuthForQuote || false}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          fieldSettings: { ...prev.fieldSettings, requireAuthForQuote: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
        {showPreview && (
          <div className="xl:col-span-5 space-y-4">
            <div className="sticky top-6 rounded-3xl border border-cyan-500/30 bg-[#080E24]/95 p-5 backdrop-blur-2xl shadow-2xl">
              {/* Preview Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                    Client Live Preview
                  </span>
                </div>

                {/* Step Switcher for Preview */}
                <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewStep(1)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                      previewStep === 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                    }`}
                  >
                    Step 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewStep(2)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                      previewStep === 2 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                    }`}
                  >
                    Step 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewStep(3)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                      previewStep === 3 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                    }`}
                  >
                    Step 3
                  </button>
                </div>
              </div>

              {/* Mock Modal Header */}
              <div className="pt-4 pb-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                  <span>{config.header?.badge || 'Direct Architect Access'}</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {config.header?.title || 'Instant Project Estimator'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Step {previewStep} of 3 —{' '}
                  {previewStep === 1 && 'Select Core Service'}
                  {previewStep === 2 && 'Scope & Budget Bracket'}
                  {previewStep === 3 && 'Contact Details'}
                </p>
              </div>

              {/* Preview Step 1: Services */}
              {previewStep === 1 && (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {config.services
                    ?.filter((s) => s.isEnabled)
                    .map((svc, idx) => {
                      const IconComponent = ICON_MAP[svc.iconName] || Code2;
                      return (
                        <div
                          key={svc.id || idx}
                          className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                            idx === 0
                              ? 'border-cyan-400/50 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white">{svc.title}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{svc.desc}</p>
                          </div>
                          {idx === 0 && <Check className="h-4 w-4 text-cyan-400" />}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Preview Step 2: Scopes & Timelines */}
              {previewStep === 2 && (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {/* Scopes */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Select Scope & Estimated Budget</p>
                    {config.scopes
                      ?.filter((s) => s.isEnabled)
                      .map((sc, idx) => (
                        <div
                          key={sc.id || idx}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                            idx === 0
                              ? 'border-cyan-400/60 bg-cyan-950/40 shadow-md shadow-cyan-500/10'
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{sc.title}</h4>
                              {idx === 0 && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400">{sc.subtitle}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="inline-block rounded-lg bg-cyan-400/10 border border-cyan-400/30 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-300">
                              {sc.estPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Timelines */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Desired Target Timeline</p>
                    <div className="grid grid-cols-3 gap-2">
                      {config.timelines
                        ?.filter((t) => t.isEnabled)
                        .map((t, idx) => (
                          <div
                            key={t.id || idx}
                            className={`rounded-xl border p-2 text-center cursor-pointer transition-all ${
                              idx === 0
                                ? 'border-cyan-400/50 bg-cyan-950/30 text-cyan-300'
                                : 'border-slate-800 bg-slate-900/40 text-slate-300'
                            }`}
                          >
                            <span className="block text-[11px] font-bold">{t.label}</span>
                            <span className="block text-[9px] text-slate-400">{t.note}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Step 3: Contact Form */}
              {previewStep === 3 && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400">Full Name</label>
                    <input
                      type="text"
                      disabled
                      placeholder="e.g. John Doe"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Work Email</label>
                    <input
                      type="email"
                      disabled
                      placeholder="john@enterprise.com"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Project Notes</label>
                    <textarea
                      rows={2}
                      disabled
                      placeholder="Describe your architecture requirements..."
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Nav Simulation */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Avg: {config.header?.avgResponseTime || '< 2 hours'}</span>
                </span>
                <span className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
                  {previewStep < 3 ? 'Next Step →' : 'Submit Request'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
