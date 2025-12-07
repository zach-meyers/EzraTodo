import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodoMutations';
import { TodoModalProps, TodoFormData, TodoItemResponse, MutateTodoRequest } from '@/types';
import { parseError, getErrorMessage } from '@/utils/errorUtils';
import './TodoModal.css';

const TodoModal = ({ isOpen, onClose, initialData = null, onSuccess }: TodoModalProps) => {
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const isEditing = initialData !== null;
  const mutation = isEditing ? updateTodo : createTodo;

  // form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TodoFormData>({
    defaultValues: {
      name: '',
      dueDate: '',
      notes: '',
      tags: '',
      location: '',
    },
  });

  // set form when editing or reset when creating
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        dueDate: initialData.dueDate?.split('T')[0] || '',
        notes: initialData.notes || '',
        tags: initialData.tags?.join(', ') || '',
        location: initialData.location || '',
      });
    } else {
      reset({
        name: '',
        dueDate: '',
        notes: '',
        tags: '',
        location: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleUpdateTodo = (initialData: TodoItemResponse, todoData: MutateTodoRequest): void => {
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

          if (parsed.validationErrors) {
            Object.entries(parsed.validationErrors).forEach(([field, messages]) => {
              setError(field as keyof TodoFormData, {
                type: 'server',
                message: messages.join(', '),
              });
            });
          }
        },
      }
    );
  };

  const handleCreateTodo = (todoData: MutateTodoRequest): void => {
    createTodo.mutate(todoData, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
      onError: (err) => {
        const parsed = parseError(err);
        toast.error(`Failed to create todo: ${getErrorMessage(err)}`);

        if (parsed.validationErrors) {
          Object.entries(parsed.validationErrors).forEach(([field, messages]) => {
            setError(field as keyof TodoFormData, {
              type: 'server',
              message: messages.join(', '),
            });
          });
        }
      },
    });
  };

  const onSubmit: SubmitHandler<TodoFormData> = (data) => {
    const todoData: MutateTodoRequest = {
      name: data.name,
      dueDate: new Date(data.dueDate).toISOString(),
      notes: data.notes || null,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      location: data.location || null,
    };

    if (isEditing && initialData) {
      handleUpdateTodo(initialData, todoData);
    } else {
      handleCreateTodo(todoData);
    }
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: 'Name is required',
                maxLength: {
                  value: 200,
                  message: 'Name must not exceed 200 characters',
                },
              })}
              placeholder="Enter todo name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              id="dueDate"
              type="date"
              {...register('dueDate', {
                required: 'Due date is required',
              })}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional details..."
              rows={4}
              className={errors.notes ? 'error' : ''}
            />
            {errors.notes && <span className="error-message">{errors.notes.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              {...register('tags')}
              placeholder="Enter tags separated by commas (e.g., work, urgent, meeting)"
              className={errors.tags ? 'error' : ''}
            />
            <small className="help-text">Separate multiple tags with commas</small>
            {errors.tags && <span className="error-message">{errors.tags.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              {...register('location')}
              placeholder="Enter location"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <span className="error-message">{errors.location.message}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={mutation.isPending || isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending || isSubmitting}>
              {mutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
