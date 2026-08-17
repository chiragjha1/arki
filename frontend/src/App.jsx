import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.origin.includes("localhost:5173") ? "http://localhost:8001" : "");

// Reusable SVG Icon library to replace all Unicode emojis with professional outline vectors
function Icon({ name, className = "" }) {
  const icons = {
    edit: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    trash: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
    search: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    capture: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    folder: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    "folder-open": (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    document: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    graph: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    settings: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    source: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    sun: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    moon: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    check: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    close: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    google: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="none" fill="currentColor">
        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.08-1.31-.176-1.874l-10.617-.34z" />
      </svg>
    ),
    clock: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    info: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    network: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    scan: (
      <svg className={`app-icon ${className}`} viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    )
  };
  return icons[name] || null;
}

export default function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem("arki_token") || "");
  const [email, setEmail] = useState(localStorage.getItem("arki_email") || "");
  const [isLoginView, setIsLoginView] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("arki_theme");
    return saved !== "light"; // default to true (dark mode)
  });

  // UI Navigation State
  const [currentView, setCurrentView] = useState("capture"); 
  const [activeTab, setActiveTab] = useState("capture");

  // Data State
  const [captures, setCaptures] = useState([]);
  const [resurfaced, setResurfaced] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [apiUsage, setApiUsage] = useState(null);
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState([]);
  const [stats, setStats] = useState({ total_captures: 0, category_counts: {}, active_connections: 0, ai_success_rate: 100 });
  const [trash, setTrash] = useState([]);

  // Capture Form State
  const [rawText, setRawText] = useState("");
  const [source, setSource] = useState("");
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [isSubmittingCapture, setIsSubmittingCapture] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit / Override State
  const [editingCaptureId, setEditingCaptureId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("");
  const [editTagsString, setEditTagsString] = useState("");

  // Settings State
  const [geminiApiKeys, setGeminiApiKeys] = useState([""]);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Space Sharing State
  const [shareInfo, setShareInfo] = useState({ enabled: false, token: null });
  const [sharedSpaceToken, setSharedSpaceToken] = useState(null);
  const [sharedSpaceData, setSharedSpaceData] = useState(null);
  const [sharedSearchQuery, setSharedSearchQuery] = useState("");
  const [sharedSearchResults, setSharedSearchResults] = useState(null);
  const [isSearchingShared, setIsSearchingShared] = useState(false);
  const [connectedSpaces, setConnectedSpaces] = useState([]);
  const [spaceConnections, setSpaceConnections] = useState([]);

  // Expanded Categories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem("arki_theme", newVal ? "dark" : "light");
      return newVal;
    });
  };

  // Sync body class for global theme background styling
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [isDarkMode]);

  // Helper fetch wrapper
  const apiRequest = async (path, method = "GET", body = null) => {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      method,
      headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, config);
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please log in again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Request failed");
      }
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    const path = isLoginView ? "/api/auth/login" : "/api/auth/signup";
    try {
      const data = await apiRequest(path, "POST", { email: authEmail, password: authPassword });
      if (isLoginView) {
        localStorage.setItem("arki_token", data.access_token);
        localStorage.setItem("arki_email", data.email);
        setToken(data.access_token);
        setEmail(data.email);
      } else {
        setIsLoginView(true);
        const loginData = await apiRequest("/api/auth/login", "POST", { email: authEmail, password: authPassword });
        localStorage.setItem("arki_token", loginData.access_token);
        localStorage.setItem("arki_email", loginData.email);
        setToken(loginData.access_token);
        setEmail(loginData.email);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError("");
    try {
      await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@arki.ai", password: "password123" })
      });
    } catch (err) {}
    try {
      const loginData = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@arki.ai", password: "password123" })
      }).then(res => res.json());
      
      if (loginData.access_token) {
        localStorage.setItem("arki_token", loginData.access_token);
        localStorage.setItem("arki_email", loginData.email);
        setToken(loginData.access_token);
        setEmail(loginData.email);
      } else {
        setAuthError(loginData.detail || "Demo login failed");
      }
    } catch (err) {
      setAuthError("Failed to connect to backend server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("arki_token");
    localStorage.removeItem("arki_email");
    setToken("");
    setEmail("");
    setCurrentView("capture");
    setActiveTab("capture");
  };

  // Load Data
  const loadData = async () => {
    if (!token) return;
    try {
      const [capsList, resurfacedList, notifsList, linksList, settingsList, statsList] = await Promise.all([
        apiRequest("/api/captures"),
        apiRequest("/api/resurface"),
        apiRequest("/api/notifications"),
        apiRequest("/api/links"),
        apiRequest("/api/settings"),
        apiRequest("/api/stats")
      ]);
      setCaptures(capsList);
      setResurfaced(resurfacedList);
      setNotifications(notifsList);
      setLinks(linksList);
      setSettings(settingsList);
      setStats(statsList);

      const keySetting = settingsList.find(s => s.key === "GEMINI_API_KEY");
      if (keySetting && keySetting.value) {
        const splitKeys = keySetting.value.split(",").map(k => k.trim()).filter(Boolean);
        setGeminiApiKeys(splitKeys.length > 0 ? splitKeys : [""]);
      } else {
        setGeminiApiKeys([""]);
      }

      // Safely load Gemini API usage metrics
      try {
        const usageData = await apiRequest("/api/settings/usage");
        setApiUsage(usageData);
      } catch (usageErr) {
        console.error("Failed to load Gemini usage quota", usageErr);
      }

      // Safely load space share status
      try {
        const shareData = await apiRequest("/api/shares/info");
        setShareInfo(shareData);
      } catch (shareErr) {
        console.error("Failed to load share settings", shareErr);
      }

      // Load connected spaces
      try {
        const connectedData = await apiRequest("/api/shares/connected");
        setConnectedSpaces(connectedData);
      } catch (connErr) {
        console.error("Failed to load connected spaces", connErr);
      }

      // Load who is connected to my space
      try {
        const connectionsData = await apiRequest("/api/shares/connections");
        setSpaceConnections(connectionsData);
      } catch (connsErr) {
        console.error("Failed to load audience connections", connsErr);
      }
    } catch (err) {
      console.error("Failed to load initial dashboard data", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Check URL share link query parameters on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("share");
    if (shareToken) {
      setSharedSpaceToken(shareToken);
      setCurrentView("shared-viewer");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch shared space info when token is loaded
  useEffect(() => {
    if (!sharedSpaceToken) return;
    const fetchSharedData = async () => {
      try {
        const data = await apiRequest(`/api/shares/public/${sharedSpaceToken}`);
        setSharedSpaceData(data);
        setSharedSearchResults(null);
        setSharedSearchQuery("");
      } catch (err) {
        alert("Failed to load shared space: " + err.message);
        setSharedSpaceToken(null);
        setCurrentView("capture");
      }
    };
    fetchSharedData();
  }, [sharedSpaceToken]);

  // Handle semantic search within shared space
  const handleSharedSearch = async (e) => {
    if (e) e.preventDefault();
    if (!sharedSearchQuery.trim()) {
      setSharedSearchResults(null);
      return;
    }
    setIsSearchingShared(true);
    try {
      const results = await apiRequest(`/api/shares/public/${sharedSpaceToken}/search?q=${encodeURIComponent(sharedSearchQuery)}`);
      setSharedSearchResults(results);
    } catch (err) {
      alert("Semantic search failed: " + err.message);
    } finally {
      setIsSearchingShared(false);
    }
  };

  // Polling for pending captures
  useEffect(() => {
    if (!token) return;
    const hasPending = captures.some(c => c.ai_status === "pending");
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const capsList = await apiRequest("/api/captures");
        setCaptures(capsList);
        if (!capsList.some(c => c.ai_status === "pending")) {
          const [notifsList, linksList, statsList] = await Promise.all([
            apiRequest("/api/notifications"),
            apiRequest("/api/links"),
            apiRequest("/api/stats")
          ]);
          setNotifications(notifsList);
          setLinks(linksList);
          setStats(statsList);
          
          try {
            const usageData = await apiRequest("/api/settings/usage");
            setApiUsage(usageData);
          } catch (e) {}
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [captures, token]);

  // Handle Capture Submission
  const handleCaptureSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    
    setIsSubmittingCapture(true);
    const tempId = Date.now();
    const optimisticCapture = {
      id: tempId,
      user_id: 0,
      raw_text: rawText,
      source: source || null,
      category: "General",
      sub_category: "Processing...",
      summary: "Analyzing your entry. This will refresh in a few seconds.",
      tags: [],
      ai_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setCaptures(prev => [optimisticCapture, ...prev]);
    const originalText = rawText;
    const originalSource = source;
    setRawText("");
    setSource("");
    setShowSourceInput(false);
    
    try {
      const savedCapture = await apiRequest("/api/captures", "POST", {
        raw_text: originalText,
        source: originalSource || null
      });
      setCaptures(prev => prev.map(c => c.id === tempId ? savedCapture : c));
    } catch (err) {
      console.error("Error creating capture", err);
      setCaptures(prev => prev.filter(c => c.id !== tempId));
      setRawText(originalText);
    } finally {
      setIsSubmittingCapture(false);
    }
  };

  // Soft Delete Capture
  const handleDeleteCapture = async (id) => {
    if (!confirm("Move this capture to the trash?")) return;
    try {
      await apiRequest(`/api/captures/${id}`, "DELETE");
      setCaptures(prev => prev.filter(c => c.id !== id));
      setResurfaced(prev => prev.filter(c => c.id !== id));
      loadData();
    } catch (err) {
      alert("Failed to delete capture: " + err.message);
    }
  };

  // Edit Capture
  const startEditCapture = (cap) => {
    setEditingCaptureId(cap.id);
    setEditText(cap.raw_text);
    setEditCategory(cap.category || "");
    setEditSubCategory(cap.sub_category || "");
    setEditTagsString(cap.tags ? cap.tags.join(", ") : "");
  };

  const handleUpdateCapture = async (id) => {
    try {
      const tagsList = editTagsString.split(",").map(t => t.trim()).filter(Boolean);
      const updated = await apiRequest(`/api/captures/${id}`, "PUT", {
        raw_text: editText,
        category: editCategory,
        sub_category: editSubCategory,
        tags: tagsList
      });
      
      setCaptures(prev => prev.map(c => c.id === id ? updated : c));
      setEditingCaptureId(null);
      loadData();
    } catch (err) {
      alert("Failed to update capture: " + err.message);
    }
  };

  // Confirm / Reject connection links
  const handleLinkConfirm = async (id, status) => {
    try {
      await apiRequest(`/api/links/${id}?status_update=${status}`, "PUT");
      setLinks(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      loadData();
    } catch (err) {
      alert("Failed to update link status");
    }
  };

  // Re-linking trigger
  const handleTriggerRelink = async () => {
    try {
      const res = await apiRequest("/api/links/relink", "POST");
      alert(res.message);
      loadData();
    } catch (err) {
      alert("Failed to run re-linking: " + err.message);
    }
  };

  // Load Trash
  const loadTrash = async () => {
    try {
      const data = await apiRequest("/api/trash");
      setTrash(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentView === "settings") {
      loadTrash();
    }
  }, [currentView]);

  const handleRestoreCapture = async (id) => {
    try {
      await apiRequest(`/api/captures/${id}/restore`, "POST");
      setTrash(prev => prev.filter(c => c.id !== id));
      loadData();
    } catch (err) {
      alert("Failed to restore capture");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this? It cannot be recovered.")) return;
    try {
      await apiRequest(`/api/captures/${id}/permanent`, "DELETE");
      setTrash(prev => prev.filter(c => c.id !== id));
      loadData();
    } catch (err) {
      alert("Failed to permanently delete capture");
    }
  };

  const handleRetryProcessing = async (id) => {
    try {
      const updated = await apiRequest(`/api/captures/${id}/retry`, "POST");
      setCaptures(prev => prev.map(c => c.id === id ? updated : c));
      alert("AI re-processing queued in the background.");
      loadData();
    } catch (err) {
      alert("Failed to retry processing: " + err.message);
    }
  };

  // Dismiss Notification
  const handleDismissNotification = async (id) => {
    try {
      await apiRequest(`/api/notifications/${id}/dismiss`, "POST");
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings API Key
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    try {
      const joinedKeys = geminiApiKeys.map(k => k.trim()).filter(Boolean).join(",");
      await apiRequest("/api/settings", "POST", { key: "GEMINI_API_KEY", value: joinedKeys });
      setSaveSuccess(true);
      loadData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };

  // Run Semantic Search / Filtering
  const runFilterQuery = async () => {
    let path = "/api/captures?";
    const params = [];
    if (searchQuery.trim()) params.push(`q=${encodeURIComponent(searchQuery)}`);
    if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`);
    if (sourceFilter) params.push(`source=${encodeURIComponent(sourceFilter)}`);
    if (startDate) params.push(`start_date=${encodeURIComponent(new Date(startDate).toISOString())}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(new Date(endDate).toISOString())}`);
    
    path += params.join("&");
    try {
      const searchResults = await apiRequest(path);
      setCaptures(searchResults);
    } catch (err) {
      console.error("Filter request failed", err);
    }
  };

  useEffect(() => {
    if (currentView === "search") {
      runFilterQuery();
    }
  }, [searchQuery, categoryFilter, sourceFilter, startDate, endDate, currentView]);

  // Group Captures
  const groupCapturesByCategory = () => {
    const groups = {};
    captures.forEach(c => {
      const cat = c.category || "General";
      const sub = c.sub_category || "Unsorted";
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][sub]) groups[cat][sub] = [];
      groups[cat][sub].push(c);
    });
    return groups;
  };

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // SVG 2D Network Graph Coordinates Calculation
  const renderNetworkGraph = () => {
    const activeCaps = captures.filter(c => c.ai_status === "completed");
    if (activeCaps.length === 0) {
      return (
        <div style={{ padding: "40px", textAlignment: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Capture at least 1 completed note to visualize connections.
        </div>
      );
    }

    const nodeRadius = 6;
    const width = 560;
    const height = 240;
    const padding = 20;

    const nodes = activeCaps.map((cap, index) => {
      const angle = (index / activeCaps.length) * 2 * Math.PI;
      const cx = width / 2 + (width / 2.8 - padding) * Math.cos(angle);
      const cy = height / 2 + (height / 2.8 - padding) * Math.sin(angle);
      return { id: cap.id, text: cap.raw_text.slice(0, 15) + "...", cx, cy, cap };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const graphLinks = [];
    links.forEach(l => {
      const sourceNode = nodeMap.get(l.source_id);
      const targetNode = nodeMap.get(l.target_id);
      if (sourceNode && targetNode) {
        graphLinks.push({
          id: l.id,
          x1: sourceNode.cx,
          y1: sourceNode.cy,
          x2: targetNode.cx,
          y2: targetNode.cy,
          status: l.status,
          score: l.similarity_score
        });
      }
    });

    return (
      <svg className="graph-svg" viewBox={`0 0 ${width} ${height}`}>
        {graphLinks.map(l => (
          <g key={`l-${l.id}`}>
            <line
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className={`graph-link ${l.status}`}
            />
            <circle
              cx={(l.x1 + l.x2) / 2}
              cy={(l.y1 + l.y2) / 2}
              r={3}
              fill={isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(9,9,11,0.15)"}
            />
          </g>
        ))}

        {nodes.map(n => (
          <g 
            key={`n-${n.id}`} 
            className="graph-node"
            onClick={() => {
              setCurrentView("capture");
              setActiveTab("capture");
              setTimeout(() => {
                const el = document.getElementById(`capture-card-${n.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
          >
            <circle
              cx={n.cx}
              cy={n.cy}
              r={nodeRadius}
              fill={isDarkMode ? "#ffffff" : "#09090b"}
              stroke={isDarkMode ? "#000000" : "#ffffff"}
              strokeWidth={1.5}
            />
            <text
              x={n.cx + 10}
              y={n.cy + 3}
              textAnchor="start"
              style={{ fill: "var(--text-secondary)" }}
            >
              {n.text}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Render Authentication View
  if (!token) {
    return (
      <div className="auth-container">
        <div className="logo-container" style={{ justifyContent: "center" }}>
          <img src="/logo.png" className="logo-img" alt="ARKI" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="logo-text">ARKI</h1>
        </div>
        
        <div className="auth-card glass-panel">
          <h2 className="auth-title">{isLoginView ? "Welcome" : "Create Account"}</h2>
          <p className="auth-subtitle">AI-Organized Knowledge Capture</p>

          {authError && <div style={{ color: "var(--accent-rose)", fontSize: "0.8rem", textAlign: "center", marginBottom: "15px" }}>{authError}</div>}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                placeholder="you@example.com" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                placeholder="••••••••" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-btn">
              {isLoginView ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <div className="auth-toggle-link" onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? "Create account" : "Back to sign in"}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
              <span style={{ padding: "0 10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
            </div>

            <button 
              type="button" 
              onClick={handleDemoLogin} 
              className="auth-btn" 
              style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Icon name="google" className="filled" />
              Continue with Demo Quick Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo.png" className="logo-img" alt="ARKI" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="logo-text">ARKI</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Light/Dark Mode Switcher */}
          <button onClick={toggleTheme} className="card-action-btn" title="Toggle Theme" style={{ padding: "6px" }}>
            <Icon name={isDarkMode ? "sun" : "moon"} />
          </button>
          <button onClick={handleLogout} className="card-action-btn" style={{ fontSize: "0.8rem", color: "var(--accent-rose)", border: "1px solid var(--border-color)", padding: "4px 8px", borderRadius: "6px" }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        
        

        {/* View 1: Main Frictionless Capture & Feed */}
        {currentView === "capture" && (
          <>
            {/* Input Capture Bar */}
            <div className="capture-box glass-panel">
              <form onSubmit={handleCaptureSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <textarea 
                  className="capture-textarea" 
                  placeholder="Capture an idea, book excerpt, or question... (Enter saves raw capture instantly)" 
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCaptureSubmit(e);
                    }
                  }}
                />
                
                <div className="capture-meta-row">
                  {showSourceInput ? (
                    <div className="source-input-wrapper">
                      <Icon name="source" style={{ width: "14px", height: "14px", marginRight: "6px", color: "var(--text-muted)" }} />
                      <input 
                        type="text" 
                        placeholder="Source e.g. Book title, URL..."
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      />
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setShowSourceInput(true)} 
                      className="card-action-btn"
                      style={{ padding: "6px 10px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Icon name="source" style={{ width: "12px", height: "12px" }} /> Add Source
                    </button>
                  )}
                  
                  <button type="submit" disabled={isSubmittingCapture} className="capture-btn">
                    <Icon name="capture" style={{ width: "14px", height: "14px" }} />
                    {isSubmittingCapture ? "Saving" : "Capture"}
                  </button>
                </div>
              </form>
            </div>

            {/* Spaced Repetition Resurfacing Section */}
            {resurfaced.length > 0 && (
              <div className="resurface-section">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="resurface-tag" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Icon name="clock" style={{ width: "10px", height: "10px" }} /> Recall
                  </span>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Resurfaced from the archive</div>
                </div>
                <div className="resurface-container">
                  {resurfaced.map(cap => (
                    <div key={`resur-${cap.id}`} className="capture-card resurface-card glass-panel">
                      <div className="card-header-row">
                        <span className="category-badge" style={{ color: "var(--accent-emerald)" }}>
                          <Icon name="folder" style={{ width: "12px", height: "12px", marginRight: "4px" }} />
                          {cap.category} ({cap.sub_category})
                        </span>
                        <span className="card-timestamp">Recall Deck</span>
                      </div>
                      <div className="card-text">{cap.raw_text}</div>
                      {cap.summary && <div className="card-summary">{cap.summary}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Captures Feed */}
            <div className="card-feed">
              <div className="feed-header">
                <h3 className="feed-title">Inbox Feed</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{captures.length} captures</span>
              </div>

              {captures.length === 0 ? (
                <div style={{ padding: "40px", textAlignment: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Your capture feed is empty. Type above to remember your first idea.
                </div>
              ) : (
                captures.map(cap => {
                  const isEditing = editingCaptureId === cap.id;
                  const isPending = cap.ai_status === "pending";

                  return (
                    <div 
                      key={cap.id} 
                      id={`capture-card-${cap.id}`}
                      className={`capture-card glass-panel ${isPending ? 'ai-processing-card' : ''} ${cap.ai_status === 'failed' ? 'ai-failed-card' : ''}`}
                    >
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div className="form-group">
                            <label>Text Content</label>
                            <textarea 
                              className="capture-textarea" 
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div className="form-group">
                              <label>AI Category Override</label>
                              <input 
                                className="form-input" 
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Sub-category Override</label>
                              <input 
                                className="form-input" 
                                value={editSubCategory}
                                onChange={(e) => setEditSubCategory(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Tags (comma-separated)</label>
                            <input 
                              className="form-input" 
                              value={editTagsString}
                              onChange={(e) => setEditTagsString(e.target.value)}
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button onClick={() => setEditingCaptureId(null)} className="card-action-btn" style={{ border: "1px solid var(--border-color)", padding: "4px 8px" }}>Cancel</button>
                            <button onClick={() => handleUpdateCapture(cap.id)} className="capture-btn" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Save Changes</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="card-header-row">
                            <span className="category-badge" style={cap.ai_status === "failed" ? { color: "var(--accent-rose)", borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" } : {}}>
                              <Icon name={cap.ai_status === "failed" ? "info" : "folder"} style={{ width: "12px", height: "12px" }} />
                              {cap.ai_status === "failed" ? "AI Processing Failed" : `${cap.category} • ${cap.sub_category}`}
                            </span>
                            <span className="card-timestamp">
                              {new Date(cap.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="card-text">{cap.raw_text}</div>
                          
                          {cap.ai_status === "failed" && (
                            <div className="ai-error-banner" style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.1)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--accent-rose)" }}>
                                <Icon name="info" style={{ color: "var(--accent-rose)", width: "14px", height: "14px" }} />
                                API Limit Reached or Key Configuration Issue
                              </div>
                              <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                Your Gemini API keys might have hit the rate limit (15 RPM) or are invalid. Please check your settings or try again.
                              </div>
                              <button 
                                onClick={() => handleRetryProcessing(cap.id)} 
                                className="card-action-btn" 
                                style={{ marginTop: "4px", background: "var(--accent-rose)", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer", fontWeight: "700", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <Icon name="refresh" style={{ width: "10px", height: "10px", fill: "white" }} />
                                Retry AI Processing
                              </button>
                            </div>
                          )}

                          {cap.summary && <div className="card-summary">{cap.summary}</div>}

                          {cap.tags && cap.tags.length > 0 && (
                            <div className="tag-list">
                              {cap.tags.map((tag, idx) => (
                                <span key={idx} className="tag-item">#{tag}</span>
                              ))}
                            </div>
                          )}

                          <div className="card-footer-row">
                            <div className="source-indicator">
                              <Icon name="source" style={{ width: "12px", height: "12px" }} />
                              <span>{cap.source ? cap.source : "Raw Text"}</span>
                            </div>
                            
                            <div className="card-actions">
                              {isPending ? (
                                <div className="processing-shimmer">
                                  <div className="spinner"></div>
                                  <span>AI processing</span>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => startEditCapture(cap)} className="card-action-btn" title="Edit note">
                                    <Icon name="edit" />
                                  </button>
                                  <button onClick={() => handleDeleteCapture(cap.id)} className="card-action-btn delete" title="Move to trash">
                                    <Icon name="trash" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* View 2: Semantic Search */}
        {currentView === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="feed-title">Semantic Retrieval Engine</h3>
            
            <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label>Semantic Search Query</label>
                <div style={{ display: "flex", alignItems: "center", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0 10px" }}>
                  <Icon name="search" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Type an idea e.g. 'spaced repetition' or 'sailing knots'..."
                    className="form-input"
                    style={{ border: "none", background: "transparent" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label>Filter Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Technology"
                    className="form-input"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Filter Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Book"
                    className="form-input"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card-feed">
              <div className="feed-header">
                <h4 style={{ fontWeight: "600" }}>Semantic Matches</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Ranked by cosine similarity</span>
              </div>

              {captures.length === 0 ? (
                <div style={{ padding: "30px", textAlignment: "center", color: "var(--text-muted)" }}>
                  No semantic matches found.
                </div>
              ) : (
                captures.map(cap => (
                  <div key={cap.id} className="capture-card glass-panel">
                    <div className="card-header-row">
                      <span className="category-badge">
                        <Icon name="folder" style={{ width: "12px", height: "12px" }} />
                        {cap.category} • {cap.sub_category}
                      </span>
                      <span className="card-timestamp">{new Date(cap.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="card-text">{cap.raw_text}</div>
                    {cap.summary && <div className="card-summary">{cap.summary}</div>}
                    {cap.tags && cap.tags.length > 0 && (
                      <div className="tag-list">
                        {cap.tags.map((tag, idx) => <span key={idx} className="tag-item">#{tag}</span>)}
                      </div>
                    )}
                    <div className="card-footer-row">
                      <span className="source-indicator">
                        <Icon name="source" style={{ width: "12px", height: "12px" }} />
                        {cap.source ? cap.source : "Raw Text"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View 3: Category Tree Explorer */}
        {currentView === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="feed-title">Category Tree Taxonomy</h3>
            
            <div className="glass-panel" style={{ padding: "20px" }}>
              {Object.keys(groupCapturesByCategory()).length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlignment: "center", fontSize: "0.85rem" }}>
                  No categorized items found.
                </div>
              ) : (
                Object.entries(groupCapturesByCategory()).map(([category, subs]) => {
                  const isExpanded = expandedCategories[category];
                  const totalInCat = Object.values(subs).reduce((sum, list) => sum + list.length, 0);

                  return (
                    <div key={category} style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <div 
                        onClick={() => toggleCategoryExpand(category)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "6px 0" }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Icon name={isExpanded ? "folder-open" : "folder"} />
                          {category}
                        </span>
                        <span className="category-badge">{totalInCat} notes</span>
                      </div>

                      {isExpanded && (
                        <div style={{ paddingLeft: "20px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {Object.entries(subs).map(([sub, notes]) => (
                            <div key={sub} style={{ padding: "8px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Icon name="document" style={{ width: "12px", height: "12px" }} />
                                {sub} ({notes.length})
                              </div>
                              <ul style={{ display: "flex", flexDirection: "column", gap: "6px", listStyle: "none", paddingLeft: "18px" }}>
                                {notes.map(note => (
                                  <li 
                                    key={note.id} 
                                    onClick={() => {
                                      setCurrentView("capture");
                                      setActiveTab("capture");
                                      setTimeout(() => {
                                        const el = document.getElementById(`capture-card-${note.id}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }, 150);
                                    }}
                                    style={{ fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                  >
                                    {note.raw_text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* View 4: Connections Hub */}
        {currentView === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="feed-title">Relationships & Connections</h3>

            <div className="graph-container glass-panel">
              <div style={{ position: "absolute", top: "10px", left: "10px", fontSize: "0.75rem", color: "var(--text-muted)", zIndex: 10, display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon name="network" style={{ width: "12px", height: "12px" }} />
                Interactive Semantic Graph
              </div>
              {renderNetworkGraph()}
            </div>

            <div className="card-feed">
              <div className="feed-header">
                <h4 style={{ fontWeight: "600" }}>Connection Proposals</h4>
                <button 
                  onClick={handleTriggerRelink} 
                  className="card-action-btn" 
                  style={{ border: "1px solid var(--border-color)", padding: "4px 8px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Icon name="scan" style={{ width: "12px", height: "12px" }} />
                  Scan Connections
                </button>
              </div>

              {links.filter(l => l.status === "suggested").length === 0 ? (
                <div className="glass-panel" style={{ padding: "20px", textAlignment: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No suggested links. Run a scan scan using the action above.
                </div>
              ) : (
                links.filter(l => l.status === "suggested").map(l => (
                  <div key={l.id} className="glass-panel" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", border: "1px dashed var(--accent-amber)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span style={{ color: "var(--accent-amber)", fontWeight: "700" }}>PROPOSED RELATION</span>
                      <span style={{ color: "var(--text-muted)" }}>Similarity: {Math.round((l.similarity_score ?? l.score) * 100)}%</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <div style={{ padding: "8px", background: "var(--bg-secondary)", borderRadius: "4px" }}>
                        <strong>Note A:</strong> {l.source_text}
                      </div>
                      <div style={{ padding: "8px", background: "var(--bg-secondary)", borderRadius: "4px" }}>
                        <strong>Note B:</strong> {l.target_text}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button 
                        onClick={() => handleLinkConfirm(l.id, "rejected")} 
                        className="card-action-btn delete" 
                        style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Icon name="close" style={{ width: "12px", height: "12px" }} /> Decline
                      </button>
                      <button 
                        onClick={() => handleLinkConfirm(l.id, "confirmed")} 
                        className="capture-btn" 
                        style={{ padding: "4px 8px", background: "var(--accent-emerald)", color: "#000", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Icon name="check" style={{ width: "12px", height: "12px" }} /> Confirm Link
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View 6: Shared Space Viewer */}
        {currentView === "shared-viewer" && sharedSpaceData && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="feed-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="folder" style={{ color: "var(--primary)" }} />
                Shared Space: {sharedSpaceData.owner_email}
              </h3>
              <button 
                onClick={() => {
                  setSharedSpaceToken(null);
                  setSharedSpaceData(null);
                  setCurrentView("settings");
                }} 
                className="card-action-btn"
                style={{ padding: "4px 10px", fontSize: "0.8rem" }}
              >
                &larr; Back to Settings
              </button>
            </div>

            {/* Mount button */}
            {token && !connectedSpaces.some(s => s.token === sharedSpaceToken) && (
              <button 
                onClick={async () => {
                  try {
                    await apiRequest("/api/shares/connect", "POST", { token: sharedSpaceToken });
                    loadData();
                    alert("Space mounted successfully! You can access it anytime from settings.");
                  } catch (e) {
                    alert("Failed to connect: " + e.message);
                  }
                }}
                className="capture-btn"
                style={{ padding: "8px 16px", background: "var(--accent-emerald)", color: "black", alignSelf: "flex-start", fontWeight: "700" }}
              >
                + Mount to My Connected Spaces
              </button>
            )}

            {/* Semantic Search in Shared Space */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Semantic Query Search</h4>
              <form onSubmit={handleSharedSearch} style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: "1" }}
                  placeholder="Ask a question or search concepts in this shared space..."
                  value={sharedSearchQuery}
                  onChange={(e) => setSharedSearchQuery(e.target.value)}
                />
                <button type="submit" className="capture-btn" disabled={isSearchingShared}>
                  {isSearchingShared ? "Searching..." : "Search"}
                </button>
              </form>

              {sharedSearchResults !== null && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>Semantic Matches</span>
                    <button 
                      onClick={() => setSharedSearchResults(null)}
                      style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}
                    >
                      Clear Search
                    </button>
                  </div>

                  {sharedSearchResults.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No semantic matches found.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {sharedSearchResults.map(cap => (
                        <div key={cap.id} className="capture-card glass-panel" style={{ padding: "12px", borderLeft: "3px solid var(--primary)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                            <span>{cap.category} &bull; {cap.sub_category}</span>
                            <span style={{ color: "var(--accent-emerald)", fontWeight: "600" }}>Similarity: {Math.round(cap.score * 100)}%</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{cap.raw_text}</div>
                          {cap.summary && <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px", fontStyle: "italic" }}>{cap.summary}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List Shared Notes & Taxonomy */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "16px" }}>Taxonomy Folders</h4>
              {sharedSpaceData.captures.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>This shared space is empty.</p>
              ) : (
                <div>
                  {Object.entries(
                    sharedSpaceData.captures.reduce((acc, cap) => {
                      const cat = cap.category || "General";
                      const sub = cap.sub_category || "Unsorted";
                      if (!acc[cat]) acc[cat] = {};
                      if (!acc[cat][sub]) acc[cat][sub] = [];
                      acc[cat][sub].push(cap);
                      return acc;
                    }, {})
                  ).map(([category, subCats]) => (
                    <div key={category} style={{ marginBottom: "16px" }}>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
                        <Icon name="folder" style={{ width: "14px", height: "14px" }} />
                        {category}
                      </div>
                      
                      <div style={{ paddingLeft: "16px", marginTop: "8px" }}>
                        {Object.entries(subCats).map(([subCategory, notes]) => (
                          <div key={subCategory} style={{ marginBottom: "10px" }}>
                            <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                              &bull; {subCategory}
                            </div>
                            
                            <ul style={{ listStyleType: "circle", margin: "6px 0 6px 16px", paddingLeft: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                              {notes.map(note => (
                                <li key={note.id} style={{ lineHeight: "1.3" }}>
                                  {note.raw_text}
                                  {note.summary && (
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "2px" }}>
                                      Summary: {note.summary}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 5: Settings, Statistics, and Trash */}
        {currentView === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="feed-title">Account & Settings</h3>

            {/* API Config Panel */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Gemini API Integration</h4>
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label>Gemini API Keys</label>
                  
                  {geminiApiKeys.map((keyVal, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center", flex: "1" }}>
                        <input
                          type={showApiKeys ? "text" : "password"}
                          placeholder={idx === 0 ? "Primary Gemini API Key (AIzaSy...)" : `Fallback Key #${idx} (AIzaSy...)`}
                          className="form-input"
                          style={{ width: "100%", paddingRight: "10px" }}
                          value={keyVal}
                          onChange={(e) => {
                            const newKeys = [...geminiApiKeys];
                            newKeys[idx] = e.target.value;
                            setGeminiApiKeys(newKeys);
                          }}
                        />
                      </div>
                      
                      {geminiApiKeys.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newKeys = geminiApiKeys.filter((_, i) => i !== idx);
                            setGeminiApiKeys(newKeys);
                          }}
                          className="card-action-btn"
                          style={{
                            padding: "6px 10px",
                            borderColor: "var(--accent-rose)",
                            color: "var(--accent-rose)",
                            borderRadius: "6px"
                          }}
                        >
                          <Icon name="close" style={{ width: "14px", height: "14px" }} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setGeminiApiKeys([...geminiApiKeys, ""])}
                      className="card-action-btn"
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>+ Add Fallback Key</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {showApiKeys ? "Hide Keys" : "Show Keys"}
                    </button>
                  </div>
                  
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Add fallback keys. If your primary API key hits a rate limit (15 RPM), ARKI automatically rotates to the fallback keys.
                  </p>
                </div>
                
                <button type="submit" className="capture-btn" style={{ alignSelf: "flex-end" }}>
                  Save Configuration
                </button>
                {saveSuccess && <span style={{ color: "var(--accent-emerald)", fontSize: "0.8rem", textAlign: "right" }}>API key updated successfully.</span>}
              </form>
            </div>

            {/* Space Sharing Config */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="graph" style={{ color: "var(--primary)", width: "16px", height: "16px" }} />
                Share My Taxonomy & Space
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Toggle sharing to generate a public link. Other users will be able to view your taxonomy structure and perform semantic searches on your notes.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Public Sharing Status</span>
                  <button 
                    onClick={async () => {
                      try {
                        const updated = await apiRequest("/api/shares/toggle", "POST");
                        setShareInfo(updated);
                        alert(`Sharing is now ${updated.enabled ? "enabled" : "disabled"}.`);
                      } catch (e) {
                        alert("Failed to toggle sharing: " + e.message);
                      }
                    }}
                    className="capture-btn"
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.8rem",
                      background: shareInfo?.enabled ? "var(--accent-rose)" : "var(--primary)",
                      color: shareInfo?.enabled ? "white" : "black"
                    }}
                  >
                    {shareInfo?.enabled ? "Disable Sharing" : "Enable Sharing"}
                  </button>
                </div>
                
                {shareInfo?.enabled && shareInfo?.token && (
                  <>
                    <div style={{ marginTop: "12px", background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Your Shared Space Link:</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input 
                          type="text" 
                          readOnly 
                          className="form-input" 
                          style={{ flex: "1", fontSize: "0.75rem", background: "rgba(0,0,0,0.15)", fontFamily: "monospace" }}
                          value={`${window.location.origin}/?share=${shareInfo.token}`}
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?share=${shareInfo.token}`);
                            alert("Share link copied to clipboard!");
                          }}
                          className="card-action-btn"
                          style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700", display: "block", marginBottom: "8px" }}>
                        ACTIVE SUBSCRIBERS / CONNECTED AUDIENCE
                      </span>
                      {spaceConnections.length === 0 ? (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", margin: "0" }}>
                          No users have connected to your space yet. Share your link to let friends connect!
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {spaceConnections.map((conn, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "6px 10px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>
                              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{conn.email}</span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                                Connected {new Date(conn.connected_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Connected Shared Spaces Panel */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Connected Friends' Spaces</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="text" 
                    placeholder="Enter Share Token (UUID) or share link..."
                    className="form-input"
                    id="connect-space-input"
                    style={{ flex: "1" }}
                  />
                  <button 
                    onClick={async () => {
                      const input = document.getElementById("connect-space-input");
                      let tokenVal = input.value.trim();
                      if (!tokenVal) return;
                      if (tokenVal.includes("share=")) {
                        try {
                          tokenVal = new URL(tokenVal).searchParams.get("share");
                        } catch (e) {
                          const match = tokenVal.match(/[?&]share=([^&]+)/);
                          if (match) tokenVal = match[1];
                        }
                      }
                      try {
                        await apiRequest("/api/shares/connect", "POST", { token: tokenVal });
                        input.value = "";
                        loadData();
                        alert("Connected space added successfully!");
                      } catch (e) {
                        alert("Failed to connect: " + e.message);
                      }
                    }}
                    className="capture-btn"
                    style={{ padding: "6px 12px" }}
                  >
                    Connect
                  </button>
                </div>

                {connectedSpaces.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No connected spaces yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    {connectedSpaces.map(sp => (
                      <div key={sp.token} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: "1" }}>
                          {sp.owner_email}
                        </span>
                        
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            type="button"
                            onClick={() => {
                              setSharedSpaceToken(sp.token);
                              setCurrentView("shared-viewer");
                            }}
                            className="card-action-btn"
                            style={{ padding: "2px 8px", fontSize: "0.7rem", color: "var(--primary)" }}
                          >
                            Browse
                          </button>
                          
                          <button 
                            type="button"
                            onClick={async () => {
                              try {
                                await apiRequest("/api/shares/disconnect", "POST", { token: sp.token });
                                loadData();
                                alert("Disconnected successfully.");
                              } catch (e) {
                                alert("Failed to disconnect: " + e.message);
                              }
                            }}
                            className="card-action-btn"
                            style={{ padding: "2px 8px", fontSize: "0.7rem", color: "var(--accent-rose)", borderColor: "var(--accent-rose)" }}
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* API Usage logs panel */}
            {apiUsage && (
              <div className="glass-panel" style={{ padding: "20px" }}>
                <h4 style={{ fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="info" style={{ color: "var(--primary)", width: "16px", height: "16px" }} />
                  Gemini API Usage & Limits
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Daily limits */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>API Requests (Last 24h)</span>
                    <span style={{ fontWeight: "600" }}>{apiUsage.requests_today} / {apiUsage.daily_limit}</span>
                  </div>
                  
                  <div style={{ width: "100%", height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(100, (apiUsage.requests_today / apiUsage.daily_limit) * 100)}%`,
                      height: "100%",
                      background: "var(--primary)",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", marginBottom: "8px" }}>
                    <span>Remaining Daily Limit: {apiUsage.remaining_today} requests</span>
                    <span>Free Tier Quota: 1,000 requests/day</span>
                  </div>

                  {/* RPM Rate limit */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>API Rate Limit (Requests / Minute)</span>
                    <span style={{ fontWeight: "600" }}>{apiUsage.requests_this_minute} / {apiUsage.rpm_limit}</span>
                  </div>
                  
                  <div style={{ width: "100%", height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(100, (apiUsage.requests_this_minute / apiUsage.rpm_limit) * 100)}%`,
                      height: "100%",
                      background: apiUsage.requests_this_minute >= apiUsage.rpm_limit ? "var(--accent-rose)" : "var(--accent-emerald)",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span>RPM rate limits reset automatically every 60 seconds.</span>
                    <span>Free Tier Quota: 15 RPM</span>
                  </div>
                  
                </div>
              </div>
            )}

            {/* Statistics Dashboard Panel */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Knowledge Base Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Notes</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>{stats.total_captures}</div>
                </div>
                <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Confirmed Links</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--accent-emerald)" }}>{stats.active_connections}</div>
                </div>
              </div>
              
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <strong>Categories breakdown:</strong>
                {Object.keys(stats.category_counts).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>No categories tracked yet.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {Object.entries(stats.category_counts).map(([cat, cnt]) => (
                      <span key={cat} className="category-badge" style={{ fontSize: "0.7rem" }}>{cat}: {cnt}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Soft Delete Recovery Bin (Trash View) */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Trash Bin (30-day Recovery Window)</h4>
              
              {trash.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlignment: "center" }}>
                  Trash bin is empty.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {trash.map(cap => (
                    <div key={`trash-${cap.id}`} style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "6px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {cap.raw_text}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button onClick={() => handleRestoreCapture(cap.id)} className="card-action-btn" style={{ padding: "2px 8px", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.75rem" }}>Restore</button>
                        <button onClick={() => handlePermanentDelete(cap.id)} className="card-action-btn delete" style={{ padding: "2px 8px", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.75rem" }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Sticky Bottom Tab Bar */}
      <nav className="bottom-nav">
        <button 
          onClick={() => { setCurrentView("capture"); setActiveTab("capture"); }} 
          className={`nav-item ${activeTab === "capture" ? "active" : ""}`}
        >
          <Icon name="capture" className="nav-icon" />
          <span className="nav-label">Capture</span>
        </button>

        <button 
          onClick={() => { setCurrentView("search"); setActiveTab("search"); }} 
          className={`nav-item ${activeTab === "search" ? "active" : ""}`}
        >
          <Icon name="search" className="nav-icon" />
          <span className="nav-label">Search</span>
        </button>

        <button 
          onClick={() => { setCurrentView("categories"); setActiveTab("categories"); }} 
          className={`nav-item ${activeTab === "categories" ? "active" : ""}`}
        >
          <Icon name="folder" className="nav-icon" />
          <span className="nav-label">Taxonomy</span>
        </button>

        <button 
          onClick={() => { setCurrentView("links"); setActiveTab("links"); }} 
          className={`nav-item ${activeTab === "links" ? "active" : ""}`}
        >
          <Icon name="graph" className="nav-icon" />
          <span className="nav-label">Graph</span>
        </button>

        <button 
          onClick={() => { setCurrentView("settings"); setActiveTab("settings"); }} 
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
        >
          <Icon name="settings" className="nav-icon" />
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
}
