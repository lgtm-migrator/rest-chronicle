import path from 'path';
import fs from 'fs-extra';
import * as reporters from '../reporters';
import Action from './Action';

export default class Chronicle {
    constructor() {
        this._actions = [];
    }

    contextBuilder = c => c

    setContextBuilder(fn) {
        this.contextBuilder = fn;
    }

    action(context) {
        const action = new Action({
            context,
            chronicle : this
        });

        this._actions.push(action);

        return action;
    }

    clear() {
        this._actions = [];
    }

    async save(filePath, opts = {}) {
        const { reporter:reporterType = 'json', ...reporterOptions } = opts;
        const Reporter = reporters[reporterType];

        await fs.ensureDir(path.dirname(filePath));
        const reporter = new Reporter(filePath, reporterOptions);

        await reporter.write(this._actions.map(a => a.data));
    }
}
