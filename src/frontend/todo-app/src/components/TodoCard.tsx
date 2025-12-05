import { FaCalendar, FaMapMarkerAlt, FaTag, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDeleteTodo } from '@/hooks/useTodoMutations';
import { TodoCardProps } from '@/types';
import { getErrorMessage } from '@/utils/errorUtils';
import './TodoCard.css';

const TodoCard = ({ todo, onEdit }: TodoCardProps) => {
  const deleteTodo = useDeleteTodo();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = (): void => {
    if (!window.confirm(`Are you sure you want to delete "${todo.name}"?`)) {
      return;
    }

    deleteTodo.mutate(todo.id, {
      onError: (error) => {
        toast.error(`Failed to delete "${todo.name}": ${getErrorMessage(error)}`);
      },
    });
  };

  const isOverdue: boolean = new Date(todo.dueDate) < new Date();
  const isDeleting: boolean = deleteTodo.isPending;

  return (
    <div className={`todo-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="todo-card-header">
        <h3>{todo.name}</h3>
        <div className="card-actions">
          {onEdit && (
            <button
              className="edit-btn"
              onClick={() => onEdit(todo)}
              disabled={isDeleting}
              title="Edit todo"
              style={{ opacity: isDeleting ? 0.5 : 1 }}
            >
              <FaEdit />
            </button>
          )}
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
      </div>

      {todo.notes && <p className="todo-notes">{todo.notes}</p>}

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
