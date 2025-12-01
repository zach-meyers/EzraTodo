import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import { TodoModalProps, TodoFormData } from '@/types';
import './TodoModal.css';

const TodoModal = ({ isOpen, onClose, onSubmit, initialData = null }: TodoModalProps) => {
  const [formData, setFormData] = useState<TodoFormData>({
    name: '',
    dueDate: '',
    notes: '',
    tags: '',
    location: '',
  });

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
  }, [initialData, isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const todoData = {
      name: formData.name,
      dueDate: new Date(formData.dueDate).toISOString(),
      notes: formData.notes || null,
      tags: formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [],
      location: formData.location || null,
    };

    onSubmit(todoData);
    onClose();
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

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
