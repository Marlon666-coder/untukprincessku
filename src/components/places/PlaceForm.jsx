import { useState } from 'react';
import { createEmptyPlace, PLACE_CATEGORIES } from '../../types/models';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Badge';
import { TextField, Toggle } from '../ui/FormField';
import './PlaceForm.css';

const toNumberOrNull = (value) => (value === '' || value == null || Number.isNaN(Number(value)) ? null : Number(value));

/** Create / edit a place. Values match the `places` table. */
export function PlaceForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => ({ ...createEmptyPlace(), ...initialValues }));
  const [error, setError] = useState('');

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('Nama tempatnya diisi dulu ya ♡');
      return;
    }
    onSubmit({
      ...values,
      name: values.name.trim(),
      latitude: toNumberOrNull(values.latitude),
      longitude: toNumberOrNull(values.longitude),
      maps_url: values.maps_url.trim(),
    });
  };

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid--2">
        <TextField className="span-2" label="Place Name" placeholder="Little Ramen House" value={values.name} onChange={set('name')} error={error} />
        <TextField className="span-2" label="Address" placeholder="Jl. …" value={values.address} onChange={set('address')} />
      </div>

      <div className="field">
        <span className="field__label">Category</span>
        <div className="scroll-x" role="group" aria-label="Category">
          {Object.values(PLACE_CATEGORIES).map((category) => (
            <Chip
              key={category.key}
              icon={category.emoji}
              selected={values.category === category.key}
              onClick={() => setValues((prev) => ({ ...prev, category: category.key }))}
            >
              {category.label}
            </Chip>
          ))}
        </div>
      </div>

      <details className="place-form__more">
        <summary className="field__label">Google Maps details (optional)</summary>
        <div className="form-grid form-grid--2">
          <TextField
            className="span-2"
            label="Google Maps link"
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            value={values.maps_url}
            onChange={set('maps_url')}
            hint="Kalau kosong, kami buat link pencarian otomatis dari nama + alamat."
          />
          <TextField label="Latitude" inputMode="decimal" placeholder="-6.1951" value={values.latitude ?? ''} onChange={set('latitude')} />
          <TextField label="Longitude" inputMode="decimal" placeholder="106.8209" value={values.longitude ?? ''} onChange={set('longitude')} />
        </div>
      </details>

      <div className="row">
        <Toggle label="📍 We've been here" checked={values.visited} onChange={(visited) => setValues((prev) => ({ ...prev, visited }))} />
        <Toggle label="❤️ Favorite" checked={values.favorite} onChange={(favorite) => setValues((prev) => ({ ...prev, favorite }))} />
      </div>

      <p className="text-muted">📷 Foto tempat bisa ditambahkan setelah Supabase Storage terhubung.</p>

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          Save Place ♡
        </Button>
      </div>
    </form>
  );
}
