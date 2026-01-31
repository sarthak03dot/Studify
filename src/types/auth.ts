export interface User {
    id: string;
    name: string;
    email: string;
    theme: "light" | "dark";
    streak?: number | {
        count: number;
        lastActiveDate: string;
        highestStreak: number;
    };
    streakCalendar?: { date: string; active: boolean }[];
    totalTimeSpent?: number;
    notesUploaded?: number;
    dsaUploaded?: number;
    dsaSolved?: number;
    questionsSolved?: number;
    resourcesUploaded?: number;
    bio?: string;
    college?: string;
    socialHandles?: {
        github: string;
        leetcode: string;
        codeforces: string;
    };
    solvedQuestionIds?: string[];
}

export interface AuthResponse {
    token: string;
    user: User;
}
