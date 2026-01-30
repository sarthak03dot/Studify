import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import CustomAlert, { AlertType } from '../components/CustomAlert';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    cancelText?: string;
    confirmText?: string;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => Promise<void>;
    showConfirm: (options: AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alertState, setAlertState] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: AlertType;
        showConfirmButton: boolean;
        cancelText?: string;
        confirmText?: string;
        onClose: () => void;
        onConfirm?: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        showConfirmButton: false,
        onClose: () => { },
    });

    const hideAlert = useCallback(() => {
        setAlertState(prev => ({ ...prev, visible: false }));
    }, []);

    const showAlert = useCallback(({ title, message, type = 'info', confirmText = 'OK' }: AlertOptions): Promise<void> => {
        return new Promise((resolve) => {
            setAlertState({
                visible: true,
                title,
                message,
                type,
                showConfirmButton: false,
                confirmText,
                onClose: () => {
                    hideAlert();
                    resolve();
                },
                onConfirm: () => {
                    hideAlert();
                    resolve();
                }
            });
        });
    }, [hideAlert]);

    const showConfirm = useCallback(({ title, message, type = 'warning', cancelText = 'Cancel', confirmText = 'Confirm' }: AlertOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setAlertState({
                visible: true,
                title,
                message,
                type,
                showConfirmButton: true,
                cancelText,
                confirmText,
                onClose: () => {
                    hideAlert();
                    resolve(false);
                },
                onConfirm: () => {
                    hideAlert();
                    resolve(true);
                }
            });
        });
    }, [hideAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <CustomAlert
                visible={alertState.visible}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                showConfirmButton={alertState.showConfirmButton}
                cancelText={alertState.cancelText}
                confirmText={alertState.confirmText}
                onClose={alertState.onClose}
                onConfirm={alertState.onConfirm}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
