export default function GiftMode({ isGift, onToggle, recipient, onRecipientChange, errors }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Gift Order</h3>
        <button
          onClick={onToggle}
          className={`relative w-12 h-7 rounded-full transition-all duration-200 ${isGift ? 'bg-orange-500' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${isGift ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {isGift && (
        <div className="space-y-3 bg-orange-50 rounded-2xl p-4 animate-fadeIn">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Recipient Name *</label>
            <input
              type="text"
              value={recipient.name}
              onChange={(e) => onRecipientChange({ ...recipient, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.recipientName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm`}
              placeholder="Recipient's name"
            />
            {errors.recipientName && <p className="text-xs text-red-500 mt-1">{errors.recipientName}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Recipient Phone *</label>
            <input
              type="tel"
              value={recipient.phone}
              onChange={(e) => onRecipientChange({ ...recipient, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.recipientPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm`}
              placeholder="10-digit phone number"
            />
            {errors.recipientPhone && <p className="text-xs text-red-500 mt-1">{errors.recipientPhone}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Recipient Address *</label>
            <textarea
              value={recipient.address}
              onChange={(e) => onRecipientChange({ ...recipient, address: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.recipientAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm resize-none`}
              rows={2}
              placeholder="Recipient's address"
            />
            {errors.recipientAddress && <p className="text-xs text-red-500 mt-1">{errors.recipientAddress}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Gift Message</label>
            <textarea
              value={recipient.message}
              onChange={(e) => onRecipientChange({ ...recipient, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
              rows={2}
              placeholder="Optional gift message"
            />
          </div>
        </div>
      )}
    </div>
  );
}
