import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent } from '../services/api';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 3600000).toISOString().slice(0, 16)
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

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
        setLoading(true);

        try
        {
            const eventData = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString()
            };
            
            await createEvent(eventData);
            navigate('/dashboard');
        }
        catch (err)
        {
            const errorData = err.response?.data;

            if (errorData?.errors)
            {
                setErrors(errorData.errors);
            }
            else if (errorData?.error)
            {
                setError(errorData.error);
            }
            else
            {
                setError('Failed to create event');
            }
        }
        finally
        {
            setLoading(false);
        }
    };

    return (
        <div className = "min-h-screen bg-[#F0F0F0]">
            <nav className = "bg-white shadow-lg border-b border-[#DAD8D9]">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className = "flex justify-between items-center h-16">
                        <h1 className = "text-2xl font-bold text-[#007AFF]">Eventz</h1>
                        <button  onClick = {() => navigate('/dashboard')} className = "text-[#007AFF] hover:text-[#0066CC] font-semibold hover:underline transition duration-200">← Back to Dashboard</button>
                    </div>
                </div>
            </nav>

            <div className = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className = "bg-white p-8 rounded-2xl shadow-2xl">
                    <div className = "mb-8">
                        <h2 className = "text-3xl font-bold text-[#3A3A3A] mb-2">Create New Event</h2>
                        <p className = "text-[#505050]">Fill in the details to create your event</p>
                    </div>

                    {error && (
                        <div className = "bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                            <p className = "font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit = {handleSubmit} className = "space-y-6" autoComplete = "off">
                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Event Title *</label>
                            <input type = "text" name = "title" value = {formData.title} onChange = {handleChange} required placeholder = "e.g., Birthday Party, Conference, Workshop" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.title ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                            {errors.title && <p className = "text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Description</label>
                            <textarea name = "description" value = {formData.description} onChange = {handleChange} rows = "4" placeholder = "Describe your event..." className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 resize-none ${ errors.description ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                            {errors.description && <p className = "text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Location *</label>
                            <input type = "text" name = "location" value = {formData.location} onChange = {handleChange} required placeholder = "e.g., 123 Main St, Virtual Meeting, Conference Hall" className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.location ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                            {errors.location && <p className = "text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>

                        <div className = "grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Start Date & Time *</label>
                                <input type = "datetime-local" name = "start_date" value = {formData.start_date} onChange = {handleChange} required className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.start_date ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                                {errors.start_date && <p className = "text-red-500 text-sm mt-1">{errors.start_date}</p>}
                            </div>

                            <div>
                                <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">End Date & Time *</label>
                                <input type = "datetime-local" name = "end_date" value = {formData.end_date} onChange = {handleChange} required className = {`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 ${ errors.end_date ? 'border-red-500' : 'border-[#DAD8D9]' }`}/>
                                {errors.end_date && <p className = "text-red-500 text-sm mt-1">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className = "flex gap-4 pt-4">
                            <button type = "button" onClick = {() => navigate('/dashboard')} className = "flex-1 bg-[#DAD8D9] text-[#505050] font-bold py-3 px-4 rounded-lg hover:bg-[#B5B4B5] transition duration-200">Cancel</button>
                            <button type = "submit" disabled = {loading} className = "flex-1 bg-[#007AFF] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                {loading ? (
                                    <span className = "flex items-center justify-center">
                                        <svg className = "animate-spin h-5 w-5 mr-3" viewBox = "0 0 24 24">
                                            <circle className = "opacity-25" cx = "12" cy = "12" r = "10" stroke = "currentColor" strokeWidth = "4" fill = "none"></circle>
                                            <path className = "opacity-75" fill = "currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Event'
                                )}
                            </button>
                        </div>
                    </form>
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

export default CreateEvent;