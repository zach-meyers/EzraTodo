import { FaCalendar, FaMapMarkerAlt, FaTag, FaTrash } from 'react-icons/fa';
import './TodoCard.css';

const TodoCard = ({ todo, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = new Date(todo.dueDate) < new Date();

  return (
    <div className={`todo-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="todo-card-header">
        <h3>{todo.name}</h3>
        <button
          className="delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete todo"
        >
          <FaTrash />
        </button>
      </div>

      {todo.notes && (
        <p className="todo-notes">{todo.notes}</p>
      )}

      <div className="todo-metadata">
        <div className="metadata-item">
          <FaCalendar />
          <span>Due: {formatDate(todo.dueDate)}</span>
        </div>

        {todo.location && (
          <div className="metadata-item">
            <FaMapMarkerAlt />
            <span>{todo.location}</span>
          </div>
        )}
      </div>

      {todo.tags && todo.tags.length > 0 && (
        <div className="todo-tags">
          <FaTag className="tag-icon" />
          {todo.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="todo-footer">
        <small>Created: {formatDate(todo.createdDate)}</small>
      </div>
    </div>
  );
};

export default TodoCard;
