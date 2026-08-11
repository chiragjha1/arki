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
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      if (keySetting) {
        setGeminiApiKey(keySetting.value);
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
      await apiRequest("/api/links/relink", "POST");
      alert("AI re-linking pass triggered in the background.");
    } catch (err) {
      alert("Failed to run re-linking");
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
      await apiRequest("/api/settings", "POST", { key: "GEMINI_API_KEY", value: geminiApiKey });
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
        
        {/* Unread AI notifications */}
        {notifications.map(notif => (
          <div key={notif.id} className="notification-banner glass-panel">
            <div className="notification-content" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="info" style={{ color: "var(--primary)" }} />
              <span>
                Reclassified: <strong>{notif.old_category}</strong> &rarr; <strong>{notif.new_category}</strong> ({notif.new_sub_category})
              </span>
            </div>
            <button onClick={() => handleDismissNotification(notif.id)} className="notification-dismiss">
              <Icon name="close" style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        ))}

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
                      className={`capture-card glass-panel ${isPending ? 'ai-processing-card' : ''}`}
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
                            <span className="category-badge">
                              <Icon name="folder" style={{ width: "12px", height: "12px" }} />
                              {cap.category} • {cap.sub_category}
                            </span>
                            <span className="card-timestamp">
                              {new Date(cap.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="card-text">{cap.raw_text}</div>
                          
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
                      <span style={{ color: "var(--text-muted)" }}>Similarity: {Math.round(l.score * 100)}%</span>
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

        {/* View 5: Settings, Statistics, and Trash */}
        {currentView === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="feed-title">Account & Settings</h3>

            {/* API Config Panel */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h4 style={{ fontWeight: "600", marginBottom: "12px" }}>Gemini API Integration</h4>
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label>Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    className="form-input"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                  />
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    If left blank, ARKI runs fallbacks using mock embeddings and standard regex classifications.
                  </p>
                </div>
                
                <button type="submit" className="capture-btn" style={{ alignSelf: "flex-end" }}>
                  Save Configuration
                </button>
                {saveSuccess && <span style={{ color: "var(--accent-emerald)", fontSize: "0.8rem", textAlign: "right" }}>API key updated successfully.</span>}
              </form>
            </div>

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
