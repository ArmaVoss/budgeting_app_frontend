import { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({ item: "", price: "", category: "" });
  const [budgetGoal, setBudgetGoal] = useState(0);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // new: profile menu
  const [menuOpen, setMenuOpen] = useState(false);

  const API_BASE = "http://localhost:8080/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchHomeData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/home`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setUserData(res.data);
      setBudgetGoal(parseFloat(res.data.monthly_budgeting_goal || 0));
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized - please log in again");
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest(".profile-container")) setMenuOpen(false);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await axios.post(
        `${API_BASE}/budget/category/add`,
        { category_name: newCategory },
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );
      console.log("Category added:", response.data);
      setNewCategory("");
      setShowAddCategory(false);
      fetchHomeData();
    } catch (err) {
      console.error("Failed to add category:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized - please log in again");
      }
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.item || !newExpense.price || !newExpense.category) return;

    const payload = {
      category: {
        category_name: newExpense.category,
      },
      expense_item: {
        item: newExpense.item,
        category: { category_name: newExpense.category },
        price: parseFloat(newExpense.price),
      },
    };

    console.log("Sending expense payload:", payload);

    try {
      const response = await axios.post(`${API_BASE}/budget/expense/add`, payload, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      console.log("Expense added successfully:", response.data);
      setNewExpense({ item: "", price: "", category: "" });
      fetchHomeData();
    } catch (err) {
      console.error("Failed to add expense:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized - please log in again");
      } else if (err.response?.status === 422) {
        setError(`Invalid data: ${JSON.stringify(err.response?.data)}`);
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE}/budget/expense/delete`, {
        withCredentials: true,
        headers: getAuthHeaders(),
        params: { pid: id },
      });
      fetchHomeData();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized - please log in again");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const totalSpent =
    userData?.expense_items?.reduce((sum, e) => sum + parseFloat(e.price || 0), 0) || 0;
  const percentUsed = budgetGoal > 0 ? Math.min((totalSpent / budgetGoal) * 100, 100) : 0;
  const remaining = Math.max(budgetGoal - totalSpent, 0);

  if (loading)
    return (
      <div className="page-container">
        <div className="loading-message">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );

  if (!userData) return null;

  return (
    <div className="page-container">
      {/* Profile Icon */}
      <div className="profile-container">
        <div className="profile-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <img src="/profile.jpg" alt="Profile" />
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item">Profile</button>
            <button className="dropdown-item">Settings</button>
            <button className="dropdown-item logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="content-wrapper">
        {/* Main Card */}
        <div className="main-card">
          {/* Gauge Section */}
          <div className="gauge-section">
            <div className="gauge-content">
              <div className="gauge-wrapper">
                <svg className="gauge-svg" viewBox="0 0 200 120">
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#60D394"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${(percentUsed / 100) * 251.2} 251.2`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <div className="gauge-text">
                  <div className="gauge-amount">
                    ${totalSpent.toFixed(2)} / ${budgetGoal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="budget-stats">
                <div className="stat-item">
                  <div className="stat-label">Spent</div>
                  <div className="stat-value">${totalSpent.toFixed(2)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Remaining</div>
                  <div className="stat-value">${remaining.toFixed(2)}</div>
                </div>
              </div>

              <div className="budget-goal">Monthly Budget: ${budgetGoal.toFixed(2)}</div>
            </div>
          </div>

          {/* Add Expense Section */}
          <div className="add-expense-section">
            <h2 className="section-title">Add New Expense</h2>
            <div className="expense-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newExpense.price}
                  onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select category</option>
                  {userData.categories.map((cat) => (
                    <option key={cat.id} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="category-btn"
                >
                  + Category
                </button>
              </div>

              {showAddCategory && (
                <div className="category-popup">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="category-input"
                  />
                  <button onClick={handleAddCategory} className="category-save-btn">
                    Save
                  </button>
                </div>
              )}

              <button onClick={handleAddExpense} className="add-btn">
                Add Expense
              </button>
            </div>
          </div>

          {/* Expenses List */}
          <div className="expenses-section">
            <h2 className="section-title">Recent Expenses</h2>
            <div className="expenses-list">
              {userData.expense_items.length === 0 ? (
                <div className="empty-state">
                  No expenses yet. Add your first expense above!
                </div>
              ) : (
                userData.expense_items.map((exp, idx) => (
                  <div key={exp.id || idx} className="expense-item">
                    <div className="expense-info">
                      <div className="expense-name">{exp.item}</div>
                      <div className="expense-meta">
                        <span className="expense-category">{exp.category.category_name}</span>
                      </div>
                    </div>
                    <div className="expense-actions">
                      <div className="expense-price">
                        ${parseFloat(exp.price).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id || idx)}
                        className="delete-btn"
                        title="Delete expense"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
