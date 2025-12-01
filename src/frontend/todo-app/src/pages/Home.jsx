import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSignOutAlt, FaFilter } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { todosAPI } from '../services/api';
import TodoCard from '../components/TodoCard';
import TodoModal from '../components/TodoModal';
import './Home.css';

const Home = () => {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dueDateFrom: '',
    dueDateTo: '',
    createdDateFrom: '',
    createdDateTo: '',
    tag: '',
    searchTerm: '',
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [todos, filters]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todosAPI.getAll();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...todos];

    // Search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        todo =>
          todo.name.toLowerCase().includes(search) ||
          todo.notes?.toLowerCase().includes(search) ||
          todo.location?.toLowerCase().includes(search)
      );
    }

    // Due date filters
    if (filters.dueDateFrom) {
      filtered = filtered.filter(
        todo => new Date(todo.dueDate) >= new Date(filters.dueDateFrom)
      );
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter(
        todo => new Date(todo.dueDate) <= new Date(filters.dueDateTo)
      );
    }

    // Created date filters
    if (filters.createdDateFrom) {
      filtered = filtered.filter(
        todo => new Date(todo.createdDate) >= new Date(filters.createdDateFrom)
      );
    }
    if (filters.createdDateTo) {
      filtered = filtered.filter(
        todo => new Date(todo.createdDate) <= new Date(filters.createdDateTo)
      );
    }

    // Tag filter
    if (filters.tag) {
      filtered = filtered.filter(todo =>
        todo.tags?.some(tag => tag.toLowerCase().includes(filters.tag.toLowerCase()))
      );
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setFilteredTodos(filtered);
  };

  const handleCreateTodo = async (todoData) => {
    try {
      await todosAPI.create(todoData);
      fetchTodos();
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Failed to create todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await todosAPI.delete(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearFilters = () => {
    setFilters({
      dueDateFrom: '',
      dueDateTo: '',
      createdDateFrom: '',
      createdDateTo: '',
      tag: '',
      searchTerm: '',
    });
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>My Todos</h1>
          <div className="navbar-actions">
            <span className="user-email">{user?.email}</span>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="content-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search todos..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>

          <div className="header-actions">
            <button
              className="btn-filter"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </button>
            <button className="btn-create" onClick={() => setIsModalOpen(true)}>
              <FaPlus /> New Todo
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Due Date From</label>
                <input
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dueDateFrom: e.target.value })
                  }
                />
              </div>

              <div className="filter-group">
                <label>Due Date To</label>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dueDateTo: e.target.value })
                  }
                />
              </div>

              <div className="filter-group">
                <label>Created From</label>
                <input
                  type="date"
                  value={filters.createdDateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, createdDateFrom: e.target.value })
                  }
                />
              </div>

              <div className="filter-group">
                <label>Created To</label>
                <input
                  type="date"
                  value={filters.createdDateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, createdDateTo: e.target.value })
                  }
                />
              </div>

              <div className="filter-group">
                <label>Tag</label>
                <input
                  type="text"
                  placeholder="Filter by tag..."
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        <div className="todos-stats">
          <p>
            Showing {filteredTodos.length} of {todos.length} todos
          </p>
        </div>

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <h2>No todos found</h2>
            <p>
              {todos.length === 0
                ? 'Create your first todo to get started!'
                : 'Try adjusting your filters or search term.'}
            </p>
            {todos.length === 0 && (
              <button className="btn-create" onClick={() => setIsModalOpen(true)}>
                <FaPlus /> Create Todo
              </button>
            )}
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onDelete={handleDeleteTodo} />
            ))}
          </div>
        )}
      </div>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTodo}
      />
    </div>
  );
};

export default Home;
