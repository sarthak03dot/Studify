export interface User {
    id: string;
    name: string;
    email: string;
    theme: 'light' | 'dark';
    streak?: number | {
        count: number;
        lastActiveDate: string;
    };
    streakCalendar?: { date: string; active: boolean }[];
    totalTimeSpent?: number;
    notesUploaded?: number;
    dsaUploaded?: number;
    dsaSolved?: number;
}

export interface Question {
    _id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    author: {
        _id: string;
        name: string;
    };
    createdAt: string;
}
