
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("dashboard");

  const fetchTasks = async () => {
    setTaskLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks/`);

      if (!response.ok) {
        throw new Error("Failed to load tasks.");
      }

      const data = await response.json();
      setTasks(data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to load tasks. Check that the backend is running.");
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchTasks();
    }
  }, [loggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to backend.");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not update task.");
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? data : task
        )
      );

      setMessage(`Task #${taskId} status updated successfully!`);
    } catch (error) {
      setMessage(error.message || "Unable to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const taskCounts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter(
      (task) => task.status === "in_progress"
    ).length,
    completed: tasks.filter(
      (task) => task.status === "completed"
    ).length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = [
        task.title,
        task.description || "",
        task.priority,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesView =
        activeView !== "completed" || task.status === "completed";

      return matchesSearch && matchesStatus && matchesView;
    });
  }, [tasks, search, statusFilter, activeView]);

  const openDashboard = () => {
    setActiveView("dashboard");
    setStatusFilter("all");
  };

  const openTasks = () => {
    setActiveView("tasks");
    setStatusFilter("all");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setTasks([]);
    setMessage("");
    setSearch("");
    setStatusFilter("all");
    setActiveView("dashboard");
  };

  if (!loggedIn) {
    return (
      <main className="login-page">
        <div className="login-brand">
          <div className="brand-mark">✈</div>
          <div>
            <h1>AERODEPLOYY</h1>
            <p>Airport Ground Staff Management</p>
          </div>
        </div>

        <form className="login-box" onSubmit={handleLogin}>
          <span className="eyebrow">STAFF PORTAL</span>
          <h2>Welcome back</h2>
          <p className="login-subtitle">
            Sign in to access your task dashboard.
          </p>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />

          {message && <p className="message error-message">{message}</p>}

          <button className="primary-button login-button" type="submit">
            Sign In
          </button>

          <p className="login-footer">
            Airport Ground Staff Task Management
          </p>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">✈</div>
          <div>
            <h2>AERODEPLOYY</h2>
            <span>GROUND OPERATIONS</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <button
          className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
          onClick={openDashboard}
        >
          <span className="nav-icon">▦</span>
          Dashboard
        </button>

        <button
          className={`nav-item ${activeView === "tasks" ? "active" : ""}`}
          onClick={openTasks}
        >
          <span className="nav-icon">☷</span>
          All Tasks
          <span className="nav-count">{tasks.length}</span>
        </button>

        <button
          className={`nav-item ${activeView === "completed" ? "active" : ""}`}
          onClick={() => {
            setActiveView("completed");
            setStatusFilter("all");
          }}
        >
          <span className="nav-icon">✓</span>
          Completed Tasks
        </button>

        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon">✦</span>
            <strong>Stay on schedule</strong>
            <p>Keep your assigned operations up to date.</p>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>Ground Staff</strong>
              <span>{email}</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            ↪ Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-label">OPERATIONS / STAFF PORTAL</span>
            <h1>
              {activeView === "dashboard"
                ? "Dashboard"
                : activeView === "completed"
                ? "Completed Tasks"
                : "All Tasks"}
            </h1>
          </div>

          <button
            className="refresh-button"
            onClick={fetchTasks}
            disabled={taskLoading}
          >
            ↻ <span>{taskLoading ? "Loading..." : "Refresh"}</span>
          </button>
        </header>

        <section className="welcome-banner">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2>Welcome back, Ground Staff!</h2>
            <p>Here is your current task and operations overview.</p>
          </div>
          <div className="banner-plane" aria-hidden="true">✈</div>
        </section>

        {activeView === "dashboard" && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Tasks</span>
                <span className="stat-icon blue">▦</span>
              </div>
              <strong>{taskCounts.total}</strong>
              <p>Tasks in the system</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Pending</span>
                <span className="stat-icon orange">◷</span>
              </div>
              <strong>{taskCounts.pending}</strong>
              <p>Waiting to be started</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>In Progress</span>
                <span className="stat-icon purple">↻</span>
              </div>
              <strong>{taskCounts.inProgress}</strong>
              <p>Currently being handled</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Completed</span>
                <span className="stat-icon green">✓</span>
              </div>
              <strong>{taskCounts.completed}</strong>
              <p>Successfully finished</p>
            </div>
          </section>
        )}

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TASK MANAGEMENT</span>
              <h2>
                {activeView === "completed"
                  ? "Completed Tasks"
                  : activeView === "tasks"
                  ? "All Tasks"
                  : "Task Overview"}
              </h2>
              <p>Review tasks and keep their status up to date.</p>
            </div>
            <span className="task-total">{filteredTasks.length} tasks</span>
          </div>

          <div className="task-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search tasks or priority..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter tasks by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {message && (
            <p className={`message ${message.includes("successfully") ? "success-message" : "error-message"}`}>
              {message}
            </p>
          )}

          {taskLoading ? (
            <div className="empty-state">
              <span className="empty-icon">↻</span>
              <h3>Loading tasks...</h3>
              <p>Please wait while we fetch the latest information.</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">☷</span>
              <h3>No tasks found</h3>
              <p>Try changing your search or status filter.</p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <article className="task-row" key={task.id}>
                  <div className="task-main">
                    <div className="task-title-line">
                      <span className="task-id">TASK #{task.id}</span>
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority} priority
                      </span>
                    </div>

                    <h3>{task.title}</h3>
                    <p className="task-description">
                      {task.description || "No description provided."}
                    </p>

                    <div className="task-meta">
                      <span>✈ Ground Operations</span>
                      {task.due_date && (
                        <span>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <span className={`status-badge status-${task.status}`}>
                      {task.status.replace("_", " ")}
                    </span>

                    <label htmlFor={`status-${task.id}`}>
                      Update status
                    </label>
                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      disabled={updatingTaskId === task.id}
                      onChange={(event) =>
                        updateTaskStatus(task.id, event.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {updatingTaskId === task.id && (
                      <span className="updating-text">Saving...</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>AERODEPLOYY · Airport Ground Staff Management</span>
          <span>Operations Dashboard</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
