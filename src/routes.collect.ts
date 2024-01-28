import fs from 'fs';
import mPath from 'path';
import readline from 'readline';

interface VueRoute {
    path: string,
    filename: string,
    name?: string,
    props?: boolean,
    alias?: string[],
    component: string,
    children?: VueRoute[]
}

async function readFirst5Lines(file: string) {
    const readable = fs.createReadStream(file);
    const reader = readline.createInterface({ input: readable });
    const lines3 = await new Promise<string[]>((resolve) => {
        const lines: string[] = [];
        reader.on('line', (line) => {
            lines.push(line);
            if (lines.length >= 5) {
                reader.removeAllListeners('line');
                reader.removeAllListeners('close');
                reader.close();
                resolve(lines);
            }
        });
        reader.on('close', () => {
            resolve(lines);
        });
    });
    readable.close();
    return lines3;
}

async function collect(dir: string, path = '/'): Promise<VueRoute[]> {
    if (path.startsWith('//')) path = path.substring(1);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    // console.log("Files in", dir, 'is', files);
    let vueRoute: VueRoute[] = []

    function joinWithPath(vueFile: string) {
        if (vueFile.endsWith('.vue')) {
            vueFile = vueFile.substring(0, vueFile.length-4);
        }
        if (vueFile == '404') vueFile = ':pathMatch(.*)*';
        if (vueFile.startsWith('_')) vueFile = vueFile.replace('_', ':');
        if (vueFile.startsWith('$')) vueFile = vueFile.replace('$', ':');
        if (vueFile.startsWith('{') && vueFile.endsWith('}')) {
            vueFile = ':'+vueFile.substring(1, vueFile.length - 1);
        }
        if (vueFile == 'index') return path;

        if (path.endsWith('/')) return path + vueFile;
        else return path + '/' + vueFile;
    }
    function cwdDir(vueFile: string) {
        return mPath.join(process.cwd(),dir,vueFile)
    }

    async function getInFileInfo(file: string) {
        const lines = await readFirst5Lines(mPath.join(dir, file));
        const info: any = {};
        for (let line of lines) {
            line = line.trim();
            if (!line.startsWith('<!--')) continue;
            line = line.substring(4);
            if (line.endsWith('-->')) {
                line = line.substring(0, line.length - 3);
            }
            line = line.trim();
            if (line.startsWith('#name:')) {
                line = line.substring(6);
                line = line.trim();
                if (line[0] == '"' || line[0] == "'") {
                    line = line.substring(1);
                }
                if (line[line.length-1] == '"' || line[line.length-1] == "'") {
                    line = line.substring(0, line.length-1);
                }
                info.name = line.trim();
                continue;
            } 
            if (line.startsWith("#alias:")) {
                line = line.substring(7);
                line = line.trim();
                try {
                    while (line.includes("'")) {
                        line = line.replace("'", '"');
                    }
                    info.alias = JSON.parse(line);
                } catch (err) {
                    console.error("Invalid alias json for file", file, ":", line);
                }
            }
        }
        return info;
    } 
    
    for (let file of files) {
        const stat = fs.statSync(mPath.join(dir, file));
        if (stat.isDirectory()) {
            const r = await collect(mPath.join(dir, file), path+'/'+file);
            vueRoute.push(...r);
            continue;
        }
        if (file === '_layout.vue') continue;
        if (!file.endsWith('.vue')) continue;
        const addsInfo = await getInFileInfo(file);
        file = file.substring(0, file.length - 4);
        // console.log('adding file ', file, ' in api path', path);
        let vr: VueRoute = {
            name: addsInfo.name,
            filename: mPath.join(path, file).substring(1),
            path: joinWithPath(file),
            alias: addsInfo.alias,
            component: cwdDir(file+'.vue'),
        }
        if (!vr.name) delete vr.name;
        if (!vr.alias?.length) delete vr.alias;
        if (file.startsWith('{') && file.endsWith('}')) {
            vr.props = true;
        }
        // if (file === 'index') {
        //     vr.alias = [path];
        // }
        vueRoute.push(vr);
    }
    vueRoute.sort((v1, v2) => {
        if (v1.path.endsWith('/index')) return -1;
        if (v2.path.endsWith('/index')) return 1;
        if (v1.path.startsWith('/:pathMatch')) return 1;
        if (v2.path.startsWith('/:pathMatch')) return -1;
        if (v1.path.includes(":pathMatch")) return 1;
        if (v2.path.includes(":pathMatch")) return -1;
        return v1.path.localeCompare(v2.path);
    })
    if (files.includes("_layout.vue")) {
        return [{
            filename: mPath.join(path, "_layout"),
            path: path,
            component: cwdDir('_layout.vue'),
            children: vueRoute
        }];
    }
    return vueRoute;
}

function render(routes: VueRoute[], willOutput: string, prefix=''): string {
    let str = '';
    for (let route of routes) {
        str += ', {\n';
        if (route.name) {
            str += prefix+'\tname: "'+route.name+'",\n';
        }
        str += prefix+'\tpath: "'+route.path+'",\n';
        if (route.alias) {
            str += prefix+'\talias: '+JSON.stringify(route.alias)+',\n';
        }
        if (route.props) str += prefix+'\tprops: true,\n';
        
        str += prefix+'\tcomponent: () => import(';
        let rrr = 'page-'+route.filename;
        while (rrr.includes('\\')) rrr = rrr.replace('\\', '-');
        while (rrr.includes('/')) rrr = rrr.replace('/', '-');
        while (rrr.includes('--')) rrr = rrr.replace('--', '-');
        while (rrr.includes('$')) rrr = rrr.replace('$', '_');
        str += '/* webpackChunkName: "' + rrr + '" */ ';

        rrr = mPath.relative(willOutput, route.component).substring(1);
        while (rrr.includes('\\')) rrr = rrr.replace('\\', '/');
        if (rrr.startsWith('./.')) rrr = rrr.substring(2);
        str += '"' + rrr + '"),\n';

        if (route.children) {
            str += prefix+'\tchildren: ['
            str += render(route.children, willOutput, prefix + '\t');
            str += '],\n';
        }
        str += prefix+'}';
    }
    return str.substring(2);
}

const routesCollect = {
    collect, render,
    async renderToFile(dir: string, output: string) {
        let str = '/**\n';
        str += '* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.\n';
        str += '* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.\n';
        str += '* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.\n';
        str += '*/\n\n';
        if (output.endsWith('.ts')) {
            str += 'import { RouteRecordRaw } from "vue-router";\n\n'
            str += 'const routerGenerated: RouteRecordRaw[] = [';
        } else str += 'const routerGenerated = [';
        str += render(await collect(dir), output);
        str += '];\n\n';
        str += 'export default routerGenerated;';
        fs.writeFileSync(mPath.join(process.cwd(), output), str);
    }
}

export default routesCollect;