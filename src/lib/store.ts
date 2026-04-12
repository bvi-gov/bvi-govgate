import { create } from 'zustand';

export type CurrentView =
  | 'public-home'
  | 'services'
  | 'service-detail'
  | 'application-form'
  | 'payment'
  | 'tracking'
  | 'my-applications'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-queue'
  | 'admin-processing'
  | 'admin-reports'
  | 'admin-certificates'
  | 'admin-scanner'
  | 'admin-import'
  | 'admin-ministries'
  | 'admin-ministry-rvipf'
  | 'admin-ministry-revenue'
  | 'admin-ministry-immigration'
  | 'admin-ministry-civil-registry'
  | 'admin-ministry-dmv'
  | 'admin-ministry-fsc'
  | 'admin-ministry-lands'
  | 'admin-officers'
  | 'admin-settings';

/**
 * Human-readable labels for every view (used in breadcrumbs).
 */
export const VIEW_LABELS: Record<CurrentView, string> = {
  'public-home': 'Home',
  'services': 'Government Services',
  'service-detail': 'Service Details',
  'application-form': 'Application Form',
  'payment': 'Payment',
  'tracking': 'Track Application',
  'my-applications': 'My Applications',
  'admin-login': 'Sign In',
  'admin-dashboard': 'Dashboard',
  'admin-queue': 'Application Queue',
  'admin-processing': 'Processing Application',
  'admin-reports': 'Reports',
  'admin-certificates': 'Certificate Generator',
  'admin-scanner': 'Document Scanner',
  'admin-import': 'Bulk Import',
  'admin-ministries': 'Ministry Center',
  'admin-ministry-rvipf': 'Royal Virgin Islands Police Force',
  'admin-ministry-revenue': 'Inland Revenue Department',
  'admin-ministry-immigration': 'Immigration Department',
  'admin-ministry-civil-registry': 'Registry of Civil Status',
  'admin-ministry-dmv': 'Department of Motor Vehicles',
  'admin-ministry-fsc': 'Financial Services Commission',
  'admin-ministry-lands': 'Lands & Survey Department',
  'admin-officers': 'Officer Management',
  'admin-settings': 'Settings',
};

interface AppState {
  // Current view state
  currentView: CurrentView;
  previousView: CurrentView | null;
  navHistory: CurrentView[];
  selectedServiceSlug: string | null;
  trackingInput: string;
  searchQuery: string;
  selectedCategory: string;

  // Admin state
  isAdminLoggedIn: boolean;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  adminDepartment: string;
  jwtToken: string | null;

  // Application state
  currentApplicationId: string | null;
  applicationStep: number;
  submittedTrackingNumber: string | null;

  // Ministry state
  activeMinistryTab: string;

  // UI state
  sidebarOpen: boolean;

  // Actions
  setCurrentView: (view: CurrentView) => void;
  goBack: () => void;
  goBackTo: (view: CurrentView) => void;
  setSelectedServiceSlug: (slug: string | null) => void;
  setTrackingInput: (input: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setAdminLoggedIn: (loggedIn: boolean, name?: string, email?: string, role?: string, department?: string, token?: string | null) => void;
  logout: () => void;
  setCurrentApplicationId: (id: string | null) => void;
  setApplicationStep: (step: number) => void;
  setSubmittedTrackingNumber: (num: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveMinistryTab: (tab: string) => void;

  // Computed-like getters
  getBreadcrumbs: () => { view: CurrentView; label: string }[];
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'public-home',
  previousView: null,
  navHistory: [],
  selectedServiceSlug: null,
  trackingInput: '',
  searchQuery: '',
  selectedCategory: 'all',

  isAdminLoggedIn: false,
  adminName: '',
  adminEmail: '',
  adminRole: '',
  adminDepartment: '',
  jwtToken: null,

  currentApplicationId: null,
  applicationStep: 0,
  submittedTrackingNumber: null,

  activeMinistryTab: 'overview',

  sidebarOpen: false,

  setCurrentView: (view) => {
    const current = get().currentView;
    // Don't push login view to history
    if (current !== 'admin-login') {
      set({
        navHistory: [...get().navHistory, current],
        previousView: current,
        currentView: view,
      });
    } else {
      set({ currentView: view });
    }
  },

  goBack: () => {
    const history = [...get().navHistory];
    const prev = history.pop();
    if (prev) {
      set({ currentView: prev, navHistory: history, previousView: history.length > 0 ? history[history.length - 1] : null });
    } else {
      set({ currentView: 'admin-dashboard', navHistory: [], previousView: null });
    }
  },

  goBackTo: (view) => {
    const history = [...get().navHistory];
    // Pop until we find the target view
    while (history.length > 0 && history[history.length - 1] !== view) {
      history.pop();
    }
    if (history.length > 0) {
      // Remove the target itself from history too
      history.pop();
      set({
        currentView: view,
        navHistory: history,
        previousView: history.length > 0 ? history[history.length - 1] : null,
      });
    } else {
      // Target not found in history, just navigate
      set({ currentView: view, navHistory: [], previousView: null });
    }
  },

  setSelectedServiceSlug: (slug) => set({ selectedServiceSlug: slug }),
  setTrackingInput: (input) => set({ trackingInput: input }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setAdminLoggedIn: (loggedIn, name = '', email = '', role = 'officer', department = '', token = null) =>
    set({
      isAdminLoggedIn: loggedIn,
      adminName: name,
      adminEmail: email,
      adminRole: role,
      adminDepartment: department,
      jwtToken: token,
      navHistory: loggedIn ? [] : get().navHistory,
    }),
  logout: () =>
    set({
      isAdminLoggedIn: false,
      adminName: '',
      adminEmail: '',
      adminRole: '',
      adminDepartment: '',
      jwtToken: null,
      currentView: 'public-home',
      previousView: null,
      navHistory: [],
    }),
  setCurrentApplicationId: (id) => set({ currentApplicationId: id }),
  setApplicationStep: (step) => set({ applicationStep: step }),
  setSubmittedTrackingNumber: (num) => set({ submittedTrackingNumber: num }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveMinistryTab: (tab) => set({ activeMinistryTab: tab }),

  getBreadcrumbs: () => {
    const { navHistory, currentView } = get();
    const crumbs: { view: CurrentView; label: string }[] = [];

    // Build full path: history + current
    for (const view of navHistory) {
      // Skip login views in breadcrumbs
      if (view !== 'admin-login' && view !== 'public-home') {
        crumbs.push({ view, label: VIEW_LABELS[view] || view });
      }
    }
    // Add current view
    if (currentView !== 'admin-login' && currentView !== 'public-home') {
      crumbs.push({ view: currentView, label: VIEW_LABELS[currentView] || currentView });
    }

    return crumbs;
  },
}));
