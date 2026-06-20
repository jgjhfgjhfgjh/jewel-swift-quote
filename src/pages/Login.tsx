import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';

/**
 * Samostatná /login stránka byla nahrazena přihlašovacím popupem (stejný,
 * jaký používáme na homepage). Route ponecháváme kvůli starým odkazům,
 * záložkám a e-mailům — otevře popup a přesměruje na úvod.
 */
export default function Login() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  useEffect(() => {
    openAuthModal('login');
    navigate('/', { replace: true });
  }, [openAuthModal, navigate]);
  return null;
}
