export interface AuthLogin {
    userId: string;
    timestamp: number;  // timestamp millis
    ipAddress?: string | null;
    userAgent?: string | null;
    success: boolean;
}

export interface AuthLogout {
    userId: string;
    timestamp: number;
    ipAddress?: string | null;
}

export interface AuthTokenRefresh {
    userId: string;
    timestamp: number;
    success: boolean;
}
