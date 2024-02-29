import { StaticController } from "../controllers/static.controller";
import { TestController } from "../controllers/test.controller";

const STATIC_ROUTES: Array<StaticRoute> = [
    { path: '/', callback: StaticController.route },
    { path: '/index.css', callback: StaticController.route },
    { path: '/index.js', callback: StaticController.route }
];

const ROUTES: Array<Route> = [
    { method: 'GET', controller: 'test', action: 'index', callback: TestController.index }
];

export function findRoute ( method: HttpRequestType, controller: string, action: string ): Route | Unknown {
    return ROUTES.find( it => it.method === method && it.controller === controller && it.action === action );
}

export function findStaticRoute ( path: string | Unknown ): StaticRoute | Unknown {
    return STATIC_ROUTES.find( it => it.path === path );
}
