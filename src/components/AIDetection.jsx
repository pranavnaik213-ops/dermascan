import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, ShieldCheck, Trash2, Upload } from 'lucide-react';
import CameraModal from './CameraModal';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export default function AIDetection({ onPhotoReady }) {
  const fileInput = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');

  const readPhoto = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to continue.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('This photo is larger than 8 MB. Choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto({ dataUrl: reader.result, name: file.name });
    reader.onerror = () => setError('The photo could not be opened. Try another image.');
    reader.readAsDataURL(file);
  };

  const usePhoto = () => {
    if (!photo) return;
    onPhotoReady({ photoUrl: photo.dataUrl, photoName: photo.name || 'Camera photo' });
  };

  return (
    <section className="page-wrap content-page photo-review-page" aria-labelledby="photo-review-title">
      <header className="page-intro page-intro-left">
        <span className="eyebrow">PHOTO REVIEW</span>
        <h1 id="photo-review-title">Choose a photo to include in your report</h1>
        <p>This tool prepares a photo for your report. It does not identify a condition or provide a diagnosis.</p>
      </header>

      <div className="photo-review-layout">
        <div className="panel photo-review-panel">
          {photo ? (
            <div className="photo-review-preview">
              <img src={photo.dataUrl} alt="Selected animal photo preview" />
              <div className="photo-review-file"><ImagePlus size={16} aria-hidden="true" /><span>{photo.name || 'Camera photo'}</span></div>
            </div>
          ) : (
            <div className="photo-review-empty">
              <span className="photo-review-empty-icon"><ImagePlus size={26} aria-hidden="true" /></span>
              <h2>No photo selected</h2>
              <p>Choose a clear, well-lit image. Keep a safe distance from the animal.</p>
              <div className="photo-review-actions">
                <button type="button" className="button button-primary" onClick={() => fileInput.current?.click()}><Upload size={16} aria-hidden="true" /> Choose photo</button>
                <button type="button" className="button button-secondary" onClick={() => setCameraOpen(true)}><Camera size={16} aria-hidden="true" /> Use camera</button>
              </div>
            </div>
          )}

          {photo && (
            <div className="photo-review-controls">
              <button type="button" className="button button-secondary" onClick={() => fileInput.current?.click()}><Upload size={16} aria-hidden="true" /> Choose another</button>
              <button type="button" className="button button-quiet" onClick={() => { setPhoto(null); setError(''); }}><Trash2 size={16} aria-hidden="true" /> Remove photo</button>
              <button type="button" className="button button-primary" onClick={usePhoto}>Continue to report</button>
            </div>
          )}
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={(event) => { readPhoto(event.target.files?.[0]); event.target.value = ''; }} aria-label="Choose an animal photo" />
        </div>

        <aside className="panel photo-review-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <h2>A note on photo review</h2>
          <p>A photo can help you describe what you noticed to a veterinarian. It cannot confirm a condition. For urgent injuries or distress, contact a veterinarian directly.</p>
          <ul>
            <li>Take a photo only if it is safe to do so.</li>
            <li>Avoid approaching or touching a frightened animal.</li>
            <li>Your photo is added only if you continue to the report.</li>
          </ul>
        </aside>
      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => { setPhoto({ dataUrl, name: 'Camera photo' }); setError(''); }}
      />
    </section>
  );
}
