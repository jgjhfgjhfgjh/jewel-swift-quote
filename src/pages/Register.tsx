import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';

/**
 * Samostatná /register stránka byla nahrazena registračním popupem (stejný,
 * jaký používáme na homepage). Route ponecháváme kvůli starým odkazům,
 * záložkám a e-mailům — otevře popup a přesměruje na úvod. Přihlášený uživatel
 * je z registračních záložek popupu automaticky odkázán do nastavení účtu.
 */
export default function Register() {
  const openAuthModal = useStore((s) => s.openAuthModal);
  const navigate = useNavigate();
  useEffect(() => {
    openAuthModal('register');
    navigate('/', { replace: true });
  }, [openAuthModal, navigate]);
  return null;
}
