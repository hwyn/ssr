import { __assign, __awaiter, __decorate, __generator, __metadata, __rest, __spreadArray } from "tslib";
import { HttpHandler, HttpInterceptingHandler } from '@hwy-fm/core/common/http';
import { serializableAssets } from '@hwy-fm/core/micro';
import { APP_CONTEXT, AppContextService } from '@hwy-fm/core/providers/app-context';
import { JsonConfigService } from '@hwy-fm/core/providers/json-config';
import { APPLICATION_TOKEN, HISTORY } from '@hwy-fm/core/token';
import { Inject, Injector } from '@hwy-fm/di';
import { lastValueFrom, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { History } from '../common';
import { MicroManage } from '../micro';
import { AppContextService as ServerAppContextService } from '../providers/app-context';
import { JsonConfigService as ServerJsonConfigService } from '../providers/json-config';
import { RESOURCE } from '../token';
var Platform = /** @class */ (function () {
    function Platform() {
    }
    Platform.prototype.bootstrapRender = function (providers) {
        if (providers === void 0) { providers = []; }
        registryRender(this.proxyRender.bind(this, providers));
    };
    Platform.prototype.proxyRender = function (providers_1, global_1) {
        return __awaiter(this, arguments, void 0, function (providers, global, isMicro) {
            var request, resource, _global, context, injector, history, _a, _b, js, _c, links, _d, html, styles, executeResult;
            if (isMicro === void 0) { isMicro = false; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        request = global.request, resource = global.resource, _global = __rest(global, ["request", "resource"]);
                        context = { isMicro: isMicro, request: request, renderSSR: true, location: this.getLocation(request, isMicro) };
                        injector = this.beforeBootstrapRender(context, __spreadArray(__spreadArray([], providers, true), [
                            { provide: RESOURCE, useValue: resource },
                            { provide: HISTORY, useClass: History }
                        ], false));
                        history = injector.get(HISTORY);
                        _a = serializableAssets(resource.readAssetsSync()), _b = _a.js, js = _b === void 0 ? [] : _b, _c = _a.links, links = _c === void 0 ? [] : _c;
                        return [4 /*yield*/, this.runRender(injector, __assign({ request: request }, _global))];
                    case 1:
                        _d = _e.sent(), html = _d.html, styles = _d.styles;
                        return [4 /*yield*/, this.executeMicroMiddleware(injector, { html: html, styles: styles, js: js, links: links, microTags: [], microFetchData: [] })];
                    case 2:
                        executeResult = _e.sent();
                        executeResult.fetchData = injector.get(AppContextService).getPageFileSource();
                        injector.destroy();
                        return [2 /*return*/, history.redirect ? { status: '302', redirectUrl: history.redirect.url } : executeResult];
                }
            });
        });
    };
    Platform.prototype.beforeBootstrapRender = function (context, providers) {
        if (providers === void 0) { providers = []; }
        var injector = Injector.create([
            { provide: APP_CONTEXT, useValue: __assign({ useMicroManage: function () { return injector.get(MicroManage); } }, context) },
            { provide: HttpHandler, useExisting: HttpInterceptingHandler },
            { provide: JsonConfigService, useExisting: ServerJsonConfigService },
            { provide: AppContextService, useExisting: ServerAppContextService },
            providers
        ], this.platformInjector);
        return injector;
    };
    Platform.prototype.mergeMicroToSSR = function (middleware) {
        return function (_a) {
            var _b = _a.html, html = _b === void 0 ? "" : _b, _c = _a.styles, styles = _c === void 0 ? "" : _c, _d = _a.js, js = _d === void 0 ? [] : _d, _e = _a.links, links = _e === void 0 ? [] : _e, _f = _a.microTags, microTags = _f === void 0 ? [] : _f, _g = _a.microFetchData, microFetchData = _g === void 0 ? [] : _g;
            return middleware().pipe(map(function (_a) {
                var microName = _a.microName, microResult = _a.microResult;
                return ({
                    html: html.replace("<!-- ".concat(microName, " -->"), microResult.html),
                    styles: styles + microResult.styles,
                    js: js.concat.apply(js, microResult.js || []),
                    links: links.concat.apply(links, microResult.links || []),
                    microTags: microTags.concat.apply(microTags, microResult.microTags || []),
                    microFetchData: microFetchData.concat.apply(microFetchData, microResult.microFetchData || [])
                });
            }));
        };
    };
    Platform.prototype.executeMicroMiddleware = function (injector, options) {
        return __awaiter(this, void 0, void 0, function () {
            var appContext;
            var _this = this;
            return __generator(this, function (_a) {
                appContext = injector.get(AppContextService);
                return [2 /*return*/, lastValueFrom(appContext.getPageMicroMiddleware().reduce(function (input, middleware) { return (input.pipe(switchMap(_this.mergeMicroToSSR(middleware)))); }, of(options)))];
            });
        });
    };
    Platform.prototype.runRender = function (injector, options) {
        return __awaiter(this, void 0, void 0, function () {
            var application;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, injector.get(APPLICATION_TOKEN)];
                    case 1:
                        application = _b.sent();
                        return [2 /*return*/, (_a = application.main) === null || _a === void 0 ? void 0 : _a.call(application, injector, options)];
                }
            });
        });
    };
    Platform.prototype.getLocation = function (request, isMicro) {
        var _a = request.params.pathname, pathname = _a === void 0 ? '' : _a, query = request.query;
        var search = "?".concat(Object.keys(query).map(function (key) { return "".concat(key, "=").concat(query[key]); }).join('&'));
        return { pathname: isMicro ? "".concat(pathname) : request.path, search: search };
    };
    __decorate([
        Inject(Injector),
        __metadata("design:type", Injector)
    ], Platform.prototype, "platformInjector", void 0);
    return Platform;
}());
export { Platform };
