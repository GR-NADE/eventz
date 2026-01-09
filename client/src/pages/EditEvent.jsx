import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent } from '../services/api';

const EditEvent = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'upcoming'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try
        {
            setLoading(true);
            const response = await getEventById(id);
            const event = response.event;

            setFormData({
                title: event.title,
                description: event.description || '',
                location: event.location,
                start_date: new Date(event.start_date).toISOString().slice(0, 16),
                end_date: new Date(event.end_date).toISOString().slice(0, 16),
                status: event.status
            });
        }
        catch (err)
        {
            setError('Failed to load event');
        }
        finally
        {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try
        {
            const eventData = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString()
            };

            await updateEvent(id, eventData);
            navigate(`/event/${id}`);
        }
        catch (err)
        {
            setError('Failed to update event');
        }
        finally
        {
            setSubmitting(false);
        }
    };

    if (loading)
    {
        return (
            <div className = "min-h-screen bg-[#F0F0F0] flex items-center justify-center">
                <div className = "text-center">
                    <div className = "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mb-4"></div>
                    <p className = "text-[#505050]">Loading event...</p>
                </div>
            </div>
        );
    }

    return (
        <div className = "min-h-screen bg-[#F0F0F0]">
            <nav className = "bg-white shadow-lg border-b border-[#DAD8D9]">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className = "flex justify-between items-center h-16">
                        <h1 className = "text-2xl font-bold text-[#007AFF]">Eventz</h1>
                        <button onClick = {() => navigate(`/event/${id}`)} className = "text-[#007AFF] hover:text-[#0066CC] font-semibold hover:underline transition duration-200">← Back to Event Details</button>
                    </div>
                </div>
            </nav>

            <div className = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className = "bg-white p-8 rounded-2xl shadow-2xl">
                    <div className = "mb-8">
                        <h2 className = "text-3xl font-bold text-[#3A3A3A] mb-2">Edit Event</h2>
                        <p className = "text-[#505050]">Update your event details</p>
                    </div>

                    {error && (
                        <div className = "bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                            <p className = "font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit = {handleSubmit} className = "space-y-6">
                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Event Title *</label>
                            <input type = "text" name = "title" value = {formData.title} onChange = {handleChange} required className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                        </div>

                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Description</label>
                            <textarea name = "description" value = {formData.description} onChange = {handleChange} rows = "4" className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200 resize-none"/>
                        </div>

                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Location *</label>
                            <input type = "text" name = "location" value = {formData.location} onChange = {handleChange} required className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                        </div>

                        <div className = "grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Start Date & Time *</label>
                                <input type = "datetime-local" name = "start_date" value = {formData.start_date} onChange = {handleChange} required className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                            </div>

                            <div>
                                <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">End Date & Time *</label>
                                <input type = "datetime-local" name = "end_date" value = {formData.end_date} onChange = {handleChange} required className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                            </div>
                        </div>

                        <div>
                            <label className = "block text-[#3A3A3A] text-sm font-bold mb-2">Event Status *</label>
                            <select name = "status" value = {formData.status} onChange = {handleChange} className = "w-full px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200">
                                <option value = "upcoming">Upcoming</option>
                                <option value = "ongoing">Ongoing</option>
                                <option value = "completed">Completed</option>
                                <option value = "cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className = "flex gap-4 pt-4">
                            <button type = "button" onClick = {() => navigate(`/event/${id}`)} className = "flex-1 bg-[#DAD8D9] text-[#505050] font-bold py-3 px-4 rounded-lg hover:bg-[#B5B4B5] transition duration-200">Cancel</button>
                            <button type = "submit" disabled = {submitting} className = "flex-1 bg-[#007AFF] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                {submitting ? (
                                    <span className = "flex items-center justify-center">
                                        <svg className = "animate-spin h-5 w-5 mr-3" viewBox = "0 0 24 24">
                                            <circle className = "opacity-25" cx = "12" cy = "12" r = "10" stroke = "currentColor" strokeWidth = "4" fill = "none"></circle>
                                            <path className = "opacity-75" fill = "currentColor" d = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    'Save Changes'
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

export default EditEvent;