import { Copy, MessageCircle, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../../context/ToastContext';

export default function WhatsAppModal({ isOpen, onClose, phone, message, title }) {
  const { addToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    addToast('Message copied to clipboard', 'success');
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneWithCode}?text=${encoded}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'WhatsApp Message'} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
          {message}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press"
          >
            <Copy size={16} />
            Copy Message
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all btn-press"
          >
            <MessageCircle size={16} />
            Open WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
