import { useState } from 'react';
import { SpinWheel } from '../components/wheel/SpinWheel';
import { Button, Card, IconButton, PageHeader, Skeleton } from '../components/ui';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { wheelService } from '../services';
import { getGoogleMapsUrl } from '../utils/maps';
import './SpinWheelPage.css';

const QUICK_EMOJIS = ['🍜', '☕', '🎬', '🛍️', '🌳', '🍽️', '🍣', '🍕', '🎳', '🍦'];

export default function SpinWheelPage() {
  const { data: items, loading } = useServiceData(wheelService.listItems, wheelService.subscribe);
  const [result, setResult] = useState(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(QUICK_EMOJIS[0]);
  const [createItem, adding] = useAsyncAction(wheelService.createItem);
  const [deleteItem] = useAsyncAction(wheelService.deleteItem);

  const handleAdd = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (await createItem({ name: trimmed, emoji, category: 'other', maps_url: '' })) {
      setName('');
      setEmoji(QUICK_EMOJIS[(QUICK_EMOJIS.indexOf(emoji) + 1) % QUICK_EMOJIS.length]);
    }
  };

  return (
    <>
      <PageHeader eyebrow="can't decide?" title="WHERE SHOULD WE GO? 🎡" subtitle="Biar wheel yang memilih, kita tinggal berangkat." />

      <div className="spin-layout">
        <section className="spin-stage">
          {loading ? <Skeleton height={340} /> : <SpinWheel items={items ?? []} onResult={setResult} />}

          <div className="spin-result" aria-live="polite">
            {result && (
              <Card variant="soft" className="spin-result__card animate-scale-in">
                <p className="script spin-result__intro">Tonight we&apos;re going to... ♡</p>
                <p className="spin-result__name">
                  {result.name.toUpperCase()} {result.emoji}
                </p>
                <Button href={getGoogleMapsUrl({ name: result.name, maps_url: result.maps_url })}>Let&apos;s Go! 📍</Button>
              </Card>
            )}
          </div>
        </section>

        <Card className="spin-options">
          <h2 className="spin-options__title">Our options</h2>
          <form className="spin-options__form" onSubmit={handleAdd}>
            <button
              type="button"
              className="spin-options__emoji"
              onClick={() => setEmoji(QUICK_EMOJIS[(QUICK_EMOJIS.indexOf(emoji) + 1) % QUICK_EMOJIS.length])}
              aria-label="Change emoji"
            >
              {emoji}
            </button>
            <input className="input" placeholder="Ramen, Cafe, Mall…" value={name} onChange={(event) => setName(event.target.value)} aria-label="Option name" maxLength={30} />
            <Button type="submit" loading={adding} disabled={!name.trim()}>
              Add
            </Button>
          </form>
          <ul className="spin-options__list">
            {(items ?? []).map((item) => (
              <li key={item.id}>
                <span>
                  {item.emoji} {item.name}
                </span>
                <IconButton label={`Remove ${item.name}`} onClick={() => deleteItem(item.id)}>
                  ✕
                </IconButton>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
