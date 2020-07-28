import { URL } from 'url';
import { isArray, isFunction, getProp } from 'myrmidon';

function arrayKeyFilter(keys) {
    return function (action, actions) {
        const dublicate = actions.find(a =>
            keys.every(key => getProp(action, key) === getProp(a, key))
            && a._id !== action._id
        );

        return !dublicate;
    };
}

function chronicleMiddleware(req, res, next) {
    const action = this._chronicle.action(this);
    const originalWrite = res.write;
    const originalEnd = res.end;
    const chunks = [];

    res.write = function (chunk) {
        chunks.push(chunk);
        originalWrite.apply(res, arguments);
    };
    res.end = function (chunk) {
        if (chunk) {
            chunks.push(chunk);
        }
        originalEnd.apply(res, arguments);
    };
    const url = new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`);

    if (req.route) {
        url.pathname = req.route.path;
    }
    action.request = {
        url,
        headers : req.headers,
        method  : req.method,
        body    : req._body ? req.body : null
    };
    res.on('finish',  () => {
        const body = Buffer.concat(chunks).toString('utf8');

        action.response = {
            body    : body && JSON.parse(body),
            headers : res.getHeaders(),
            http    : {
                version : res.httpVersion
            },
            status : {
                code    : res.statusCode,
                message : res.statusMessage
            }
        };
        const save = this._config?.save;

        if (save) {
            const actions = this._chronicle._actions;

            if (isFunction(save)) {
                save(action, actions, this._chronicle, this._config);
            } else {
                let isApproved = true;

                if (save.uniqueFilter) {
                    if (isFunction(save.uniqueFilter)) isApproved = save.uniqueFilter(action, actions);
                    if (isArray(save.uniqueFilter)) isApproved = arrayKeyFilter(save.uniqueFilter)(action, actions);
                }
                if (!isApproved) return;
                const { server } = req.socket;

                if (!server._chronicles) server._chronicles = [];
                server._chronicles.push(
                    Promise.all(
                        save.files.map(
                            ({ path, ...opts }) => this._chronicle.save(path, opts)
                        )
                    )
                );
            }
        }
    });

    next();
}

export default class Express {
    constructor(chronicle, config = {}) {
        this._chronicle = chronicle;
        this._config = config;

        return this.generateMiddleWare;
    }

    generateMiddleWare = (...args) => {
        return (...expressArgs) => {
            const config = this.getConfig(...args, ...expressArgs);

            chronicleMiddleware.call(config, ...expressArgs);
        };
    }

    getConfig(...args) {
        if (typeof args[0] === 'function') {
            return {
                ...args[0](...args.slice(1)),
                _chronicle : this._chronicle,
                _config    : this._config
            };
        }

        return {
            _chronicle : this._chronicle,
            _config    : this._config,
            group      : args[0],
            title      : args[1]
        };
    }
}
