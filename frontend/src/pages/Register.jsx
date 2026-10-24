import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, Phone, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.phone,
      formData.password
    );
    
    if (result.success) {
      navigate('/listings');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none opacity-40 md:opacity-100">
        <div className="absolute top-[30%] left-[-10%] w-80 md:w-96 h-80 md:h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-[-10%] right-[20%] w-80 md:w-96 h-80 md:h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-md w-full space-y-7 bg-white md:bg-white/95 md:backdrop-blur-xl border border-slate-200/90 p-8 md:p-10 rounded-3xl shadow-xl z-10 transition-all duration-300">
        <div>
          <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center justify-center shadow-xs">
            <UserPlus className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-1.5 text-center text-sm font-medium text-slate-500">
            Join StayNest to find &amp; manage your ideal stay
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl">
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}
        
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold sm:text-sm bg-slate-50 focus:bg-white transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold sm:text-sm bg-slate-50 focus:bg-white transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold sm:text-sm bg-slate-50 focus:bg-white transition-all"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold sm:text-sm bg-slate-50 focus:bg-white transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold sm:text-sm bg-slate-50 focus:bg-white transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-xl text-white shadow-lg ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm font-bold text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-extrabold inline-flex items-center gap-1 group">
            Sign in
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
