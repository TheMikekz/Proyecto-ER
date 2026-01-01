import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-olive-600 rounded-full blur-3xl opacity-10"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-olive-600 rounded-full blur-3xl opacity-5"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">

                {/* Back button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al inicio</span>
                </button>

                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-2xl mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-olive-600 to-olive-700 rounded-full flex items-center justify-center">
                            <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-black">Simple y Legal</div>
                            <div className="text-xs text-slate-600">Asesor legal</div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-black mb-2">Panel de Administración</h1>
                    <p className="text-slate-600">Ingresa tus credenciales para continuar</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl p-8">

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Email field */}
                        <div>
                            <label className="block text-black font-medium mb-2 text-sm">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 text-black border border-black/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 transition-all placeholder:text-olive-500"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-black font-medium mb-2 text-sm">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 text-black border border-black/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 transition-all placeholder:text-olive-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me & Forgot password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-600 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-olive-600 focus:ring-2 focus:ring-olive-500/20"
                                />
                                <span className="group-hover:text-black transition-colors">Recordarme</span>
                            </label>
                            <button
                                type="button"
                                className="text-olive-600 hover:text-olive-900 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-olive-600 hover:bg-olive-700 text-white font-bold py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-olive-500/30 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2026 Simple y Legal - Todos los derechos reservados
                </p>
            </div>
        </div>
    );
};

export default Login;