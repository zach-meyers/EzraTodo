import { FaCalendar, FaMapMarkerAlt, FaTag, FaTrash } from 'react-icons/fa';
import { useDeleteTodo } from '@/hooks/useTodoMutations';
import { TodoCardProps } from '@/types';
import './TodoCard.css';

const TodoCard = ({ todo }: TodoCardProps) => {
  const deleteTodo = useDeleteTodo();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (): void => {
    if (!window.confirm(`Are you sure you want to delete "${todo.name}"?`)) {
      return;
    }

    deleteTodo.mutate(todo.id, {
      onError: (error) => {
        alert(`Failed to delete todo: ${error.message}`);
      },
    });
  };

  const isOverdue: boolean = new Date(todo.dueDate) < new Date();
  const isDeleting: boolean = deleteTodo.isPending;

  return (
    <div className={`todo-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="todo-card-header">
        <h3>{todo.name}</h3>
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={isDeleting}
          title={isDeleting ? 'Deleting...' : 'Delete todo'}
          style={{ opacity: isDeleting ? 0.5 : 1 }}
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
