/* eslint-disable */

function isArrayOrString (variable) {
  if (typeof variable === typeof [] || typeof variable === typeof '') {
    return true
  }
  return false
}
import auth from 'ext-quasar-auth/store'

export default ({ app, router, store, Vue }) => {
  /**
   * Register auth store
   */
  store.registerModule('auth', auth)

  /**
    * Set route guard
    */
  router.beforeEach((to, from, next) => {
    const record = to.matched.find(record => record.meta.auth)
    if (record) {
      if (!store.getters['auth/loggedIn']) {
        return store.dispatch('auth/fetch').then((data) => {
          if (!store.getters['auth/loggedIn']) {
            next('/')
          } else if (
            isArrayOrString(record.meta.auth) &&
            !store.getters['auth/check'](record.meta.auth)
          ) {
            next('/account')
          } else {
            next()
          }
        }).catch(err => {
          next('/')
        })
      } else if (
        isArrayOrString(record.meta.auth) &&
        !store.getters['auth/check'](record.meta.auth)
      ) {
        return next('/account')
      }
    }
    next()
  })

  /**
  * Set authentication routes
  */
  let { routes } = router.options
  let routeData = routes.find(r => r.path === '/')
  const currentRoutes = routeData.children.map(route => route.path)
  const newRoutes = [
    {
      path: '/login',
      name: 'login',
      component: () => import('ext-quasar-auth/pages/Login')
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('ext-quasar-auth/pages/Logout')
    },
    {
      path: '/verification',
      name: 'verification',
      component: () => import('ext-quasar-auth/pages/Verification')
    }
  ]
  routeData.children = []
  for (let route of newRoutes) {
    if (!currentRoutes.includes(route.path)) {
      routeData.children.push(route)
    }
  }
  router.addRoutes([routeData])

  app.mounted = () => {
    store.dispatch('auth/fetch').catch(() => {
      store.dispatch('auth/logout')
    })
  }

  var helper = {}
  helper.login = async (data) => { return store.dispatch('auth/login', data) }
  helper.verify = (token) => { return store.dispatch('auth/verify', token) }
  helper.loggedIn = () => { return store.getters['auth/loggedIn'] }
  helper.check = (roles) => { return store.getters['auth/check'](roles) }
  helper.setHeader = (data) => { return store.dispatch('auth/setHeader', data) }
  helper.fetch = () => { return store.dispatch('auth/fetch') }
  helper.user = () => { return store.getters['auth/user'] }
  Vue.prototype.$auth = helper

  store.commit('auth/addLoginCallback', () => console.log('Logged in'))

}
