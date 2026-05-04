import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (login(username, password)) {
        addToast('Login successful!', 'success');
        navigate('/admin/dashboard');
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        addToast('Invalid credentials', 'error');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-orange-100 text-sm mt-1">Mahalaxmi Sweets & Farsan</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm pr-10"
                placeholder="Enter password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading Mahalaxmi Sweets & Farsan...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
