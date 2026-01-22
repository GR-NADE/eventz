import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        if (errors[e.target.name])
        {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        const frontendErrors = {};

        if (formData.password !== formData.confirmPassword)
        {
            frontendErrors.confirmPassword = 'Passwords do not match';
        }

        if (frontendErrors.confirmPassword)
        {
            setErrors(frontendErrors);
            return;
        }

        setLoading(true);

        try
        {
            const response = await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            setError('');
            alert('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        }
        catch (err)
        {
            const errorData = err.response?.data;

            if (errorData?.errors)
            {
                setErrors(errorData.error);
            }
            else if (errorData?.error)
            {
                setError(errorData.error);
            }
            else
            {
                setError('Registration failed. Please try again.');
            }
        }
        finally
        {
            setLoading(false);
        }
    };

    return (
        <div className = "min-h-screen flex items-center justify-center bg-white pb-12">
            <div className = "p-8 w-full max-w-md">
                <div className = "text-center mb-8">
                    <h1 className = "text-3xl font-bold text-[#007AFF] mb-2">Eventz</h1>
                    <h2 className = "text-2xl font-semibold text-[#3A3A3A]">Create Account</h2>
                    <p className = "text-[#505050] mt-2">Join us and start planning events</p>
                </div>

                {error && (
                    <div className = "bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                        <p className = "font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit = {handleSubmit} className = "space-y-5" autoComplete = "off">
                    <div>
                        <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Username</label>
                        <input type = "text" name = "username" value = {formData.username} onChange = {handleChange} required placeholder = "Choose a username" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.username ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                        {errors.username && <p className = "text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Email Address</label>
                        <input type = "email" name = "email" value = {formData.email} onChange = {handleChange} required placeholder = "Enter your email" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.email ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                        {errors.email && <p className = "text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Password</label>
                        <input type = "password" name = "password" value = {formData.password} onChange = {handleChange} required placeholder = "Create a password" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.password ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                        {errors.password && <p className = "text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Confirm Password</label>
                        <input type = "password" name = "confirmPassword" value = {formData.confirmPassword} onChange = {handleChange} required placeholder = "Confirm your password" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.confirmPassword ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button type = "submit" disabled = {loading} className = "w-full bg-[#007AFF] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        {loading ? (
                            <span className = "flex items-center justify-center">
                                <svg className = "animate-spin h-5 w-5 mr-3" viewBox = "0 0 24 24">
                                    <circle className = "opacity-25" cx = "12" cy = "12" r = "10" stroke = "currentColor" strokeWidth = "4" fill = "none"></circle>
                                    <path className = "opacity-75" fill = "currentColor" d = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className = "mt-6 text-center">
                    <p className = "text-[#505050]">
                        Already have an account?{' '}
                        <Link to = "/login" className = "text-[#007AFF] hover:text-[#0066CC] font-semibold hover:underline transition duration-200">Login here</Link>
                    </p>
                </div>
            </div>

            <style>
                {`
                    @keyframes shake
                    {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }

                    .animate-shake
                    {
                        animation: shake 0.5s ease-in-out;
                    }
                `}
            </style>
        </div>
    );
};

export default Register;