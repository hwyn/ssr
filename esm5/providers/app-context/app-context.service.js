import { __assign, __awaiter, __decorate, __extends, __generator, __metadata } from "tslib";
import { AppContextService as SharedAppContextService } from '@hwy-fm/core';
import { Injectable, Injector } from '@hwy-fm/di';
import { RESOURCE } from '../../token';
var AppContextService = /** @class */ (function (_super) {
    __extends(AppContextService, _super);
    function AppContextService(injector) {
        var _this = _super.call(this, injector) || this;
        _this.request = _this.getContext().request;
        _this.pageFileSource = {};
        _this.microMiddlewareList = [];
        _this.resource = _this.injector.get(RESOURCE);
        return _this;
    }
    AppContextService.prototype.setPageSource = function (url, sourceCache) {
        this.pageFileSource[url] = sourceCache;
    };
    AppContextService.prototype.cacheToArray = function (map) {
        return Object.keys(map).map(function (key) { return (__assign({ url: key }, map[key])); });
    };
    AppContextService.prototype.proxyFetch = function (url, init) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resource.proxyFetch(url, __assign(__assign({}, init), { request: this.request })).then(function (res) {
                        res.clone().arrayBuffer().then(function (text) {
                            var source = Buffer.from(text).toString('base64');
                            var fetchCache = { type: 'fetch-cache', method: init === null || init === void 0 ? void 0 : init.method, source: source };
                            _this.setPageSource(url, fetchCache);
                        });
                        return res;
                    })];
            });
        });
    };
    AppContextService.prototype.readStaticFile = function (url) {
        var fileCache = this.resource.readStaticFile(url);
        this.setPageSource(url, fileCache);
        return fileCache.source;
    };
    AppContextService.prototype.registryMicroMiddler = function (middleware) {
        this.microMiddlewareList.push(middleware);
    };
    AppContextService.prototype.getPageFileSource = function () {
        return JSON.stringify(this.cacheToArray(this.pageFileSource));
    };
    AppContextService.prototype.getAllFileSource = function () {
        return JSON.stringify(this.cacheToArray(__assign(__assign({}, this.getContext().resource), this.pageFileSource)));
    };
    AppContextService.prototype.getPageMicroMiddleware = function () {
        return this.microMiddlewareList;
    };
    Object.defineProperty(AppContextService.prototype, "fetch", {
        get: function () {
            return this.proxyFetch.bind(this);
        },
        enumerable: false,
        configurable: true
    });
    AppContextService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Injector])
    ], AppContextService);
    return AppContextService;
}(SharedAppContextService));
export { AppContextService };
