/**

*/
export declare const TINA_HOST = "content.tinajs.io";
export declare const parseURL: (url: string) => {
    branch: string | null;
    isLocalClient: boolean;
    clientId: string | null;
    host: string | null;
};
