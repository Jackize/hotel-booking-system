export enum Status {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
}

export interface BookingConfirmDto {
    bookingId: string;
    userId: string;
    hotelId: string;
    roomId: string;
    checkInDate: number;
    checkOutDate: number;
    status: Status;
    createdAt: number;
}