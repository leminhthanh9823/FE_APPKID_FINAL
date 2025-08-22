import { UserRecord } from "@/types/user";

const userStorage = {
    get user() {
        const userData = localStorage.getItem("user");
        return userData ? (JSON.parse(userData) as UserRecord) : null;
    },
    setUser(user: UserRecord) {
        localStorage.setItem("user", JSON.stringify(user));
    },
    clearUser() {
        localStorage.removeItem("user");
    },
};