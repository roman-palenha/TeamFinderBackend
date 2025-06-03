import { createContext, useState, useContext, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [connection, setConnection] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const newConnection = new HubConnectionBuilder()
        .withUrl('http://localhost:5102/notificationHub')
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();
      
      setConnection(newConnection);
    }
  }, [isAuthenticated, currentUser]);
  
  useEffect(() => {
    if (connection && isAuthenticated && currentUser) {
      connection.start()
        .then(() => {
          console.log('Connected to notification hub');
          setConnectionEstablished(true);
          
          connection.invoke('JoinUserGroup', currentUser.id.toString())
            .catch(err => console.error('Error joining user group:', err));
        })
        .catch(err => {
          console.error('Error connecting to notification hub:', err);
          setTimeout(() => {
            setConnection(null);
          }, 5000);
        });
      
      connection.onclose(() => {
        console.log('Connection closed');
        setConnectionEstablished(false);
      });
      
      connection.on('ReceiveNotification', notification => {
        console.log('Notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        
        displayToast(notification);
      });
      
      return () => {
        if (connection.state === 'Connected') {
          connection.stop();
        }
      };
    }
  }, [connection, isAuthenticated, currentUser]);
  
  const joinTeamGroup = async (teamId) => {
    if (connectionEstablished && connection) {
      try {
        await connection.invoke('JoinTeamGroup', teamId.toString());
        console.log(`Joined team group: ${teamId}`);
      } catch (err) {
        console.error(`Error joining team group ${teamId}:`, err);
      }
    }
  };
  
  const leaveTeamGroup = async (teamId) => {
    if (connectionEstablished && connection) {
      try {
        await connection.invoke('LeaveTeamGroup', teamId.toString());
        console.log(`Left team group: ${teamId}`);
      } catch (err) {
        console.error(`Error leaving team group ${teamId}:`, err);
      }
    }
  };
  
  const displayToast = (notification) => {
    const { type, message } = notification;
    
    switch(type) {
      case 'UserRegistered':
      case 'TeamCreated':
      case 'TeamJoined':
        toast.success(message);
        break;
      case 'UserUpdated':
      case 'TeamMemberJoined':
        toast.info(message);
        break;
      case 'TeamLeft':
      case 'TeamMemberLeft':
        toast.warning(message);
        break;
      case 'TeamDeleted':
        toast.error(message);
        break;
      default:
        toast.info(message);
    }
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    joinTeamGroup,
    leaveTeamGroup,
    clearNotifications,
    connectionEstablished
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}