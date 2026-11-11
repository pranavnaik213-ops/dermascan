/**
 * Trigger a cross-browser file download from a Blob, compatible with desktop browsers,
 * Android Chrome, iOS Safari, and embedded mobile WebViews.
 */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  if (typeof link.download !== 'undefined') {
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(url, '_blank', 'noopener');
  }

  // Delay revoking object URL so iOS Safari / WebKit finishes reading the Blob
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

