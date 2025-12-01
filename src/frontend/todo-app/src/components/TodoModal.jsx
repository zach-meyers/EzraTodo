import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './TodoModal.css';

const TodoModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e) => {
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
