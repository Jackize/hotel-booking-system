export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
}

export interface UserUpdated {
    userId: string;
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    roles?: string[] | null;
    status?: UserStatus | null;
    updatedAt: number; // timestamp millis
}
