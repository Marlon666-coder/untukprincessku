import { useEffect, useState } from 'react';
import { MusicControl } from '../components/music/MusicControl';
import { Badge, Button, Card, PageHeader, TextArea, TextField } from '../components/ui';
import { isSupabaseConfigured } from '../config/env';
import { THEMES, useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import './SettingsPage.css';

function SettingsSection({ icon, title, description, children }) {
  return (
    <Card className="settings-section">
      <header className="settings-section__header">
        <span className="settings-section__icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          {description && <p className="text-muted">{description}</p>}
        </div>
      </header>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const toast = useToast();
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  if (!draft) return null;

  const set = (field) => (event) => setDraft((prev) => ({ ...prev, [field]: event.target.value }));
  const save = async (fields, message = 'Saved ♡') => {
    const patch = Object.fromEntries(fields.map((field) => [field, draft[field]]));
    await updateSettings(patch);
    toast.show(message);
  };

  return (
    <>
      <PageHeader eyebrow="make it ours" title="Settings ⚙" subtitle="Atur dunia kecil kita." />

      <div className="settings-grid">
        <SettingsSection icon="🙂" title="Profile" description="Nama yang tampil di website.">
          <div className="stack">
            <TextField label="My name" value={draft.my_name} onChange={set('my_name')} />
            <Button size="sm" onClick={() => save(['my_name'])}>
              Save profile
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection icon="💞" title="Couple Information" description="Tentang kita berdua.">
          <div className="stack">
            <TextField label="Partner's name" value={draft.partner_name} onChange={set('partner_name')} />
            <TextField label="Our anniversary" type="date" value={draft.anniversary} onChange={set('anniversary')} />
            <Button size="sm" onClick={() => save(['partner_name', 'anniversary'])}>
              Save couple info
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection icon="🎨" title="Theme" description="Pilih nuansa warna favorit.">
          <div className="theme-picker" role="radiogroup" aria-label="Theme">
            {THEMES.map((theme) => (
              <button
                key={theme.key}
                type="button"
                role="radio"
                aria-checked={settings.theme === theme.key}
                className={cn('theme-picker__option', settings.theme === theme.key && 'is-active')}
                onClick={() => {
                  setDraft((prev) => ({ ...prev, theme: theme.key }));
                  updateSettings({ theme: theme.key });
                }}
              >
                <span className="theme-picker__swatch" style={{ background: theme.swatch }} />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection icon="♫" title="Music" description="Music box lembut. Default selalu OFF.">
          <MusicControl />
        </SettingsSection>

        <SettingsSection icon="💌" title="Something for You" description="Pesan rahasia yang muncul di Home.">
          <div className="stack">
            <TextArea label="Secret message" rows={10} value={draft.secret_message} onChange={set('secret_message')} />
            <Button size="sm" onClick={() => save(['secret_message'], 'Message updated 💌')}>
              Save message
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection icon="🔒" title="Privacy" description="Website ini hanya untuk kita berdua.">
          <ul className="settings-list">
            <li>
              <span>Hidden from search engines</span>
              <Badge tone="green">On</Badge>
            </li>
            <li>
              <span>Private login (Supabase Auth)</span>
              <Badge tone={isSupabaseConfigured ? 'green' : 'amber'}>{isSupabaseConfigured ? 'Connected' : 'Next step'}</Badge>
            </li>
            <li>
              <span>Data only visible to our couple (Row Level Security)</span>
              <Badge tone="amber">Next step</Badge>
            </li>
          </ul>
        </SettingsSection>

        <SettingsSection icon="☁" title="Backup" description="Data akan tersimpan aman di Supabase.">
          <ul className="settings-list">
            <li>
              <span>Cloud database</span>
              <Badge tone={isSupabaseConfigured ? 'green' : 'amber'}>{isSupabaseConfigured ? 'Connected' : 'Not connected'}</Badge>
            </li>
            <li>
              <span>Photo storage</span>
              <Badge tone="amber">Not connected</Badge>
            </li>
          </ul>
          <Button variant="secondary" size="sm" disabled>
            Export backup (after Supabase)
          </Button>
        </SettingsSection>

        <SettingsSection icon="🌸" title="About">
          <p className="text-soft">
            <strong>Our Little World ♡</strong> — v0.1.0 (UI foundation).
            <br />
            Dibuat khusus untuk {settings.partner_name}, supaya setiap cerita kita punya tempat pulang.
          </p>
        </SettingsSection>
      </div>
    </>
  );
}
