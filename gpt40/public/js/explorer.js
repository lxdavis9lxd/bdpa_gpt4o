// explorer.js: Render Markdown previews as images for file nodes
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.file-preview').forEach(div => {
    const content = div.getAttribute('data-content');
    if (content) {
      // Use marked to render markdown to HTML
      const html = window.marked.parse(content.split('\n').slice(0, 5).join('\n'));
      // Create a temp element to render HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      temp.style.width = '200px';
      temp.style.height = '80px';
      temp.style.overflow = 'hidden';
      temp.style.background = '#fff';
      temp.style.color = '#222';
      temp.style.fontSize = '0.9em';
      // Use dom-to-image to convert HTML to image
      window.domtoimage.toPng(temp).then(dataUrl => {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Preview';
        img.style.maxWidth = '120px';
        img.style.maxHeight = '60px';
        div.appendChild(img);
      }).catch(() => {
        div.textContent = '[Preview error]';
      });
    }
  });
});
