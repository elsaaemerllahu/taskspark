import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/backend/auth-status.php', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
          setCurrentUser({
            id: data.id,
            email: data.email,
            username: data.username
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error fetching auth status:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authenticated');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
