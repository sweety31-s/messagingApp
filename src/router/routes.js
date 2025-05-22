const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue'), name: 'Login' }, // Login should be the default page
      { path: '/home', component: () => import('pages/HomePage.vue'), name: 'Home' }, // Home page
      { path: '/about', component: () => import('pages/AboutPage.vue'), name: 'About' },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
