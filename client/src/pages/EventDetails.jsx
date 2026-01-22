import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventGuests, addGuest, updateGuest, deleteGuest } from '../services/api';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddGuest, setShowAddGuest] = useState(false);
    const [guestForm, setGuestForm] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const fetchEventData = async () => {
        try
        {
            setLoading(true);
            const [eventResponse, guestsResponse] = await Promise.all([
                getEventById(id),
                getEventGuests(id)
            ]);
            setEvent(eventResponse.event);
            setGuests(guestsResponse.guests);
        }
        catch (err)
        {
            setError('Failed to load event details');
        }
        finally
        {
            setLoading(false);
        }
    };

    const handleAddGuest = async (e) => {
        e.preventDefault();
        try
        {
            const response = await addGuest({
                ...guestForm,
                event_id: parseInt(id)
            });
            setGuests([response.guest, ...guests]);
            setGuestForm({ name: '', email: '' });
            setShowAddGuest(false);
        }
        catch (err)
        {
            setError('Failed to add guest');
        }
    };

    const handleUpdateRSVP = async (guestId, currentGuest, newStatus) => {
        try
        {
            const response = await updateGuest(guestId, {
                ...currentGuest,
                rsvp_status: newStatus
            });
            setGuests(guests.map(g => g.id === guestId ? response.guest : g));
        }
        catch (err)
        {
            setError('Failed to update RSVP');
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (window.confirm('Are you sure you want to remove this guest?'))
        {
            try
            {
                await deleteGuest(guestId);
                setGuests(guests.filter(g => g.id !== guestId));
            }
            catch (err)
            {
                setError('Failed to delete guest');
            }
        }
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
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'declined':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getEventStatusColor = (status) => {
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
    }

    if (loading)
    {
        return (
            <div className = "min-h-screen bg-[#F0F0F0] flex items-center justify-center">
                <div className = "text-center">
                    <div className = "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mb-4"></div>
                    <p className = "text-[#505050]">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (!event)
    {
        return (
            <div className = "min-h-screen bg-[#F0F0F0] flex items-center justify-center">
                <div className = "text-center">
                    <p className = "text-[#505050] text-xl">Event not found</p>
                    <button onClick = {() => navigate('/dashboard')} className = "mt-4 text-[#007AFF] hover:underline">Go back to dashboard</button>
                </div>
            </div>
        );
    }

    const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed').length;
    const pendingGuests = guests.filter(g => g.rsvp_status === 'pending').length;
    const declinedGuests = guests.filter(g => g.rsvp_status === 'declined').length;

    return (
        <div className = "min-h-screen bg-[#F0F0F0]">
            <nav className = "bg-white shadow-lg border-b border-[#DAD8D9]">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className = "flex justify-between items-center h-16">
                        <h1 className = "text-2xl font-bold text-[#007AFF]">Eventz</h1>
                        <button onClick = {() => navigate('/dashboard')} className = "text-[#007AFF] hover:text-[#0066CC] font-semibold hover:underline transition duration-200">← Back to Dashboard</button>
                    </div>
                </div>
            </nav>

            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className = "bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                        <p className = "font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className = "bg-white rounded-2xl shadow-2xl p-8 mb-8">
                    <div className = "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className = "flex-1">
                            <h2 className = "text-4xl font-bold text-[#3A3A3A] mb-3">{event.title}</h2>
                            <span className = {`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getEventStatusColor(event.status)}`}>{event.status.toUpperCase()}</span>
                        </div>
                        <button onClick = {() => navigate(`/edit-event/${id}`)} className = "bg-[#007AFF] text-white px-6 py-3 rounded-lg hover:bg-[#0066CC] transition duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:-translate-y-0.5">Edit Event</button>
                    </div>

                    <p className = "text-[#505050] text-lg mb-6">{event.description}</p>

                    <div className = "grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className = "bg-[#F0F0F0] p-4 rounded-lg">
                            <p className = "text-sm font-semibold text-[#909090] mb-1">LOCATION</p>
                            <p className = "text-[#3A3A3A] font-medium">{event.location}</p>
                        </div>

                        <div className = "bg-[#F0F0F0] p-4 rounded-lg">
                            <p className = "text-sm font-semibold text-[#909090] mb-1">TOTAL GUESTS</p>
                            <p className = "text-[#3A3A3A] font-medium">{guests.length} guests invited</p>
                        </div>

                        <div className = "bg-[#F0F0F0] p-4 rounded-lg">
                            <p className = "text-sm font-semibold text-[#909090] mb-1">START TIME</p>
                            <p className = "text-[#3A3A3A] font-medium">{formatDate(event.start_date)}</p>
                        </div>

                        <div className = "bg-[#F0F0F0] p-4 rounded-lg">
                            <p className = "text-sm font-semibold text-[#909090] mb-1">END TIME</p>
                            <p className = "text-[#3A3A3A] font-medium">{formatDate(event.end_date)}</p>
                        </div>
                    </div>
                </div>

                <div className = "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className = "bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
                        <p className = "text-sm text-[#909090]">Confirmed</p>
                        <p className = "text-3xl font-bold text-green-600">{confirmedGuests}</p>
                    </div>
                    <div className = "bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
                        <p className = "text-sm text-[#909090]">Pending</p>
                        <p className = "text-3xl font-bold text-yellow-600">{pendingGuests}</p>
                    </div>
                    <div className = "bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
                        <p className = "text-sm text-[#909090]">Declined</p>
                        <p className = "text-3xl font-bold text-red-600">{declinedGuests}</p>
                    </div>
                </div>

                <div className = "bg-white rounded-2xl shadow-2xl p-8">
                    <div className = "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className = "text-2xl sm:text-3xl font-bold text-[#3A3A3A]">Guest List</h3>
                            <p className = "text-[#505050] mt-1">Manage your event attendees</p>
                        </div>
                        <button onClick = {() => setShowAddGuest(!showAddGuest)} className = "bg-[#007AFF] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#0066CC] transition duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-auto">{showAddGuest ? 'Cancel' : 'Add Guest'}</button>
                    </div>

                    {showAddGuest && (
                        <form onSubmit = {handleAddGuest} className = "mb-8 p-6 bg-[#F0F0F0] rounded-xl border-2 border-[#DAD8D9]">
                            <h4 className = "text-lg font-semibold text-[#3A3A3A] mb-4">Add New Guest</h4>
                            <div className = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input type = "text" placeholder = "Guest Name *" value = {guestForm.name} onChange = {(e) => setGuestForm({ ...guestForm, name: e.target.value })} required className = "px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                                <input type = "email" placeholder = "Email Address" value = {guestForm.email} onChange = {(e) => setGuestForm({ ...guestForm, email: e.target.value })} className = "px-4 py-3 border border-[#DAD8D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition duration-200"/>
                            </div>
                            <button type = "submit" className = "bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200 font-semibold shadow-md hover:shadow-lg">Add Guest</button>
                        </form>
                    )}

                    {guests.length === 0 ? (
                        <div className = "text-center py-12">
                            <div className = "text-6xl mb-4"></div>
                            <p className = "text-[#505050] text-lg">No guests added yet</p>
                            <p className = "text-[#909090] text-sm mt-2">Click "Add Guest" to invite people to your event</p>
                        </div>
                    ) : (
                        <div className = "space-y-4">
                            {guests.map((guest, index) => (
                                <div key = {guest.id} className = "flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-[#F0F0F0] rounded-xl border border-[#DAD8D9] hover:shadow-lg transition-all duration-300" style = {{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}>
                                    <div className = "flex-1 mb-4 md:mb-0">
                                        <h4 className = "font-bold text-lg text-[#3A3A3A]">{guest.name}</h4>
                                        {guest.email && (
                                            <p className = "text-sm text-[#505050] flex items-center mt-1">
                                                <span className = "mr-2"></span> {guest.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className = "flex flex-col md:flex-row items-start md:items-center gap-3">
                                        <span className = {`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(guest.rsvp_status)}`}>{guest.rsvp_status.toUpperCase()}</span>

                                        <div className = "flex flex-wrap gap-2">
                                            {guest.rsvp_status !== 'confirmed' && (
                                                <button onClick = {() => handleUpdateRSVP(guest.id, guest, 'confirmed')} className = "bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition duration-200 font-semibold shadow-md hover:shadow-lg" title = "Mark as Confirmed">Confirm</button>
                                            )}
                                            {guest.rsvp_status !== 'declined' && (
                                                <button onClick = {() => handleUpdateRSVP(guest.id, guest, 'declined')} className = "bg-[#FF3333] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#F00E0E] transition duration-200 font-semibold shadow-md hover:shadow-lg" title = "Mark as Declined">Decline</button>
                                            )}
                                            {guest.rsvp_status !== 'pending' && (
                                                <button onClick = {() => handleUpdateRSVP(guest.id, guest, 'pending')} className = "bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-yellow-600 transition duration-200 font-semibold shadow-md hover:shadow-lg" title = "Mark as Pending">?</button>
                                            )}
                                            <button onClick = {() => handleDeleteGuest(guest.id)} className = "bg-[#505050] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#3A3A3A] transition duration-200 font-semibold shadow-md hover:shadow-lg" title = "Remove Guest">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

export default EventDetails;