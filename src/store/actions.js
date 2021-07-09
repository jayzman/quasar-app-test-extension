import { axiosInstance } from 'boot/axios'
import { Cookies } from 'quasar'

import prompts from 'app/quasar.extensions.json'

const VERIFICATION_ROUTE = prompts['ext-quasar-auth'].verificationRoute
const LOGIN_ROUTE = prompts['ext-quasar-auth'].baseUrl.loginRoute
const FETCH_USER_ROUTE = prompts['ext-quasar-auth'].fetchUserRoute
const AUTHENTICATION_SCHEME = prompts['ext-quasar-auth'].authenticationScheme
const IDENTIFIER_FIELD = prompts['ext-quasar-auth'].identifierField


export function login (state, data) {
  const p = new Promise(function (resolve, reject) {
    return axiosInstance
      .post(LOGIN_ROUTE, data.body)
      .then(response => {
        state.commit('setUser', response.data.user.data)
        if (AUTHENTICATION_SCHEME === 'Basic') {
          state.dispatch('setHeader', {
            [IDENTIFIER_FIELD]: data.body[IDENTIFIER_FIELD],
            password: data.body.password,
            rememberMe: data.rememberMe
          })
        } else {
          const token = response.data.token
          state.dispatch('setHeader', {
            token: token,
            rememberMe: data.rememberMe
          })
        }
        resolve()
      })
      .catch(error => {
        reject(error)
      })
  })
  return p
}

export function setHeader (state, data) {
  if (AUTHENTICATION_SCHEME === 'Basic') {
    axiosInstance.defaults.headers.common.Authorization =
      'Basic ' + btoa(`${data[IDENTIFIER_FIELD]}:${data.password}`)
  } else {
    axiosInstance.defaults.headers.common.Authorization =
      'Bearer ' + data.token
    if (data.rememberMe) {
      Cookies.set('authorization_token', data.token, {
        expires: 365
      })
    } else {
      Cookies.set('authorization_token', data.token)
    }
  }
}

export async function fetch (state) {
  var token = Cookies.get('authorization_token')
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token
  }
  if (axiosInstance.defaults.headers.common.Authorization) {
    return axiosInstance.get(FETCH_USER_ROUTE).then(response => {
      state.commit('setUser', response.data.data)
    }).then(() => {
      state.dispatch('loginCallback')
    })
  } else {
    return new Promise((resolve, reject) => {
      reject('No authorization token found')
    })
  }
}


export function verify (state, token) {
  return axiosInstance.get(VERIFICATION_ROUTE + '?token=' + token)
}

export function loginCallback (state, data = {}) {
  for (const loginCallback of state.state.loginCallbacks) {
    loginCallback({ router: data.router })
  }
}
