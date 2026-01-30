import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    lastUpdate: any;
    lastResource: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Replace with your actual backend URL
// For Android Emulator use 10.0.2.2, for iOS uses localhost
const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<any>(null);
    const [lastResource, setLastResource] = useState<any>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('new_update', (data) => {
            console.log('New update received:', data);
            setLastUpdate(data);
        });

        newSocket.on('new_resource', (data) => {
            console.log('New resource received:', data);
            setLastResource(data);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, lastUpdate, lastResource }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
