// public/js/dashboard.js: Handles confirmation dialogs and UI for dashboard actions
window.addEventListener('DOMContentLoaded', () => {
  const deleteForm = document.getElementById('delete-account-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', (e) => {
      if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        e.preventDefault();
      }
    });
  }
});
