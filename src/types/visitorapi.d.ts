// Type definitions for visitorapi package
declare module 'visitorapi' {
    interface VisitorApiResponse {
        ipAddress?: string;
        countryCode?: string;
        countryName?: string;
        currencies?: string[];
        languages?: string[];
        region?: string;
        city?: string;
        cityLatLong?: string;
        browser?: string;
        browserVersion?: string;
        deviceBrand?: string;
        deviceModel?: string;
        deviceFamily?: string;
        os?: string;
        osVersion?: string;
    }

    type SuccessCallback = (data: VisitorApiResponse) => void;
    type ErrorCallback = (error: any) => void;

    function VisitorAPI(
        projectId: string,
        successCallback: SuccessCallback,
        errorCallback?: ErrorCallback
    ): void;

    export default VisitorAPI;
} 