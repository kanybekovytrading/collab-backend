export declare function apiResponse<T>(data: T, message?: string): {
    success: boolean;
    message: string;
    data: T;
    errors: any;
};
export declare function apiError(message: string, errors?: any): {
    success: boolean;
    message: string;
    data: any;
    errors: any;
};
