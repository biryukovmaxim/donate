export default [
    {
      path: '/',
      component: import('@/components/AppHome')
    },
    {
      path: '/init',
      component: import('@/components/InitializeDonation')
    },
    {
    path: '/donate',
    component: import('@/components/SendDonation')
    }
]