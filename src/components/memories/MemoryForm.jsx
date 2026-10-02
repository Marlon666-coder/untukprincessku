import { useEffect, useRef, useState } from 'react';
import { photoService } from '../../services';
import { createEmptyMemory } from '../../types/models';
import { todayISO } from '../../utils/date';
import { Button } from '../ui/Button';
import { SelectField, TextArea, TextField, Toggle } from '../ui/FormField';
import { StarRating } from '../ui/StarRating';
import './MemoryForm.css';

/**
 * Add Memory form with photo picker.
 * Photos go through photoService (temporary preview now, Supabase Storage later).
 */
export function MemoryForm({ places = [], onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => ({ ...createEmptyMemory(), date: todayISO() }));
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const submittedRef = useRef(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  // Free temporary blob URLs if the form is closed without saving.
  useEffect(
    () => () => {
      if (!submittedRef.current) photosRef.current.forEach((photo) => photoService.releasePreview(photo));
    },
    [],
  );

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleFiles = async (fileList) => {
    setError('');
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(fileList)) {
        uploaded.push(await photoService.uploadMemoryPhoto(file));
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removePhoto = (photo) => {
    photoService.releasePreview(photo);
    setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.title.trim()) {
      setError('Kasih judul untuk kenangan ini ya ♡');
      return;
    }
    const place = places.find((item) => item.id === values.place_id);
    submittedRef.current = true;
    onSubmit({
      ...values,
      title: values.title.trim(),
      place_id: place?.id ?? null,
      place_name: place?.name ?? values.place_name,
      rating: values.rating || null,
      photos,
    });
  };

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <div className="photo-picker">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-picker__thumb">
            <img src={photo.photo_url} alt="" />
            <button type="button" onClick={() => removePhoto(photo)} aria-label="Remove photo">
              ✕
            </button>
          </div>
        ))}
        <label className="photo-picker__add">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => event.target.files?.length && handleFiles(event.target.files)}
          />
          <span aria-hidden="true">{uploading ? '⏳' : '📷'}</span>
          <strong>Upload Photo</strong>
        </label>
      </div>
      <p className="text-muted">
        Foto saat ini hanya preview sementara. Setelah Supabase Storage terhubung, foto akan tersimpan permanen di cloud.
      </p>

      <div className="form-grid form-grid--2">
        <TextField className="span-2" label="Title" placeholder="Senja di taman" value={values.title} onChange={set('title')} error={error} />
        <TextField label="Date" type="date" value={values.date} onChange={set('date')} />
        <SelectField
          label="Place"
          value={values.place_id ?? ''}
          onChange={(event) => setValues((prev) => ({ ...prev, place_id: event.target.value || null }))}
          options={[{ value: '', label: '— Choose a place —' }, ...places.map((place) => ({ value: place.id, label: place.name }))]}
        />
        <TextArea className="span-2" label="Description" placeholder="Ceritakan momen ini…" rows={3} value={values.description} onChange={set('description')} />
      </div>

      <div className="row row--between">
        <div className="field">
          <span className="field__label">Rating</span>
          <StarRating value={values.rating || 0} onChange={(rating) => setValues((prev) => ({ ...prev, rating }))} label="Memory rating" />
        </div>
        <Toggle label="❤️ Favorite" checked={values.favorite} onChange={(favorite) => setValues((prev) => ({ ...prev, favorite }))} />
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting} disabled={uploading}>
          Save Memory ♡
        </Button>
      </div>
    </form>
  );
}
