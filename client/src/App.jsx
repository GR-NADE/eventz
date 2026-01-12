import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';
import VerifyEmail from './pages/VerifyEmail';
import { setAuthContext } from './services/apiClient';

function ProtectedRoute({ children })
{
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated)
	{
		return <Navigate to = "/login"/>;
	}
	
	return children;
}

function AppRoutes()
{
	return (
		<Routes>
			<Route path = "/login" element = {<Login/>}/>
			<Route path = "/register" element = {<Register/>}/>
			<Route path = "/dashboard" element = {
				<ProtectedRoute>
					<Dashboard/>
				</ProtectedRoute>
			}/>
			<Route path = "/create-event" element = {
				<ProtectedRoute>
					<CreateEvent/>
				</ProtectedRoute>
			}/>
			<Route path = "/event/:id" element = {
				<ProtectedRoute>
					<EventDetails/>
				</ProtectedRoute>
			}/>
			<Route path = "/edit-event/:id" element = {
				<ProtectedRoute>
					<EditEvent/>
				</ProtectedRoute>
			}/>
			<Route path = "/verify-email/:token" element = {<VerifyEmail/>}/>
			<Route path = "/" element = {<Navigate to = "/dashboard"/>}/>
			<Route path = "*" element = {<Navigate to = "/login"/>}/>
		</Routes>
	);
}

function AppContent()
{
	const authContext = useAuth();

	useEffect(() => {
		setAuthContext(authContext);
	}, [authContext]);

	return <AppRoutes/>;
}

function App()
{
	return (
		<Router>
			<AuthProvider>
				<AppContent/>
			</AuthProvider>
		</Router>
	);
}

export default App;