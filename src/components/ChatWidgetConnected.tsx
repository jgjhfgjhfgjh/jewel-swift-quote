import { useAuthContext } from '@/contexts/AuthContext';
import { buildPartnerContext } from '@/lib/chatContext';
import { ChatWidget } from './ChatWidget';

export function ChatWidgetConnected() {
  const { profile, role } = useAuthContext();
  const partnerContext = buildPartnerContext({ profile, role });
  return <ChatWidget partnerContext={partnerContext} />;
}
