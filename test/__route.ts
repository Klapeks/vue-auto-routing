/**
* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.
* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.
* THIS FILE IS AUTOMAITCALY GENERATED. DONT CHANGE IT.
*/

import { RouteRecordRaw } from "vue-router";

const routerGenerated: RouteRecordRaw[] = [{
	path: "/",
	component: () => import(/* webpackChunkName: "page-index" */ "./views/index.vue"),
}, {
	path: "/bar",
	component: () => import(/* webpackChunkName: "page-bar-index" */ "./views/bar/index.vue"),
}, {
	path: "/bar/:id",
	props: true,
	component: () => import(/* webpackChunkName: "page-bar-_id" */ "./views/bar/$id.vue"),
}, {
	path: "/foo",
	component: () => import(/* webpackChunkName: "page-foo-_layout" */ "./views/foo/_layout.vue"),
	children: [{
		path: "/foo/:name",
		props: true,
		component: () => import(/* webpackChunkName: "page-foo-{name}" */ "./views/foo/{name}.vue"),
	}, {
		path: "/foo/hhh",
		component: () => import(/* webpackChunkName: "page-foo-hhh" */ "./views/foo/hhh.vue"),
	}],
}, {
	path: "/sus/:test",
	component: () => import(/* webpackChunkName: "page-sus-_test" */ "./views/sus/_test.vue"),
}, {
	path: "/sus/hello",
	component: () => import(/* webpackChunkName: "page-sus-hello" */ "./views/sus/hello.vue"),
}, {
	path: "/sus/klapeks",
	component: () => import(/* webpackChunkName: "page-sus-klapeks" */ "./views/sus/klapeks.vue"),
}, {
	path: "/bar/:pathMatch(.*)*",
	component: () => import(/* webpackChunkName: "page-bar-404" */ "./views/bar/404.vue"),
}, {
	path: "/:pathMatch(.*)*",
	component: () => import(/* webpackChunkName: "page-404" */ "./views/404.vue"),
}];

export default routerGenerated;