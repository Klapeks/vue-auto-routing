import fs from 'fs';
import mPath from 'path';

interface VueRoute {
    path: string,
    filename: string,
    props?: boolean,
    alias?: string[],
    component: string,
    children?: VueRoute[]
}

function collect(dir: string, path = '/'): VueRoute[] {
    if (path.startsWith('//')) path = path.substring(1);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    console.log("Files in", dir, 'is', files);
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
    
    for (let file of files) {
        const stat = fs.statSync(mPath.join(dir, file));
        if (stat.isDirectory()) {
            const r = collect(mPath.join(dir, file), path+'/'+file);
            vueRoute.push(...r);
            continue;
        }
        if (file === '_layout.vue') continue;
        if (!file.endsWith('.vue')) continue;
        file = file.substring(0, file.length - 4);
        console.log('adding file ', file, ' in api path', path);
        let vr: VueRoute = {
            filename: mPath.join(path, file).substring(1),
            path: joinWithPath(file),
            component: cwdDir(file+'.vue'),
        }
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

function render(routes: VueRoute[], prefix=''): string {
    let str = '';
    for (let route of routes) {
        str += ', {\n';
        str += prefix+'\tpath: "'+route.path+'",\n';
        if (route.alias) {
            str += prefix+'\talias: '+JSON.stringify(route.alias)+',\n';
        }
        if (route.props) str += prefix+'\tprops: true,\n';
        
        str += prefix+'\tcomponent: () => import(';
        let rrr = 'page-'+route.filename;
        while (rrr.includes('/')) rrr = rrr.replace('/', '-');
        while (rrr.includes('--')) rrr = rrr.replace('--', '-');
        while (rrr.includes('$')) rrr = rrr.replace('$', '_');
        str += '/* webpackChunkName: "' + rrr + '" */ ';
        str += '"' + route.component + '"),\n';

        if (route.children) {
            str += prefix+'\tchildren: ['
            str += render(route.children, prefix + '\t');
            str += '],\n';
        }
        str += prefix+'}';
    }
    return str.substring(2);
}

const routesCollect = {
    collect, render,
    renderToFile(dir: string, output: string) {
        let str = '';
        if (output.endsWith('.ts')) {
            str = 'import { RouteRecordRaw } from "vue-router";\n\n'
        }
        str += 'const routerGenerated: RouteRecordRaw[] = [';
        str += render(collect(dir));
        str += '];\n\n';
        str += 'export default routerGenerated;';
        fs.writeFileSync(mPath.join(process.cwd(), output), str);
    }
}

export default routesCollect;