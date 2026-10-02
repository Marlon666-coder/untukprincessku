import { useState } from 'react';
import { createEmptyDate } from '../../types/models';
import { createId } from '../../utils/id';
import { Button, IconButton } from '../ui/Button';
import { TextArea, TextField } from '../ui/FormField';
import './DateForm.css';

const ACTIVITY_EMOJIS = ['🍽️', '☕', '🚶', '🎬', '🛍️', '📸', '🎡', '🍰', '🌙'];

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Kasih nama date-nya dulu ya ♡';
  if (!values.date) errors.date = 'Pilih tanggalnya.';
  if (values.planned_start && values.planned_end && values.planned_end <= values.planned_start) {
    errors.planned_end = 'Jam selesai harus setelah jam mulai.';
  }
  return errors;
}

/** Create / edit a date plan. `onSubmit` receives the values in the `dates` table shape. */
export function DateForm({ initialValues, onSubmit, onCancel, submitting, submitLabel = 'Save Date ♡' }) {
  const [values, setValues] = useState(() => ({ ...createEmptyDate(), ...initialValues }));
  const [errors, setErrors] = useState({});

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const updateActivity = (id, patch) =>
    setValues((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) => (activity.id === id ? { ...activity, ...patch } : activity)),
    }));

  const addActivity = () =>
    setValues((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        { id: createId('activity'), time: '', emoji: ACTIVITY_EMOJIS[prev.activities.length % ACTIVITY_EMOJIS.length], label: '', position: prev.activities.length },
      ],
    }));

  const removeActivity = (id) =>
    setValues((prev) => ({ ...prev, activities: prev.activities.filter((activity) => activity.id !== id) }));

  const cycleEmoji = (activity) => {
    const next = ACTIVITY_EMOJIS[(ACTIVITY_EMOJIS.indexOf(activity.emoji) + 1) % ACTIVITY_EMOJIS.length];
    updateActivity(activity.id, { emoji: next });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const activities = values.activities
      .filter((activity) => activity.label.trim())
      .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
      .map((activity, index) => ({ ...activity, position: index }));
    onSubmit({ ...values, title: values.title.trim(), activities });
  };

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid--2">
        <TextField className="span-2" label="Date Name" placeholder="Night Date" value={values.title} onChange={set('title')} error={errors.title} />
        <TextField label="Date" type="date" value={values.date} onChange={set('date')} error={errors.date} />
        <TextField label="Place" placeholder="Grand Indonesia" value={values.location} onChange={set('location')} />
        <TextField label="Start Time" type="time" value={values.planned_start} onChange={set('planned_start')} />
        <TextField label="End Time" type="time" value={values.planned_end} onChange={set('planned_end')} error={errors.planned_end} />
        <TextArea className="span-2" label="Description" placeholder="Dinner → Walk → Movie" rows={2} value={values.description} onChange={set('description')} />
        <TextArea className="span-2" label="Notes" placeholder="Hal kecil yang perlu diingat…" rows={2} value={values.notes} onChange={set('notes')} />
      </div>

      <fieldset className="activity-editor">
        <legend className="field__label">Activities & Timeline</legend>
        {values.activities.length === 0 && <p className="text-muted">Belum ada aktivitas. Tambahkan rencana kecilnya ♡</p>}
        {values.activities.map((activity) => (
          <div key={activity.id} className="activity-editor__row">
            <button type="button" className="activity-editor__emoji" onClick={() => cycleEmoji(activity)} aria-label="Change icon">
              {activity.emoji}
            </button>
            <input
              className="input activity-editor__time"
              type="time"
              aria-label="Activity time"
              value={activity.time}
              onChange={(event) => updateActivity(activity.id, { time: event.target.value })}
            />
            <input
              className="input"
              placeholder="Dinner"
              aria-label="Activity name"
              value={activity.label}
              onChange={(event) => updateActivity(activity.id, { label: event.target.value })}
            />
            <IconButton label="Remove activity" onClick={() => removeActivity(activity.id)}>
              ✕
            </IconButton>
          </div>
        ))}
        <Button variant="ghost" size="sm" icon="＋" onClick={addActivity}>
          Add activity
        </Button>
      </fieldset>

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
