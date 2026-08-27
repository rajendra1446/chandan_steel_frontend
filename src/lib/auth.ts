import type {User} from "../types/auth";

export const saveAuth = (
    token: string,
    user: User
): void => {

    localStorage.setItem("token", token);

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
};

export const logout = (): void => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");
};

export const getToken = (): string | null => {

    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("token");
};

export const getUser = (): User | null => {

    if (typeof window === "undefined") {
        return null;
    }

    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user) as User;

    } catch {

        return null;
    }
};