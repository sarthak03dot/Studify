import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Resource } from '../types/resource';

interface BookmarkContextData {
    bookmarkedResources: Resource[];
    toggleBookmark: (resource: Resource) => void;
    isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextData>({} as BookmarkContextData);

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
    const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            const data = await AsyncStorage.getItem('@bookmarks');
            if (data) {
                setBookmarkedResources(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to load bookmarks', e);
        }
    };

    const toggleBookmark = async (resource: Resource) => {
        try {
            let updated: Resource[];
            if (isBookmarked(resource._id)) {
                updated = bookmarkedResources.filter(r => r._id !== resource._id);
            } else {
                updated = [...bookmarkedResources, resource];
            }
            setBookmarkedResources(updated);
            await AsyncStorage.setItem('@bookmarks', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save bookmark', e);
        }
    };

    const isBookmarked = (id: string) => {
        return bookmarkedResources.some(r => r._id === id);
    };

    return (
        <BookmarkContext.Provider value={{ bookmarkedResources, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarks = () => useContext(BookmarkContext);
