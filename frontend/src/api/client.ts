const BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('repairtrust_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('repairtrust_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('repairtrust_token');
};

/**
 * Builds a clean query string omitting undefined, null, empty strings,
 * and stringified "undefined" / "null" values.
 */
export const toQueryString = (params: Record<string, any> = {}): string => {
  const cleanParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'undefined' &&
      value !== 'null'
    ) {
      cleanParams[key] = String(value);
    }
  }
  const qs = new URLSearchParams(cleanParams).toString();
  return qs ? `?${qs}` : '';
};

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Clear expired or invalid credentials
      removeAuthToken();
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth
  auth: {
    login: (body: any) => apiRequest<{ success: boolean; token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => apiRequest<{ success: boolean; token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    demoLogin: (role: string) => apiRequest<{ success: boolean; token: string; user: any }>('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
    me: () => apiRequest<{ success: boolean; user: any }>('/auth/me')
  },

  // Assets
  assets: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/assets${toQueryString(params)}`);
    },
    get: (assetId: string) => apiRequest<{ success: boolean; data: any }>(`/assets/${assetId}`),
    create: (body: any) => apiRequest<{ success: boolean; data: any }>('/assets', { method: 'POST', body: JSON.stringify(body) }),
    update: (assetId: string, body: any) => apiRequest<{ success: boolean; data: any }>(`/assets/${assetId}`, { method: 'PUT', body: JSON.stringify(body) }),
    getMemoryGraph: (assetId: string) => apiRequest<{ success: boolean; data: any }>(`/assets/${assetId}/memory-graph`),
    getRootCause: (assetId: string) => apiRequest<{ success: boolean; data: any }>(`/assets/${assetId}/root-cause`)
  },

  // Complaints
  complaints: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/complaints${toQueryString(params)}`);
    },
    get: (complaintId: string) => apiRequest<{ success: boolean; data: any }>(`/complaints/${complaintId}`),
    v1Get: (complaintId: string) => apiRequest<{ success: boolean; data: any }>(`/v1/complaints/${complaintId}`),
    submit: (body: any) => apiRequest<{ success: boolean; data: any; message: string; evidenceScreening?: any }>('/complaints', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    submitV1: (formData: FormData) => apiRequest<{ success: boolean; data: any; message: string; evidenceScreening?: any }>('/v1/complaints', { method: 'POST', body: formData }),
    updateStatus: (complaintId: string, body: any) => apiRequest<{ success: boolean; data: any }>(`/complaints/${complaintId}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
    markDuplicate: (complaintId: string, body: any) => apiRequest<{ success: boolean; data: any }>(`/complaints/${complaintId}/duplicate`, { method: 'POST', body: JSON.stringify(body) }),
    track: (complaintId: string) => apiRequest<{ success: boolean; data: any }>(`/complaints/track/${complaintId}`),
    reverseGeocode: (lat: number, lng: number) =>
      apiRequest<{
        success: boolean;
        data: {
          street: string;
          rawRoad: string;
          locality: string;
          landmark: string;
          fullAddress: string;
          city: string;
          postcode: string;
        };
      }>(`/v1/complaints/reverse-geocode?lat=${lat}&lng=${lng}`),
    myComplaints: () => apiRequest<{ success: boolean; data: any[]; pagination: any }>('/v1/complaints?myComplaints=true'),
    getEvents: (complaintId: string) => apiRequest<{ success: boolean; chainIntegrity: any; events: any[] }>(`/v1/complaints/${complaintId}/events`),
    dispute: (complaintId: string, body: any) => apiRequest<{ success: boolean; message: string; data: any }>(`/v1/complaints/${complaintId}/dispute`, { method: 'POST', body: JSON.stringify(body) }),
    reopen: (complaintId: string, body: any) => apiRequest<{ success: boolean; message: string; complaint: any; followUpComplaint: any }>(`/v1/complaints/${complaintId}/reopen`, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    feedback: (complaintId: string, body: any) => apiRequest<{ success: boolean; message: string; data: any }>(`/v1/complaints/${complaintId}/feedback`, { method: 'POST', body: JSON.stringify(body) }),
    verifyRepair: (complaintId: string, body: any) => apiRequest<{ success: boolean; message: string; data: any }>(`/v1/complaints/${complaintId}/verify-repair`, { method: 'POST', body: JSON.stringify(body) })
  },

  // Notifications
  notifications: {
    list: () => apiRequest<{ success: boolean; data: any[]; unreadCount: number }>('/v1/notifications'),
    markRead: (id: string) => apiRequest<{ success: boolean; data: any }>(`/v1/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => apiRequest<{ success: boolean; message: string }>('/v1/notifications/mark-all-read', { method: 'POST' })
  },

  // Users & Profiles
  users: {
    getProfile: () => apiRequest<{ success: boolean; data: any }>('/users/profile'),
    updateProfile: (body: any) => apiRequest<{ success: boolean; message: string; data: any }>('/users/profile', { method: 'PUT', body: JSON.stringify(body) })
  },

  // Work Orders
  workOrders: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/work-orders${toQueryString(params)}`);
    },
    myTasks: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/work-orders${toQueryString({ ...params, myTasks: 'true' })}`);
    },
    get: (workOrderId: string) => apiRequest<{ success: boolean; data: any; auditorEvaluation: any }>(`/work-orders/${workOrderId}`),
    create: (body: any) => apiRequest<{ success: boolean; data: any }>('/work-orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (workOrderId: string, body: { status: string; pauseReason?: string; note?: string }) =>
      apiRequest<{ success: boolean; data: any; auditorEvaluation: any }>(`/work-orders/${workOrderId}/status`, { method: 'PUT', body: JSON.stringify(body) }),
    updateProgress: (workOrderId: string, body: any) => apiRequest<{ success: boolean; data: any; auditorEvaluation: any }>(`/work-orders/${workOrderId}/progress`, { method: 'PUT', body: JSON.stringify(body) }),
    updateMaterials: (workOrderId: string, body: { materialsUsed?: any[]; completionNotes?: string }) =>
      apiRequest<{ success: boolean; data: any; auditorEvaluation: any }>(`/work-orders/${workOrderId}/materials`, { method: 'PUT', body: JSON.stringify(body) }),
    checkIn: (workOrderId: string, body: { coordinates?: any; isManualEntry?: boolean; manualReason?: string; notes?: string; type?: string }) =>
      apiRequest<{ success: boolean; data: any; checkIn: any; message: string }>(`/work-orders/${workOrderId}/check-in`, { method: 'POST', body: JSON.stringify(body) }),
    addEvidence: (workOrderId: string, body: any) =>
      apiRequest<{ success: boolean; data: any; auditorEvaluation: any; addedItems?: any[] }>(`/work-orders/${workOrderId}/evidence`, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
      }),
    submitForReview: (workOrderId: string) => apiRequest<{ success: boolean; data: any; auditorEvaluation: any; message: string }>(`/work-orders/${workOrderId}/submit`, { method: 'POST' }),
    submitRevision: (workOrderId: string, body: { notes: string }) =>
      apiRequest<{ success: boolean; message: string; data: any }>(`/work-orders/${workOrderId}/revision`, { method: 'POST', body: JSON.stringify(body) }),
    review: (workOrderId: string, body: any) => apiRequest<{ success: boolean; data: any; message: string }>(`/work-orders/${workOrderId}/review`, { method: 'POST', body: JSON.stringify(body) }),
    reopen: (workOrderId: string, body: { reason: string }) => apiRequest<{ success: boolean; data: any; message: string }>(`/work-orders/${workOrderId}/reopen`, { method: 'POST', body: JSON.stringify(body) }),
    audit: (workOrderId: string) => apiRequest<{ success: boolean; data: any }>(`/work-orders/${workOrderId}/audit`)
  },

  // LiveWork Proof Videos
  videos: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[] }>(`/videos${toQueryString(params)}`);
    },
    get: (videoId: string) => apiRequest<{ success: boolean; data: any }>(`/videos/${videoId}`),
    upload: (formData: FormData) => apiRequest<{ success: boolean; data: any; message: string }>('/videos/upload', { method: 'POST', body: formData }),
    review: (videoId: string, body: any) => apiRequest<{ success: boolean; data: any }>(`/videos/${videoId}/review`, { method: 'PATCH', body: JSON.stringify(body) })
  },

  // Inspections
  inspections: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/inspections${toQueryString(params)}`);
    },
    create: (body: any) => apiRequest<{ success: boolean; data: any }>('/inspections', { method: 'POST', body: JSON.stringify(body) })
  },

  // Investigations
  investigations: {
    list: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[] }>(`/investigations${toQueryString(params)}`);
    },
    get: (assetId: string) => apiRequest<{ success: boolean; data: any }>(`/investigations/${assetId}`),
    resolve: (assetId: string, body: any) => apiRequest<{ success: boolean; data: any }>(`/investigations/${assetId}/resolve`, { method: 'POST', body: JSON.stringify(body) })
  },

  // Analytics
  analytics: {
    get: (observationWindowDays = 60) => apiRequest<{ success: boolean; data: any }>(`/analytics?observationWindowDays=${observationWindowDays}`)
  },

  // AI & ML
  ai: {
    getMetrics: () => apiRequest<{ success: boolean; data: any; source: string }>('/ai/metrics'),
    predictRisk: (body: any) => apiRequest<{ success: boolean; data: any }>('/ai/predict-risk', { method: 'POST', body: JSON.stringify(body) }),
    detectAnomalies: () => apiRequest<{ success: boolean; data: any }>('/ai/detect-anomalies', { method: 'POST' })
  },

  // Audit Logs
  auditLogs: {
    list: (limit = 50) => apiRequest<{ success: boolean; data: any[] }>(`/audit-logs?limit=${limit}`)
  },

  // Reports & Compliance Exports
  reports: {
    summary: () => apiRequest<{ success: boolean; data: any }>('/reports/summary'),
    export: async (body: { dataset: string; format?: string; filters?: any }) => {
      const token = getAuthToken();
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Export request failed' }));
        throw new Error(err.message || 'Export failed');
      }
      if (body.format === 'json') {
        return await res.json();
      }
      return await res.blob();
    }
  },

  // Demo
  demo: {
    reset: () => apiRequest<{ success: boolean; message: string }>('/demo/reset', { method: 'POST' })
  },

  // Administrator Core Management
  admin: {
    getOverview: () => apiRequest<{ success: boolean; data: any }>('/v1/admin/overview'),
    getUsers: (params: Record<string, any> = {}) => {
      return apiRequest<{ success: boolean; data: any[] }>(`/v1/admin/users${toQueryString(params)}`);
    },
    createUser: (body: any) =>
      apiRequest<{ success: boolean; message: string; data: any }>('/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    updateUserRole: (id: string, body: any) =>
      apiRequest<{ success: boolean; message: string; data: any }>(`/v1/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      }),
    getConfig: () => apiRequest<{ success: boolean; data: any }>('/v1/admin/config'),
    updateConfig: (section: string, body: any) =>
      apiRequest<{ success: boolean; message: string; data: any }>(`/v1/admin/config/${section}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      }),
    getDataQuality: () =>
      apiRequest<{ success: boolean; summary: any; data: any[] }>('/v1/admin/data-quality'),
    getSystemHealth: () => apiRequest<{ success: boolean; data: any }>('/v1/admin/system-health'),
    triggerBackup: () =>
      apiRequest<{ success: boolean; message: string; data: any }>('/v1/admin/backup/trigger', {
        method: 'POST'
      }),
    getAiModels: () => apiRequest<{ success: boolean; data: any }>('/v1/admin/ai-models')
  }
};
