import { RouteRecordRaw } from "vue-router";

const routerGenerated: RouteRecordRaw[] = [{
	path: "/",
	component: () => import(/* webpackChunkName: "page-index" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/index.vue"),
}, {
	path: "/bar",
	component: () => import(/* webpackChunkName: "page-bar-index" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/bar/index.vue"),
}, {
	path: "/bar/:id",
	component: () => import(/* webpackChunkName: "page-bar-_id" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/bar/$id.vue"),
}, {
	path: "/foo",
	component: () => import(/* webpackChunkName: "page-foo-_layout" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/foo/_layout.vue"),
	children: [{
		path: "/foo/:name",
		props: true,
		component: () => import(/* webpackChunkName: "page-foo-{name}" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/foo/{name}.vue"),
	}, {
		path: "/foo/hhh",
		component: () => import(/* webpackChunkName: "page-foo-hhh" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/foo/hhh.vue"),
	}],
}, {
	path: "/sus/:test",
	component: () => import(/* webpackChunkName: "page-sus-_test" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/sus/_test.vue"),
}, {
	path: "/sus/hello",
	component: () => import(/* webpackChunkName: "page-sus-hello" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/sus/hello.vue"),
}, {
	path: "/sus/klapeks",
	component: () => import(/* webpackChunkName: "page-sus-klapeks" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/sus/klapeks.vue"),
}, {
	path: "/bar/:pathMatch(.*)*",
	component: () => import(/* webpackChunkName: "page-bar-404" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/bar/404.vue"),
}, {
	path: "/:pathMatch(.*)*",
	component: () => import(/* webpackChunkName: "page-404" */ "/Users/klapeks/Codes/x_any/vue-auto-routes/test/views/404.vue"),
}];

export default routerGenerated;