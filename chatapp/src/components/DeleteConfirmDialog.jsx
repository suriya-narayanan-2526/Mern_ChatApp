import React from 'react';
import '../styles/DeleteConfirmDialog.css';

function DeleteConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon-wrapper">
          <div className="dialog-icon">⚠️</div>
        </div>
        <h3 className="dialog-title">Delete Message?</h3>
        <p className="dialog-message">
          Are you sure you want to delete this message? This action cannot be undone and the message will be removed for everyone.
        </p>
        <div className="dialog-actions">
          <button 
            className="dialog-btn cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="dialog-btn delete-btn"
            onClick={onConfirm}
          >
            <span className="delete-icon">🗑️</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;