import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserEvents, deleteEvent } from '../services/api';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id)
        {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        try
        {
            setLoading(true);
            const response = await getUserEvents(user.id);
            setEvents(response.events);
            setError('');
        }
        catch (err)
        {
            if (err.response?.status === 403)
            {
                setError('Unauthorized access');
                logout();
                navigate('/login');
            }
            else
            {
                setError('Failed to load events');
            }
        }
        finally
        {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?'))
        {
            try
            {
                setDeletingId(eventId);
                await deleteEvent(eventId);
                setEvents(events.filter(event => event.id !== eventId));
            }
            catch (err)
            {
                if (err.response?.status === 403)
                {
                    setError('Unauthorized: Cannot delete this event');
                }
                else
                {
                    setError('Failed to delete event');
                }
            }
            finally
            {
                setDeletingId(null);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status)
        {
            case 'upcoming':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className = "min-h-screen bg-[#F0F0F0]">
            <nav className = "bg-white shadow-lg border-b border-[#DAD8D9]">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className = "flex justify-between items-center h-16">
                        <div className = "flex items-center">
                            <div className = "flex-shrink-0">
                                <h1 className = "text-2xl font-bold text-[#007AFF]">Eventz</h1>
                            </div>
                        </div>
                        <div className = "flex items-center gap-4">
                            <div className = "text-right">
                                <p className = "text-sm text-[#909090]">Welcome back,</p>
                                <p className = "text-sm font-semibold text-[#3A3A3A]">{user.username}</p>
                            </div>
                            <button onClick = {handleLogout} className = "text-[#FF3333] bg-[#FFEBEB] px-4 py-1.5 rounded-[10px] hover:bg-[#FFDADA] transition duration-200">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className = "mb-8">
                    <div className = "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h2 className = "text-4xl font-bold text-[#3A3A3A] mb-2">My Events</h2>
                            <p className = "text-[#505050]">Manage and organize your upcoming events</p>
                        </div>
                        <button onClick = {() => navigate('/create-event')} className = "bg-[#007AFF] text-white px-6 py-3 rounded-lg hover:bg-[#0066CC] transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">+ Create New Event</button>
                    </div>

                    <div className = "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className = "bg-white p-4 rounded-lg shadow-md border-l-4 border-[#007AFF]">
                            <p className = "text-sm text-[#909090]">Total Events</p>
                            <p className = "text-2xl font-bold text-[#3A3A3A]">{events.length}</p>
                        </div>
                        <div className = "bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                            <p className = "text-sm text-[#909090]">Upcoming</p>
                            <p className = "text-2xl font-bold text-[#3A3A3A]">{events.filter(e => e.status === 'upcoming').length}</p>
                        </div>
                        <div className = "bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                            <p className = "text-sm text-[#909090]">Completed</p>
                            <p className = "text-2xl font-bold text-[#3A3A3A]">{events.filter(e => e.status === 'completed').length}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className = "bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md animate-fade-in">
                        <p className = "font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className = "text-center py-20">
                        <div className = "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
                        <p className = "text-[#505050] mt-4">Loading your events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className = "text-center py-20 bg-white rounded-xl shadow-lg">
                        <h3 className = "text-2xl font-bold text-[#3A3A3A] mb-2">No Events Yet</h3>
                        <p className = "text-[#505050] mb-6">Start planning your first event!</p>
                        <button onClick = {() => navigate("/create-event")} className = "bg-[#007AFF] text-white px-8 py-3 rounded-lg hover:bg-[#0066CC] transition duration-200 shadow-lg hover:shadow-xl font-semibold">Create Your First Event</button>
                    </div>
                ) : (
                    <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, index) => (
                            <div key = {event.id} className = "bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden" style = {{
                                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                            }}>
                                <div className = "bg-[#007AFF] p-4">
                                    <h3 className = "text-xl font-bold text-white truncate">{event.title}</h3>
                                    <span className = {`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 border ${getStatusColor(event.status)}`}>
                                        {event.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className = "p-6">
                                    <p className = "text-[#505050] mb-4 line-clamp-2">{event.description}</p>

                                    <div className = "space-y-2 text-sm">
                                        <div className = "flex items-center text-[#3A3A3A]">
                                            <span className = "truncate">{event.location}</span>
                                        </div>
                                        <div className = "flex items-center text-[#3A3A3A]">
                                            <span className = "text-xs">{formatDate(event.start_date)}</span>
                                        </div>
                                        <div className = "flex items-center text-[#3A3A3A]">
                                            <span className = "text-xs">{formatDate(event.end_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className = "px-6 pb-6 flex gap-2">
                                    <button onClick = {() => navigate(`/event/${event.id}`)} className = "flex-1 bg-[#007AFF] text-white px-4 py-2 rounded-lg hover:bg-[#0066CC] transition duration-200 font-semibold text-sm shadow-md hover:shadow-lg">View Details</button>
                                    <button onClick = {() => handleDelete(event.id)} disabled = {deletingId === event.id} className = "bg-[#FF3333] text-white px-4 py-2 rounded-lg hover:bg-[#F00E0E] transition duration-200 font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                        {deletingId === event.id ? '...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes fadeInUp
                    {
                        from
                        {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to
                        {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .lone-clamp-2
                    {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}
            </style>
        </div>
    );
};

export default Dashboard;