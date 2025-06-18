// public/js/editor.js: Handles auto-save, lock polling, and UI events for the editor
window.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('editor-textarea');
  const saveBtn = document.getElementById('save-btn');
  const lockStatus = document.getElementById('lock-status');
  const nodeId = document.getElementById('node-id').value;
  let lastSaved = textarea.value;
  let autoSaveTimer = null;

  function setLockStatus(locked, by) {
    if (locked) {
      lockStatus.textContent = `Locked by ${by}`;
      textarea.disabled = true;
      saveBtn.disabled = true;
    } else {
      lockStatus.textContent = 'Unlocked';
      textarea.disabled = false;
      saveBtn.disabled = false;
    }
  }

  async function pollLock() {
    try {
      const res = await fetch(`/editor/${nodeId}/lock-status`);
      const data = await res.json();
      setLockStatus(data.locked, data.lockedBy);
    } catch {
      lockStatus.textContent = 'Lock status: unknown';
    }
  }

  async function autoSave() {
    if (textarea.value !== lastSaved) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
      try {
        const res = await fetch(`/editor/${nodeId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textarea.value })
        });
        if (res.ok) {
          lastSaved = textarea.value;
          saveBtn.textContent = 'Saved';
        } else {
          saveBtn.textContent = 'Save failed';
        }
      } catch {
        saveBtn.textContent = 'Save failed';
      }
      saveBtn.disabled = false;
      setTimeout(() => { saveBtn.textContent = 'Save'; }, 2000);
    }
  }

  textarea.addEventListener('input', () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(autoSave, 1500);
  });

  saveBtn.addEventListener('click', autoSave);

  setInterval(pollLock, 3000);
  pollLock();
});
