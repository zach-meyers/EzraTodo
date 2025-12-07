import { useState, useMemo, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSignOutAlt, FaFilter } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useTodos } from '@/hooks/useTodoQueries';
import { getErrorMessage } from '@/utils/errorUtils';
import TodoCard from '@/components/TodoCard';
import TodoModal from '@/components/TodoModal';
import { TodoFiltersExtended, TodoItemResponse } from '@/types';
import './Home.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<TodoItemResponse | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<TodoFiltersExtended>({
    dueDateFrom: '',
    dueDateTo: '',
    createdDateFrom: '',
    createdDateTo: '',
    tag: '',
    searchTerm: '',
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: todos = [], isLoading, isError, error, refetch } = useTodos();

  const filteredTodos = useMemo(() => {
    let filtered = [...todos];

    // generic search term
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.name.toLowerCase().includes(search) ||
          todo.notes?.toLowerCase().includes(search) ||
          todo.location?.toLowerCase().includes(search)
      );
    }

    // due date
    if (filters.dueDateFrom) {
      filtered = filtered.filter((todo) => new Date(todo.dueDate) >= new Date(filters.dueDateFrom!));
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter((todo) => new Date(todo.dueDate) <= new Date(filters.dueDateTo!));
    }

    // created date
    if (filters.createdDateFrom) {
      filtered = filtered.filter((todo) => new Date(todo.createdDate) >= new Date(filters.createdDateFrom!));
    }
    if (filters.createdDateTo) {
      filtered = filtered.filter((todo) => new Date(todo.createdDate) <= new Date(filters.createdDateTo!));
    }

    // tag
    if (filters.tag) {
      filtered = filtered.filter((todo) => todo.tags?.some((tag) => tag.toLowerCase().includes(filters.tag!.toLowerCase())));
    }

    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return filtered;
  }, [todos, filters]);

  const handleCreateTodo = (): void => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: TodoItemResponse): void => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const clearFilters = (): void => {
    setFilters({
      dueDateFrom: '',
      dueDateTo: '',
      createdDateFrom: '',
      createdDateTo: '',
      tag: '',
      searchTerm: '',
    });
  };

  const handleFilterChange = (field: keyof TodoFiltersExtended, value: string): void => {
    setFilters({ ...filters, [field]: value });
  };

  if (isLoading) {
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
          <div className="loading">Loading todos...</div>
        </div>
      </div>
    );
  }

  if (isError) {
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
          <div className="error">
            <h2>Error Loading Todos</h2>
            <p>{getErrorMessage(error)}</p>
            <button className="btn-create" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
            <button className="btn-create" onClick={handleCreateTodo}>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('dueDateFrom', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Due Date To</label>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('dueDateTo', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Created From</label>
                <input
                  type="date"
                  value={filters.createdDateFrom}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('createdDateFrom', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Created To</label>
                <input
                  type="date"
                  value={filters.createdDateTo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('createdDateTo', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Tag</label>
                <input
                  type="text"
                  placeholder="Filter by tag..."
                  value={filters.tag}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('tag', e.target.value)}
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

        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <h2>No todos found</h2>
            <p>{todos.length === 0 ? 'Create your first todo to get started!' : 'Try adjusting your filters or search term.'}</p>
            {todos.length === 0 && (
              <button className="btn-create" onClick={handleCreateTodo}>
                <FaPlus /> Create Todo
              </button>
            )}
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onEdit={handleEditTodo} />
            ))}
          </div>
        )}
      </div>

      <TodoModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={editingTodo} />
    </div>
  );
};

export default Home;
