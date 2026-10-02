import { useState } from 'react';
import { todayISO } from '../../utils/date';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Badge';
import { TextArea, TextField } from '../ui/FormField';

const EMOJIS = ['🌸', '♡', '🎬', '🌙', '🍜', '🎂', '✈️', '🎁', '📸', '💍'];

/** Add a moment to Our Story. Values match the `story_events` table. */
export function StoryForm({ onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({ date: todayISO(), title: '', place: '', description: '', emoji: '🌸', photo_url: null, favorite: false });
  const [error, setError] = useState('');
  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <form
      className="stack"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.title.trim() || !values.date) {
          setError('Judul dan tanggal wajib diisi ♡');
          return;
        }
        onSubmit({ ...values, title: values.title.trim() });
      }}
    >
      <div className="form-grid form-grid--2">
        <TextField className="span-2" label="Title" placeholder="Our First Date" value={values.title} onChange={set('title')} error={error} />
        <TextField label="Date" type="date" value={values.date} onChange={set('date')} />
        <TextField label="Place" placeholder="Taman Literasi" value={values.place} onChange={set('place')} />
        <TextArea className="span-2" label="Description" rows={3} value={values.description} onChange={set('description')} />
      </div>
      <div className="field">
        <span className="field__label">Sticker</span>
        <div className="scroll-x">
          {EMOJIS.map((emoji) => (
            <Chip key={emoji} selected={values.emoji === emoji} onClick={() => setValues((prev) => ({ ...prev, emoji }))} aria-label={`Sticker ${emoji}`}>
              {emoji}
            </Chip>
          ))}
        </div>
      </div>
      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          Add to Our Story ♡
        </Button>
      </div>
    </form>
  );
}
