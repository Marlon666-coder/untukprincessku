import { Button, EmptyState } from '../components/ui';
import { ROUTES } from '../config/navigation';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon="🥀"
      title="Halaman ini tidak ada"
      message="Sepertinya kita tersesat. Yuk pulang ke dunia kecil kita."
      action={<Button to={ROUTES.home}>Back Home ♡</Button>}
    />
  );
}
