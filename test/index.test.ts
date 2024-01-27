import routesCollect from "../src/routes.collect";


// const r = routesCollect.collect('test/views');

// routesCollect.render(r);

routesCollect.renderToFile('test/views', 'test/__route.ts');