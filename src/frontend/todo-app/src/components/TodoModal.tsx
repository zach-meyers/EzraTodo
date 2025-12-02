import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodoMutations';
import { TodoModalProps, TodoFormData } from '@/types';
import { parseError, getErrorMessage } from '@/utils/errorUtils';
import './TodoModal.css';

const TodoModal = ({ isOpen, onClose, initialData = null, onSuccess }: TodoModalProps) => {
  const [formData, setFormData] = useState<TodoFormData>({
    name: '',
    dueDate: '',
    notes: '',
    tags: '',
    location: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // TanStack Query mutations
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const isEditing = initialData !== null;
  const mutation = isEditing ? updateTodo : createTodo;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        dueDate: initialData.dueDate?.split('T')[0] || '',
        notes: initialData.notes || '',
        tags: initialData.tags?.join(', ') || '',
        location: initialData.location || '',
      });
    } else {
      setFormData({
        name: '',
        dueDate: '',
        notes: '',
        tags: '',
        location: '',
      });
    }
    // Clear validation errors when modal opens
    setValidationErrors(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setValidationErrors(null);

    const todoData = {
      name: formData.name,
      dueDate: new Date(formData.dueDate).toISOString(),
      notes: formData.notes || null,
      tags: formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [],
      location: formData.location || null,
    };

    if (isEditing && initialData) {
      // Update existing todo
      updateTodo.mutate(
        { id: initialData.id, todo: todoData },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
          onError: (err) => {
            const parsed = parseError(err);
            toast.error(`Failed to update todo: ${getErrorMessage(err)}`);

            // Display validation errors inline if present
            if (parsed.validationErrors) {
              setValidationErrors(parsed.validationErrors);
            }
          },
        }
      );
    } else {
      // Create new todo
      createTodo.mutate(todoData, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
        onError: (err) => {
          const parsed = parseError(err);
          toast.error(`Failed to create todo: ${getErrorMessage(err)}`);

          // Display validation errors inline if present
          if (parsed.validationErrors) {
            setValidationErrors(parsed.validationErrors);
          }
        },
      });
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Todo' : 'Create New Todo'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter todo name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional details..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas (e.g., work, urgent, meeting)"
            />
            <small className="help-text">Separate multiple tags with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
            />
          </div>

          {validationErrors && (
            <div className="validation-errors" style={{ color: 'red', marginTop: '1rem' }}>
              <strong>Validation Errors:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
