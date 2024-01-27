import fs from 'fs';
import routesCollect from './routes.collect';

interface VAROptions {
    dir: string,
    output: string,
    watchMode: boolean
}

const pluginName = '@klapeks/vue-auto-routing';

export default class VueAutoRouting {
    private opts: VAROptions;
    constructor(opts: VAROptions) {
        this.opts = opts;
        if (!this.opts.dir) throw new Error('`dir` is required!')
        if (!this.opts.output) throw new Error('`output` is required!')
    }

    apply(compiler: any) {
        const fn = (c: any) => {
            const watchMode = this.opts.watchMode || c.watchMode;

            if (watchMode) {
                const watcher = fs.watch(this.opts.dir, { recursive: true });
                watcher.on('change', this.writeRoutesFile.bind(this));
            }
        }

        this.writeRoutesFile();

        compiler.hooks.run.tap(pluginName, fn);
        compiler.hooks.watchRun.tap(pluginName, fn);
    }

    async writeRoutesFile() {
        await routesCollect.renderToFile(this.opts.dir, this.opts.output);
    }
}
