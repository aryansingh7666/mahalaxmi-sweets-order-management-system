const BACKUP_KEYS = [
  'mhl_settings',
  'mhl_categories',
  'mhl_items',
  'mhl_orders',
  'mhl_customers',
  'mhl_coupons',
  'mhl_serial',
  'mhl_backup_timestamp',
];

export function exportBackup() {
  try {
    const data = {};
    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) data[key] = value;
    });
    data.mhl_backup_timestamp = JSON.stringify(new Date().toISOString());
    localStorage.setItem('mhl_backup_timestamp', data.mhl_backup_timestamp);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahalaxmi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Backup export failed:', e);
    return false;
  }
}

export function restoreBackup(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data || typeof data !== 'object') {
            reject(new Error('Invalid backup file format'));
            return;
          }
          let restored = 0;
          BACKUP_KEYS.forEach(key => {
            if (data[key]) {
              try {
                localStorage.setItem(key, data[key]);
                restored++;
              } catch (storageErr) {
                console.warn(`Failed to restore key ${key}:`, storageErr);
              }
            }
          });
          if (restored === 0) {
            reject(new Error('No valid data found in backup'));
            return;
          }
          resolve(true);
        } catch (parseErr) {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } catch (e) {
      reject(new Error('Failed to process backup file'));
    }
  });
}

export function clearAllOrders() {
  try {
    localStorage.removeItem('mhl_orders');
    localStorage.removeItem('mhl_serial');
    return true;
  } catch (e) {
    console.error('Failed to clear orders:', e);
    return false;
  }
}

export function getLastBackupTime() {
  try {
    const ts = localStorage.getItem('mhl_backup_timestamp');
    if (!ts) return null;
    return new Date(JSON.parse(ts));
  } catch {
    return null;
  }
}

export function formatBackupTime() {
  const time = getLastBackupTime();
  if (!time) return 'Never';
  const diff = Date.now() - time.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
