import { getProvider, Injector, StaticInjector } from '@fm/di';
import { APP_CONTEXT, AppContextService } from '@fm/shared/providers/app-context';
import { JsonConfigService } from '@fm/shared/providers/json-config';
import { HISTORY } from '@fm/shared/token';
import { lastValueFrom, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MicroManage } from '../../micro';
import { AppContextService as ServerAppContextService } from '../app-context';
import { JsonConfigService as ServerJsonConfigService } from '../json-config';
export class Platform {
    providers;
    rootInjector;
    resource = {};
    constructor(providers = []) {
        this.providers = providers;
        this.rootInjector = getProvider(Injector);
    }
    bootstrapRender(render) {
        registryRender(this.proxyRender.bind(this, render));
    }
    async proxyRender(render, global, isMicro = false) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fetch, request, location, readAssets, readStaticFile, proxyHost, microSSRPath, ..._global } = global;
        const microConfig = { fetch, isMicro, request, proxyHost, microSSRPath, readStaticFile, renderSSR: true, resource: this.resource };
        const injector = this.beforeBootstrapRender(microConfig, [
            { provide: HISTORY, useValue: { location: this.getLocation(request, isMicro), listen: () => () => void (0) } }
        ]);
        const { js = [], links = [] } = readAssets();
        const { html, styles } = await render(injector, { request, ..._global });
        const execlResult = await this.execlMicroMiddleware(injector, { html, styles, js, links, microTags: [], microFetchData: [] });
        injector.clear();
        return execlResult;
    }
    beforeBootstrapRender(context, providers = []) {
        const injector = new StaticInjector(this.rootInjector, { isScope: 'self' });
        const appContext = { useMicroManage: () => injector.get(MicroManage), ...context };
        const _providers = [
            ...this.providers,
            { provide: APP_CONTEXT, useValue: appContext },
            { provide: JsonConfigService, useClass: ServerJsonConfigService },
            { provide: AppContextService, useClass: ServerAppContextService },
            ...providers
        ];
        _providers.forEach((provider) => injector.set(provider.provide, provider));
        return injector;
    }
    mergeMicroToSSR(middleware) {
        return ({ html = ``, styles = ``, js = [], links = [], microTags = [], microFetchData = [] }) => middleware().pipe(map(({ microName, microResult }) => ({
            html: html.replace(`<!-- ${microName} -->`, microResult.html),
            styles: styles + microResult.styles,
            js: js.concat(...microResult.js || []),
            links: links.concat(...microResult.links || []),
            microTags: microTags.concat(...microResult.microTags || []),
            microFetchData: microFetchData.concat(...microResult.microFetchData || [])
        })));
    }
    async execlMicroMiddleware(injector, options) {
        const appContext = injector.get(AppContextService);
        const fetchData = appContext.getAllFileSource();
        return lastValueFrom(appContext.getpageMicroMiddleware().reduce((input, middleware) => (input.pipe(switchMap(this.mergeMicroToSSR(middleware)))), of(options))).then((execlResult) => ({ ...execlResult, fetchData }));
    }
    getLocation(request, isMicro) {
        const { pathname = '' } = request.params;
        return { pathname: isMicro ? `${pathname}` : request.path, search: '?' };
    }
}
