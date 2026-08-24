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
import { fetchCompanySettings, updateCompanySettings } from '../api/settingsApi';

const AdminDataContext = createContext(null);

const STORAGE_KEYS = {
  INQUIRIES: 'admire_admin_inquiries',
  QUOTES: 'admire_admin_quotes',
  JOBS: 'admire_admin_jobs',
  APPLICANTS: 'admire_admin_applicants',
  FREELANCE: 'admire_admin_freelance',
  SERVICES: 'admire_admin_services',
  INDUSTRIES: 'admire_admin_industries',
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
  const [jobs, setJobs] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.JOBS, []);
    return Array.isArray(stored) ? stored.filter((j) => !j.id?.startsWith('job-30')) : [];
  });
  const [applicants, setApplicants] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.APPLICANTS, []);
    return Array.isArray(stored)
      ? stored.filter((a) => !a.id?.startsWith('app-50') && !a.id?.startsWith('app-'))
      : [];
  });
  const [freelance, setFreelance] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.FREELANCE, []);
    return Array.isArray(stored)
      ? stored.filter(
          (fl) =>
            !fl.id?.startsWith('fl-') &&
            !fl.id?.startsWith('cloud-') &&
            !fl.id?.startsWith('devops-') &&
            !fl.id?.startsWith('ai-ml-') &&
            !fl.id?.startsWith('fullstack-') &&
            !fl.id?.startsWith('postgres-') &&
            !fl.id?.startsWith('sre-') &&
            !fl.id?.startsWith('ui-ux-')
        )
      : [];
  });
  const [services, setServices] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.SERVICES, []);
    return Array.isArray(stored) ? stored.filter((s) => !s.id?.startsWith('svc-')) : [];
  });
  const [industries, setIndustries] = useState(() => {
    const stored = loadStoredData(STORAGE_KEYS.INDUSTRIES, []);
    return Array.isArray(stored) ? stored : [];
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
      localStorage.setItem(STORAGE_KEYS.INDUSTRIES, JSON.stringify(industries));
    } catch {}
  }, [industries]);

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

  // Sync settings and stats from backend on mount
  useEffect(() => {
    fetchCompanySettings()
      .then((remoteSettings) => {
        if (remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
          if (remoteSettings.stats) {
            setStats((prev) => ({ ...prev, ...remoteSettings.stats }));
          }
        }
      })
      .catch((err) => {
        console.warn('[AdminDataContext] Remote settings fetch fallback:', err.message);
      });
  }, []);

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

  // ================= FETCH: JOBS & APPLICANTS =================
  const fetchJobs = useCallback(async () => {
    try {
      const res = await apiRequest('/jobs?includeInactive=true');
      if (res && res.jobs) {
        const mapped = res.jobs.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setJobs(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch jobs from backend:', e.message);
    }
  }, []);

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await apiRequest('/jobs/applicants/all');
      if (res && res.applicants) {
        const mapped = res.applicants.map((item) => ({
          ...item,
          id: item._id || item.id,
          appliedAt: item.appliedAt || item.createdAt,
        }));
        setApplicants(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch applicants from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
  }, [fetchJobs, fetchApplicants]);

  // ================= CRUD: JOBS =================
  const addJob = useCallback(async (jobData) => {
    try {
      const res = await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      if (!res || !res.job) {
        throw new Error(res?.message || 'Failed to create job in database');
      }
      const created = { ...res.job, id: res.job._id || res.job.id };
      setJobs((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add job failed:', e);
      throw e;
    }
  }, []);

  const updateJob = useCallback(async (id, updatedFields) => {
    try {
      const res = await apiRequest(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
      if (!res || !res.job) {
        throw new Error(res?.message || 'Failed to update job in database');
      }
      const updated = { ...res.job, id: res.job._id || res.job.id };
      setJobs((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend job update failed:', e);
      throw e;
    }
  }, []);

  const toggleJobStatus = useCallback(async (id) => {
    const target = jobs.find((j) => j.id === id || j._id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Paused' : 'Active';
    try {
      const res = await apiRequest(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, activeStatus: newStatus === 'Active' }),
      });
      if (res && res.job) {
        const updated = { ...res.job, id: res.job._id || res.job.id };
        setJobs((prev) =>
          prev.map((j) => (j.id === id || j._id === id ? updated : j))
        );
      }
    } catch (e) {
      console.warn('[Admin Data] Backend job toggle status failed:', e.message);
    }
  }, [jobs]);

  const deleteJob = useCallback(async (id) => {
    setJobs((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/jobs/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend job delete failed:', e.message);
      throw e;
    }
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

  const updateApplicant = useCallback(async (id, updatedFields) => {
    try {
      const res = await apiRequest(`/jobs/applicants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
      if (res && res.applicant) {
        const updated = { ...res.applicant, id: res.applicant._id || res.applicant.id };
        setApplicants((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? updated : item))
        );
        return updated;
      }
    } catch (e) {
      console.error('[Admin Data] Backend applicant update failed:', e);
      throw e;
    }
  }, []);

  const updateApplicantStage = useCallback(async (id, stage) => {
    try {
      const res = await apiRequest(`/jobs/applicants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      if (res && res.applicant) {
        const updated = { ...res.applicant, id: res.applicant._id || res.applicant.id };
        setApplicants((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? updated : item))
        );
      }
    } catch (e) {
      console.error('[Admin Data] Backend applicant stage update failed:', e);
    }
  }, []);

  const deleteApplicant = useCallback(async (id) => {
    setApplicants((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/jobs/applicants/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend applicant delete failed:', e.message);
      throw e;
    }
  }, []);

  // Fetch freelance gigs from backend on mount
  const fetchFreelance = useCallback(async () => {
    try {
      const res = await apiRequest('/freelance?includeInactive=true');
      if (res && (res.gigs || res.freelance)) {
        const list = res.gigs || res.freelance || [];
        const mapped = list.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setFreelance(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch freelance gigs from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchFreelance();
  }, [fetchFreelance]);

  // ================= CRUD: FREELANCE =================
  const addFreelance = useCallback(async (gigData) => {
    try {
      const res = await apiRequest('/freelance', {
        method: 'POST',
        body: JSON.stringify(gigData),
      });
      if (!res || !res.gig) {
        throw new Error(res?.message || 'Failed to create freelance project in database');
      }
      const created = { ...res.gig, id: res.gig._id };
      setFreelance((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Add freelance failed:', e);
      throw e;
    }
  }, []);

  const updateFreelance = useCallback(async (id, updatedFields) => {
    try {
      const res = await apiRequest(`/freelance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
      if (res && res.gig) {
        const updated = { ...res.gig, id: res.gig._id };
        setFreelance((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? updated : item))
        );
        return updated;
      }
    } catch (e) {
      console.error('[Admin Data] Update freelance failed:', e);
      throw e;
    }
  }, []);

  const toggleFreelanceStatus = useCallback(async (id) => {
    const target = freelance.find((f) => f.id === id || f._id === id);
    if (!target) return;
    const nextStatus = !target.activeStatus;
    try {
      const res = await apiRequest(`/freelance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activeStatus: nextStatus }),
      });
      if (res && res.gig) {
        const updated = { ...res.gig, id: res.gig._id };
        setFreelance((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? updated : item))
        );
      }
    } catch (e) {
      console.error('[Admin Data] Toggle freelance status failed:', e);
      throw e;
    }
  }, [freelance]);

  const deleteFreelance = useCallback(async (id) => {
    setFreelance((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/freelance/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('[Admin Data] Delete freelance failed:', e);
      throw e;
    }
  }, []);

  const fetchProposals = useCallback(async (gigId) => {
    try {
      const endpoint = gigId ? `/freelance/${gigId}/proposals` : `/freelance/proposals/all`;
      const res = await apiRequest(endpoint);
      return res?.proposals || [];
    } catch (e) {
      console.error('[Admin Data] Fetch proposals failed:', e);
      return [];
    }
  }, []);

  const updateProposalStatus = useCallback(async (proposalId, status) => {
    try {
      const res = await apiRequest(`/freelance/proposals/${proposalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return res;
    } catch (e) {
      console.error('[Admin Data] Update proposal status failed:', e);
      throw e;
    }
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

  // Fetch industries from backend on mount
  const fetchIndustries = useCallback(async () => {
    try {
      const res = await apiRequest('/industries?includeInactive=true');
      if (res && res.industries) {
        const mapped = res.industries.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setIndustries(mapped);
      }
    } catch (e) {
      console.warn('[Admin Data] Could not fetch industries from backend:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  // ================= CRUD: INDUSTRIES =================
  const addIndustry = useCallback(async (industryData) => {
    try {
      const res = await apiRequest('/industries', {
        method: 'POST',
        body: JSON.stringify(industryData),
      });
      if (!res || !res.industry) {
        throw new Error(res?.message || 'Failed to create industry in database');
      }
      const created = { ...res.industry, id: res.industry._id || res.industry.id };
      setIndustries((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('[Admin Data] Backend industry create failed:', e);
      throw e;
    }
  }, []);

  const updateIndustry = useCallback(async (id, updates) => {
    try {
      const res = await apiRequest(`/industries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (!res || !res.industry) {
        throw new Error(res?.message || 'Failed to update industry in database');
      }
      const updated = { ...res.industry, id: res.industry._id || res.industry.id };
      setIndustries((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? updated : item))
      );
      return updated;
    } catch (e) {
      console.error('[Admin Data] Backend industry update failed:', e);
      throw e;
    }
  }, []);

  const toggleIndustryStatus = useCallback(async (id) => {
    const target = industries.find((item) => item.id === id || item._id === id);
    if (!target) return;
    const newStatus = !target.isActive;
    await updateIndustry(id, { isActive: newStatus });
  }, [industries, updateIndustry]);

  const deleteIndustry = useCallback(async (id) => {
    setIndustries((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    try {
      await apiRequest(`/industries/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[Admin Data] Backend industry delete failed:', e.message);
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
  const updateSettings = useCallback(async (updatedFields) => {
    setSettings((prev) => ({ ...prev, ...updatedFields }));
    try {
      await updateCompanySettings(updatedFields);
    } catch (e) {
      console.warn('[AdminDataContext] Backend settings save warning:', e.message);
    }
  }, []);

  const updateStats = useCallback(async (updatedStats) => {
    setStats((prev) => ({ ...prev, ...updatedStats }));
    try {
      await updateCompanySettings({ stats: updatedStats });
    } catch (e) {
      console.warn('[AdminDataContext] Backend stats save warning:', e.message);
    }
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
      industries,
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
      fetchFreelance,
      addFreelance,
      updateFreelance,
      toggleFreelanceStatus,
      deleteFreelance,
      fetchProposals,
      updateProposalStatus,

      // Services Actions
      fetchServices,
      addService,
      updateService,
      deleteService,

      // Industries Actions
      fetchIndustries,
      addIndustry,
      updateIndustry,
      toggleIndustryStatus,
      deleteIndustry,

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
      industries,
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
      fetchIndustries,
      addIndustry,
      updateIndustry,
      toggleIndustryStatus,
      deleteIndustry,
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
