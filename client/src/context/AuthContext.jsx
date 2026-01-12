import { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
    {
        throw new Error(`useAuth must be used within an AuthProvider`);
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [tokens, setTokens] = useState(() => {
        const storedTokens = localStorage.getItem('tokens');
        return storedTokens ? JSON.parse(storedTokens) : null;
    });

    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback((userData, accessToken, refreshToken) => {
        setUser(userData);
        setTokens({ accessToken, refreshToken });
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken }));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
    }, []);

    const updateTokens = useCallback((accessToken, refreshToken) => {
        setTokens({ accessToken, refreshToken });
        localStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken }));
    }, []);

    const getAccessToken = useCallback(() => {
        return tokens?.accessToken;
    }, [tokens]);

    const getRefreshToken = useCallback(() => {
        return tokens?.refreshToken;
    }, [tokens]);

    const value = {
        user,
        tokens,
        login,
        logout,
        updateTokens,
        getAccessToken,
        getRefreshToken,
        isAuthenticated: !!user && !!tokens?.accessToken,
        isLoading,
        setIsLoading
    };

    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    );
};