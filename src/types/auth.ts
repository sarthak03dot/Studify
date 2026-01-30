export interface User {
    id: string;
    name: string;
    email: string;
    theme: "light" | "dark";
}

export interface AuthResponse {
    token: string;
    user: User;
}
