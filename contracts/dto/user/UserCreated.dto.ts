export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
}

export interface UserCreated {
    userId: string;
    email: string;
    fullName: string;
    phone?: string | null;
    roles: string[];
    status: UserStatus;
    createdAt: number; // timestamp millis
}
