import { Provider } from '@fm/di';
type Render = (...args: any[]) => Promise<{
    html: string;
    styles: string;
}>;
export declare class Platform {
    private platformInjector;
    bootstrapRender(additionalProviders: Provider[] | Render, render?: Render): void;
    private proxyRender;
    private beforeBootstrapRender;
    private mergeMicroToSSR;
    private executeMicroMiddleware;
    private runRender;
    private parseParams;
    private getLocation;
}
export {};
