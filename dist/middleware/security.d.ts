import cors from 'cors';
export declare const securityMiddleware: (((req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void) | ((req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void) | import("express-rate-limit").RateLimitRequestHandler)[];
//# sourceMappingURL=security.d.ts.map