// Inline editing for local VS Code previews only (Live Preview / Simple Browser / file://).
// This script is a no-op on any real deployed domain — see the guard below.
(function () {
  const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', ''];
  const isLocalPreview = LOCAL_HOSTS.includes(location.hostname) || location.protocol === 'file:';
  if (!isLocalPreview) return;

  if (!window.PORTFOLIO_CONTENT) return;

  // Working copy of the content. Edits accumulate here until saved.
  let draft = structuredClone(window.PORTFOLIO_CONTENT);
  let fileHandle = null;
  let editModeOn = false;

  // --- path helpers: "work.cases[0].bullets[1]" -> ['work', 'cases', 0, 'bullets', 1]

  function parsePath(path) {
    const parts = [];
    path.split('.').forEach((segment) => {
      const match = segment.match(/^([^\[]+)((?:\[\d+\])*)$/);
      if (!match) {
        parts.push(segment);
        return;
      }
      parts.push(match[1]);
      const indices = match[2].match(/\d+/g);
      if (indices) indices.forEach((i) => parts.push(Number(i)));
    });
    return parts;
  }

  function setPath(obj, path, value) {
    const parts = parsePath(path);
    let target = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]];
      if (target == null) return false;
    }
    target[parts[parts.length - 1]] = value;
    return true;
  }

  // --- toolbar UI

  const toolbar = document.createElement('div');
  toolbar.className = 'edit-toolbar';
  toolbar.innerHTML = `
    <button type="button" class="edit-toolbar-toggle">Edit Mode: Off</button>
    <button type="button" class="edit-toolbar-save" disabled>Save to content.js</button>
    <span class="edit-toolbar-status"></span>
  `;
  document.body.appendChild(toolbar);

  const toggleButton = toolbar.querySelector('.edit-toolbar-toggle');
  const saveButton = toolbar.querySelector('.edit-toolbar-save');
  const statusEl = toolbar.querySelector('.edit-toolbar-status');

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function setEditableAttributes(enabled) {
    document.querySelectorAll('[data-edit]').forEach((el) => {
      if (enabled) {
        el.setAttribute('contenteditable', 'true');
      } else {
        el.removeAttribute('contenteditable');
      }
    });
  }

  function setEditMode(enabled) {
    editModeOn = enabled;
    document.body.classList.toggle('edit-mode-active', enabled);
    setEditableAttributes(enabled);
    toggleButton.textContent = `Edit Mode: ${enabled ? 'On' : 'Off'}`;
    saveButton.disabled = !enabled;
    setStatus(enabled ? 'Click any highlighted text to edit it.' : '');
  }

  toggleButton.addEventListener('click', () => setEditMode(!editModeOn));

  // Re-apply contenteditable to anything re-rendered while edit mode is already on
  // (e.g. reveal animations don't re-render, but this keeps behavior consistent
  // if a render function is ever re-run after toggling on).
  function getEditableTarget(target) {
    if (!target || !target.closest) return null;

    const editable = target.closest('[data-edit]');
    if (!editable) return null;

    const nestedEditable = editable.querySelector('[data-edit]');
    if (nestedEditable && nestedEditable !== editable) {
      return null;
    }

    return editable;
  }

  document.addEventListener('blur', (event) => {
    const target = event.target;
    const editable = getEditableTarget(target);
    if (!editable || !editable.matches('[contenteditable="true"]')) return;

    const path = editable.getAttribute('data-edit');
    const value = editable.textContent.trim();
    if (setPath(draft, path, value)) {
      setStatus(`Updated ${path}`);
    }
  }, true);

  // --- saving

  function serializeDraft() {
    return `window.PORTFOLIO_CONTENT = ${JSON.stringify(draft, null, 2)};\n`;
  }

  // If dev-server.js is serving this page, saves can go straight to disk with
  // no picker. Only true when the page itself was loaded over http(s) from
  // that server — file:// / Live Preview pages fall through to the picker.
  async function hasDevServer() {
    if (location.protocol === 'file:') return false;
    try {
      const response = await fetch('/__save', { method: 'OPTIONS' });
      return response.status !== 404;
    } catch {
      return false;
    }
  }

  async function saveViaFilePicker() {
    if (!fileHandle) {
      fileHandle = await window.showOpenFilePicker({
        types: [
          {
            description: 'JavaScript',
            accept: { 'text/javascript': ['.js'] },
          },
        ],
        multiple: false,
      }).then((handles) => handles[0]);
    }

    const permission = await fileHandle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('File write permission was not granted.');
    }

    const writable = await fileHandle.createWritable();
    await writable.write(serializeDraft());
    await writable.close();
  }

  function saveViaDownload() {
    const blob = new Blob([serializeDraft()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.js';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function saveViaDevServer() {
    const response = await fetch('/__save', { method: 'POST', body: serializeDraft() });
    if (!response.ok) throw new Error(`Dev server responded ${response.status}`);
  }

  saveButton.addEventListener('click', async () => {
    saveButton.disabled = true;
    try {
      if (await hasDevServer()) {
        await saveViaDevServer();
        setStatus('Saved to content.js.');
      } else if (window.showOpenFilePicker) {
        setStatus('Choose content.js in the file picker…');
        await saveViaFilePicker();
        setStatus('Saved to content.js.');
      } else {
        saveViaDownload();
        setStatus('File System Access API unavailable — downloaded content.js instead. Move it into the project folder.');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') {
        setStatus('Save cancelled.');
      } else {
        console.error(error);
        setStatus('Save failed — see console for details.');
      }
    } finally {
      saveButton.disabled = !editModeOn;
    }
  });
})();
