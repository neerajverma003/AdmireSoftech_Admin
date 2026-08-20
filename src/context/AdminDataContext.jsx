import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialInquiries,
  initialQuotes,
  initialJobs,
  initialApplicants,
  initialFreelance,
  initialServices,
  initialTeam,
  initialTestimonials,
  initialFaqs,
  initialCompanySettings,
  initialStats,
} from '../data/seedData';

const AdminDataContext = createContext(null);

const STORAGE_KEYS = {
  INQUIRIES: 'admire_admin_inquiries',
  QUOTES: 'admire_admin_quotes',
  JOBS: 'admire_admin_jobs',
  APPLICANTS: 'admire_admin_applicants',
  FREELANCE: 'admire_admin_freelance',
  SERVICES: 'admire_admin_services',
  TEAM: 'admire_admin_team',
  TESTIMONIALS: 'admire_admin_testimonials',
  FAQS: 'admire_admin_faqs',
  SETTINGS: 'admire_admin_settings',
  STATS: 'admire_admin_stats',
};

function loadStoredData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

export const AdminDataProvider = ({ children }) => {
  // State variables with LocalStorage persistence
  const [inquiries, setInquiries] = useState(() => loadStoredData(STORAGE_KEYS.INQUIRIES, initialInquiries));
  const [quotes, setQuotes] = useState(() => loadStoredData(STORAGE_KEYS.QUOTES, initialQuotes));
  const [jobs, setJobs] = useState(() => loadStoredData(STORAGE_KEYS.JOBS, initialJobs));
  const [applicants, setApplicants] = useState(() => loadStoredData(STORAGE_KEYS.APPLICANTS, initialApplicants));
  const [freelance, setFreelance] = useState(() => loadStoredData(STORAGE_KEYS.FREELANCE, initialFreelance));
  const [services, setServices] = useState(() => loadStoredData(STORAGE_KEYS.SERVICES, initialServices));
  const [team, setTeam] = useState(() => loadStoredData(STORAGE_KEYS.TEAM, initialTeam));
  const [testimonials, setTestimonials] = useState(() => loadStoredData(STORAGE_KEYS.TESTIMONIALS, initialTestimonials));
  const [faqs, setFaqs] = useState(() => loadStoredData(STORAGE_KEYS.FAQS, initialFaqs));
  const [settings, setSettings] = useState(() => loadStoredData(STORAGE_KEYS.SETTINGS, initialCompanySettings));
  const [stats, setStats] = useState(() => loadStoredData(STORAGE_KEYS.STATS, initialStats));

  // Global search & filter state
  const [globalSearch, setGlobalSearch] = useState('');

  // Efficient background LocalStorage syncing
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch {}
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch {}
  }, [quotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
    } catch {}
  }, [applicants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FREELANCE, JSON.stringify(freelance));
    } catch {}
  }, [freelance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    } catch {}
  }, [team]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    } catch {}
  }, [testimonials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    } catch {}
  }, [faqs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // ================= CRUD: INQUIRIES =================
  const addInquiry = useCallback((inquiryData) => {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'New',
      priority: 'Medium',
      notes: '',
      ...inquiryData,
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  }, []);

  const updateInquiry = useCallback((id, updatedFields) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const updateInquiryStatus = useCallback((id, status) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }, []);

  const deleteInquiry = useCallback((id) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: QUOTES =================
  const addQuote = useCallback((quoteData) => {
    const newQuote = {
      id: `qt-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending Review',
      urgency: 'Medium',
      ...quoteData,
    };
    setQuotes((prev) => [newQuote, ...prev]);
    return newQuote;
  }, []);

  const updateQuote = useCallback((id, updatedFields) => {
    setQuotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteQuote = useCallback((id) => {
    setQuotes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: JOBS =================
  const addJob = useCallback((jobData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
      applicantsCount: 0,
      responsibilities: [],
      requirements: [],
      ...jobData,
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  }, []);

  const updateJob = useCallback((id, updatedFields) => {
    setJobs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const toggleJobStatus = useCallback((id) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, status: job.status === 'Active' ? 'Paused' : 'Active' }
          : job
      )
    );
  }, []);

  const deleteJob = useCallback((id) => {
    setJobs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: APPLICANTS =================
  const addApplicant = useCallback((applicantData) => {
    const newApplicant = {
      id: `app-${Date.now()}`,
      appliedAt: new Date().toISOString(),
      stage: 'Under Review',
      rating: 4,
      notes: '',
      ...applicantData,
    };
    setApplicants((prev) => [newApplicant, ...prev]);
    return newApplicant;
  }, []);

  const updateApplicant = useCallback((id, updatedFields) => {
    setApplicants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const updateApplicantStage = useCallback((id, stage) => {
    setApplicants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stage } : item))
    );
  }, []);

  const deleteApplicant = useCallback((id) => {
    setApplicants((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: FREELANCE =================
  const addFreelance = useCallback((gigData) => {
    const newGig = {
      id: `fl-${Date.now()}`,
      postedAt: new Date().toISOString(),
      status: 'Open',
      proposalsCount: 0,
      skills: [],
      ...gigData,
    };
    setFreelance((prev) => [newGig, ...prev]);
    return newGig;
  }, []);

  const updateFreelance = useCallback((id, updatedFields) => {
    setFreelance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const toggleFreelanceStatus = useCallback((id) => {
    setFreelance((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Open' ? 'Closed' : 'Open' }
          : item
      )
    );
  }, []);

  const deleteFreelance = useCallback((id) => {
    setFreelance((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: SERVICES =================
  const addService = useCallback((serviceData) => {
    const newService = {
      id: `svc-${Date.now()}`,
      features: [],
      tags: [],
      badge: 'New',
      ...serviceData,
    };
    setServices((prev) => [newService, ...prev]);
    return newService;
  }, []);

  const updateService = useCallback((id, updatedFields) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteService = useCallback((id) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: TEAM =================
  const addTeamMember = useCallback((memberData) => {
    const newMember = {
      id: `team-${Date.now()}`,
      socials: { linkedin: '#', github: '#', twitter: '#' },
      specialties: [],
      ...memberData,
    };
    setTeam((prev) => [newMember, ...prev]);
    return newMember;
  }, []);

  const updateTeamMember = useCallback((id, updatedFields) => {
    setTeam((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteTeamMember = useCallback((id) => {
    setTeam((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: TESTIMONIALS =================
  const addTestimonial = useCallback((testimonialData) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      rating: 5,
      isApproved: true,
      isFeatured: false,
      date: new Date().toISOString().split('T')[0],
      ...testimonialData,
    };
    setTestimonials((prev) => [newReview, ...prev]);
    return newReview;
  }, []);

  const updateTestimonial = useCallback((id, updatedFields) => {
    setTestimonials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteTestimonial = useCallback((id) => {
    setTestimonials((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= CRUD: FAQS =================
  const addFaq = useCallback((faqData) => {
    const newFaq = {
      id: `faq-${Date.now()}`,
      category: 'General',
      ...faqData,
    };
    setFaqs((prev) => [...prev, newFaq]);
    return newFaq;
  }, []);

  const updateFaq = useCallback((id, updatedFields) => {
    setFaqs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteFaq = useCallback((id) => {
    setFaqs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ================= SETTINGS & STATS =================
  const updateSettings = useCallback((updatedFields) => {
    setSettings((prev) => ({ ...prev, ...updatedFields }));
  }, []);

  const updateStats = useCallback((updatedFields) => {
    setStats((prev) => ({ ...prev, ...updatedFields }));
  }, []);

  // Reset all admin data to seed defaults
  const resetToDefaults = useCallback(() => {
    setInquiries(initialInquiries);
    setQuotes(initialQuotes);
    setJobs(initialJobs);
    setApplicants(initialApplicants);
    setFreelance(initialFreelance);
    setServices(initialServices);
    setTeam(initialTeam);
    setTestimonials(initialTestimonials);
    setFaqs(initialFaqs);
    setSettings(initialCompanySettings);
    setStats(initialStats);
    localStorage.clear();
  }, []);

  // Quick summary counts for Header & Sidebar
  const summaryCounts = useMemo(() => {
    const newInquiries = inquiries.filter((i) => i.status === 'New').length;
    const pendingQuotes = quotes.filter((q) => q.status === 'Pending Review').length;
    const activeJobs = jobs.filter((j) => j.status === 'Active').length;
    const pendingApplicants = applicants.filter(
      (a) => a.stage === 'Under Review' || a.stage === 'Applied'
    ).length;
    const pendingReviews = testimonials.filter((t) => !t.isApproved).length;

    return {
      newInquiries,
      pendingQuotes,
      activeJobs,
      pendingApplicants,
      pendingReviews,
      totalLeads: inquiries.length + quotes.length,
    };
  }, [inquiries, quotes, jobs, applicants, testimonials]);

  // Memoize entire value object to prevent re-renders
  const contextValue = useMemo(
    () => ({
      // Data states
      inquiries,
      quotes,
      jobs,
      applicants,
      freelance,
      services,
      team,
      testimonials,
      faqs,
      settings,
      stats,
      summaryCounts,

      // Global search
      globalSearch,
      setGlobalSearch,

      // Inquiries Actions
      addInquiry,
      updateInquiry,
      updateInquiryStatus,
      deleteInquiry,

      // Quotes Actions
      addQuote,
      updateQuote,
      deleteQuote,

      // Jobs Actions
      addJob,
      updateJob,
      toggleJobStatus,
      deleteJob,

      // Applicants Actions
      addApplicant,
      updateApplicant,
      updateApplicantStage,
      deleteApplicant,

      // Freelance Actions
      addFreelance,
      updateFreelance,
      toggleFreelanceStatus,
      deleteFreelance,

      // Services Actions
      addService,
      updateService,
      deleteService,

      // Team Actions
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,

      // Testimonials Actions
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,

      // FAQs Actions
      addFaq,
      updateFaq,
      deleteFaq,

      // Settings & Stats
      updateSettings,
      updateStats,
      resetToDefaults,
    }),
    [
      inquiries,
      quotes,
      jobs,
      applicants,
      freelance,
      services,
      team,
      testimonials,
      faqs,
      settings,
      stats,
      summaryCounts,
      globalSearch,
      addInquiry,
      updateInquiry,
      updateInquiryStatus,
      deleteInquiry,
      addQuote,
      updateQuote,
      deleteQuote,
      addJob,
      updateJob,
      toggleJobStatus,
      deleteJob,
      addApplicant,
      updateApplicant,
      updateApplicantStage,
      deleteApplicant,
      addFreelance,
      updateFreelance,
      toggleFreelanceStatus,
      deleteFreelance,
      addService,
      updateService,
      deleteService,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addFaq,
      updateFaq,
      deleteFaq,
      updateSettings,
      updateStats,
      resetToDefaults,
    ]
  );

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
