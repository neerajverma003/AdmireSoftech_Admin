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
import { apiRequest } from '../api/client';

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
  const [inquiries, setInquiries] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.INQUIRIES, []);
    return Array.isArray(stored) ? stored.filter((i) => !i.id?.startsWith('inq-10')) : [];
  });
  const [quotes, setQuotes] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.QUOTES, []);
    return Array.isArray(stored) ? stored.filter((q) => !q.id?.startsWith('qt-20')) : [];
  });
  const [jobs, setJobs] = useState(() => loadStoredData(STORAGE_KEYS.JOBS, initialJobs));
  const [applicants, setApplicants] = useState(() => loadStoredData(STORAGE_KEYS.APPLICANTS, initialApplicants));
  const [freelance, setFreelance] = useState(() => loadStoredData(STORAGE_KEYS.FREELANCE, initialFreelance));
  const [services, setServices] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.SERVICES, []);
    return Array.isArray(stored) ? stored.filter((s) => !s.id?.startsWith('svc-')) : [];
  });
  const [team, setTeam] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.TEAM, []);
    return Array.isArray(stored) ? stored.filter((t) => !t.id?.startsWith('team-') && !t.id?.startsWith('allen-')) : [];
  });
  const [testimonials, setTestimonials] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.TESTIMONIALS, []);
    return Array.isArray(stored) ? stored.filter((t) => !t.id?.startsWith('rev-')) : [];
  });
  const [faqs, setFaqs] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.FAQS, []);
    return Array.isArray(stored) ? stored.filter((f) => !f.id?.startsWith('faq-')) : [];
  });
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

  // Fetch inquiries from backend on mount
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await apiRequest('/inquiries');
      if (res && res.inquiries) {
        const mapped = res.inquiries.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setInquiries(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch inquiries from backend, using local state:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // ================= CRUD: INQUIRIES =================
  const addInquiry = useCallback(async (inquiryData) => {
    try {
      const res = await apiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiryData),
      });
      const created = res?.inquiry
        ? { ...res.inquiry, id: res.inquiry._id }
        : { id: `inq-${Date.now()}`, createdAt: new Date().toISOString(), status: 'New', priority: 'Medium', notes: '', ...inquiryData };
      setInquiries((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      const fallback = {
        id: `inq-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'New',
        priority: 'Medium',
        notes: '',
        ...inquiryData,
      };
      setInquiries((prev) => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateInquiry = useCallback(async (id, updatedFields) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? { ...item, ...updatedFields } : item))
    );
    try {
      await apiRequest(`/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.warn('[Admin Data] Backend inquiry update failed:', e.message);
    }
  }, []);

  const updateInquiryStatus = useCallback(async (id, status) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? { ...item, status } : item))
    );
    try {
      await apiRequest(`/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn('[Admin Data] Backend inquiry status update failed:', e.message);
    }
  }, []);

  const deleteInquiry = useCallback(async (id) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/inquiries/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend inquiry delete failed:', e.message);
    }
  }, []);

  // Fetch quotes from backend on mount
  const fetchQuotes = useCallback(async () => {
    try {
      const res = await apiRequest('/quotes');
      if (res && res.quotes) {
        const mapped = res.quotes.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setQuotes(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch quotes from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // ================= CRUD: QUOTES =================
  const addQuote = useCallback(async (quoteData) => {
    try {
      const res = await apiRequest('/quotes', {
        method: 'POST',
        body: JSON.stringify(quoteData),
      });
      const created = res?.quote
        ? { ...res.quote, id: res.quote._id }
        : { id: `qt-${Date.now()}`, submittedAt: new Date().toISOString(), status: 'Pending Review', urgency: 'Medium', ...quoteData };
      setQuotes((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      const fallback = {
        id: `qt-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'Pending Review',
        urgency: 'Medium',
        ...quoteData,
      };
      setQuotes((prev) => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateQuote = useCallback(async (id, updatedFields) => {
    setQuotes((prev) =>
      prev.map((item) => (item.id === id || item._id === id ? { ...item, ...updatedFields } : item))
    );
    try {
      await apiRequest(`/quotes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.warn('[Admin Data] Backend quote update failed:', e.message);
    }
  }, []);

  const deleteQuote = useCallback(async (id) => {
    setQuotes((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/quotes/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend quote delete failed:', e.message);
    }
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

  // Fetch services from backend on mount
  const fetchServices = useCallback(async () => {
    try {
      const res = await apiRequest('/services?includeInactive=true');
      if (res && res.services) {
        const mapped = res.services.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setServices(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch services from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ================= CRUD: SERVICES =================
  const addService = useCallback(async (serviceData) => {
    try {
      const res = await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
      if (!res || !res.service) {
        throw new Error(res?.message || 'Failed to create service in database');
      }
      const created = { ...res.service, id: res.service._id };
      setServices((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add service failed:', e);
      throw e;
    }
  }, []);

  const updateService = useCallback(async (id, updatedFields) => {
    try {
      let res;
      // If updating an unsaved item that starts with svc-, POST it to MongoDB
      if (typeof id === 'string' && id.startsWith('svc-')) {
        res = await apiRequest('/services', {
          method: 'POST',
          body: JSON.stringify(updatedFields),
        });
      } else {
        res = await apiRequest(`/services/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updatedFields),
        });
      }

      if (!res || !res.service) {
        throw new Error(res?.message || 'Failed to update service in database');
      }

      const updated = { ...res.service, id: res.service._id };
      setServices((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend service update failed:', e);
      throw e;
    }
  }, []);

  const deleteService = useCallback(async (id) => {
    setServices((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    if (typeof id === 'string' && id.startsWith('svc-')) return;
    try {
      await apiRequest(`/services/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend service delete failed:', e.message);
      throw e;
    }
  }, []);

  // Fetch team from backend on mount
  const fetchTeam = useCallback(async () => {
    try {
      const res = await apiRequest('/team?includeInactive=true');
      if (res && res.team) {
        const mapped = res.team.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setTeam(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch team from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // ================= CRUD: TEAM =================
  const addTeamMember = useCallback(async (memberData) => {
    try {
      const res = await apiRequest('/team', {
        method: 'POST',
        body: JSON.stringify(memberData),
      });
      if (!res || !res.member) {
        throw new Error(res?.message || 'Failed to create team member in database');
      }
      const created = { ...res.member, id: res.member._id || res.member.id };
      setTeam((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add team member failed:', e);
      throw e;
    }
  }, []);

  const updateTeamMember = useCallback(async (id, updatedFields) => {
    try {
      const target = team.find((t) => t.id === id || t._id === id);
      const mongoId = target?._id || (typeof id === 'string' && !id.startsWith('team-') && !id.startsWith('allen-') ? id : null);

      let res;
      if (mongoId) {
        res = await apiRequest(`/team/${mongoId}`, {
          method: 'PATCH',
          body: JSON.stringify(updatedFields),
        });
      } else {
        res = await apiRequest('/team', {
          method: 'POST',
          body: JSON.stringify(updatedFields),
        });
      }

      if (!res || !res.member) {
        throw new Error(res?.message || 'Failed to update team member in database');
      }

      const updated = { ...res.member, id: res.member._id || res.member.id };
      setTeam((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend team member update failed:', e);
      throw e;
    }
  }, [team]);

  const deleteTeamMember = useCallback(async (id) => {
    const target = team.find((t) => t.id === id || t._id === id);
    const mongoId = target?._id || target?.id || id;

    setTeam((prev) =>
      prev.filter((item) => item.id !== id && item._id !== id && item.id !== mongoId && item._id !== mongoId)
    );

    if (mongoId && !mongoId.toString().startsWith('team-') && !mongoId.toString().startsWith('allen-')) {
      try {
        await apiRequest(`/team/${mongoId}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('[Admin Data] Backend team delete failed:', e.message);
        throw e;
      }
    }
  }, [team]);

  // Fetch testimonials from backend on mount
  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await apiRequest('/testimonials?includeUnapproved=true');
      if (res && res.testimonials) {
        const mapped = res.testimonials.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setTestimonials(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch testimonials from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // ================= CRUD: TESTIMONIALS =================
  const addTestimonial = useCallback(async (testimonialData) => {
    try {
      const res = await apiRequest('/testimonials', {
        method: 'POST',
        body: JSON.stringify(testimonialData),
      });
      if (!res || !res.testimonial) {
        throw new Error(res?.message || 'Failed to create testimonial in database');
      }
      const created = { ...res.testimonial, id: res.testimonial._id || res.testimonial.id };
      setTestimonials((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add testimonial failed:', e);
      throw e;
    }
  }, []);

  const updateTestimonial = useCallback(async (id, updatedFields) => {
    try {
      const target = testimonials.find((t) => t.id === id || t._id === id);
      const mongoId = target?._id || (typeof id === 'string' && !id.startsWith('rev-') ? id : null);

      let res;
      if (mongoId) {
        res = await apiRequest(`/testimonials/${mongoId}`, {
          method: 'PATCH',
          body: JSON.stringify(updatedFields),
        });
      } else {
        res = await apiRequest('/testimonials', {
          method: 'POST',
          body: JSON.stringify(updatedFields),
        });
      }

      if (!res || !res.testimonial) {
        throw new Error(res?.message || 'Failed to update testimonial in database');
      }

      const updated = { ...res.testimonial, id: res.testimonial._id || res.testimonial.id };
      setTestimonials((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend testimonial update failed:', e);
      throw e;
    }
  }, [testimonials]);

  const deleteTestimonial = useCallback(async (id) => {
    const target = testimonials.find((t) => t.id === id || t._id === id);
    const mongoId = target?._id || target?.id || id;

    setTestimonials((prev) =>
      prev.filter((item) => item.id !== id && item._id !== id && item.id !== mongoId && item._id !== mongoId)
    );

    if (mongoId && !mongoId.toString().startsWith('rev-')) {
      try {
        await apiRequest(`/testimonials/${mongoId}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('[Admin Data] Backend testimonial delete failed:', e.message);
        throw e;
      }
    }
  }, [testimonials]);

  // Fetch FAQs from backend on mount
  const fetchFaqs = useCallback(async () => {
    try {
      const res = await apiRequest('/faqs?includeInactive=true');
      if (res && res.faqs) {
        const mapped = res.faqs.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setFaqs(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch FAQs from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // ================= CRUD: FAQS =================
  const addFaq = useCallback(async (faqData) => {
    try {
      const res = await apiRequest('/faqs', {
        method: 'POST',
        body: JSON.stringify(faqData),
      });
      if (!res || !res.faq) {
        throw new Error(res?.message || 'Failed to create FAQ in database');
      }
      const created = { ...res.faq, id: res.faq._id || res.faq.id };
      setFaqs((prev) => [...prev, created]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add FAQ failed:', e);
      throw e;
    }
  }, []);

  const updateFaq = useCallback(async (id, updatedFields) => {
    try {
      const target = faqs.find((f) => f.id === id || f._id === id);
      const mongoId = target?._id || (typeof id === 'string' && !id.startsWith('faq-') ? id : null);

      let res;
      if (mongoId) {
        res = await apiRequest(`/faqs/${mongoId}`, {
          method: 'PATCH',
          body: JSON.stringify(updatedFields),
        });
      } else {
        res = await apiRequest('/faqs', {
          method: 'POST',
          body: JSON.stringify(updatedFields),
        });
      }

      if (!res || !res.faq) {
        throw new Error(res?.message || 'Failed to update FAQ in database');
      }

      const updated = { ...res.faq, id: res.faq._id || res.faq.id };
      setFaqs((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend FAQ update failed:', e);
      throw e;
    }
  }, [faqs]);

  const deleteFaq = useCallback(async (id) => {
    const target = faqs.find((f) => f.id === id || f._id === id);
    const mongoId = target?._id || target?.id || id;

    setFaqs((prev) =>
      prev.filter((item) => item.id !== id && item._id !== id && item.id !== mongoId && item._id !== mongoId)
    );

    if (mongoId && !mongoId.toString().startsWith('faq-')) {
      try {
        await apiRequest(`/faqs/${mongoId}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('[Admin Data] Backend FAQ delete failed:', e.message);
        throw e;
      }
    }
  }, [faqs]);

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
      fetchInquiries,
      addInquiry,
      updateInquiry,
      updateInquiryStatus,
      deleteInquiry,

      // Quotes Actions
      fetchQuotes,
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
      fetchServices,
      addService,
      updateService,
      deleteService,

      // Team Actions
      fetchTeam,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,

      // Testimonials Actions
      fetchTestimonials,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,

      // FAQs Actions
      fetchFaqs,
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
      fetchInquiries,
      addInquiry,
      updateInquiry,
      updateInquiryStatus,
      deleteInquiry,
      fetchQuotes,
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
      fetchServices,
      addService,
      updateService,
      deleteService,
      fetchTeam,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      fetchTestimonials,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      fetchFaqs,
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
