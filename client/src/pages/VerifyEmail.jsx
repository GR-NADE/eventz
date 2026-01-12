import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false);

    useEffect(() => {
        if (!hasVerified.current)
        {
            hasVerified.current = true;
            verifyEmail();
        }
    }, [token]);

    const verifyEmail = async () => {
        try
        {
            const response = await apiClient.get(`/auth/verify-email/${token}`);
            setStatus('success');
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        }
        catch (error)
        {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Verification failed');
            console.error('Verification error:', error);
        }
    };

    return (
        <div className = "min-h-screen flex items-center justify-center bg-[#F0F0F0]">
            <div className = "bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                {status === 'verifying' && (
                    <>
                        <div className = "inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#007AFF] mb-4"></div>
                        <h2 className = "text-2xl font-bold text-[#3A3A3A]">Verifying Email...</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 className = "text-2xl font-bold text-green-600 mb-2">Success!</h2>
                        <p className = "text-[#505050]">{message}</p>
                        <p className = "text-sm text-[#909090] mt-4">Redirecting to login...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className = "text-2xl font-bold text-[#FF3333] mb-2">Verification Failed</h2>
                        <p className = "text-[#505050] mb-6">{message}</p>
                        <button onClick = {() => navigate("/register")} className = "bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:bg-[#0066CC] transition duration-200">Back to Register</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;