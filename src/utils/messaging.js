import firebase from 'firebase/app'
import 'firebase/messaging'
import { publicVapidKey } from '../config'
import { triggerAnalyticsEvent } from 'utils/analytics'

/**
 * Write FCM messagingToken to user profile
 * @param {String} messagingToken - Token to be written to user profile
 */
function updateUserProfileWithToken(messagingToken) {
  const currentUserUid =
    firebase.auth().currentUser && firebase.auth().currentUser.uid
  if (!currentUserUid) {
    return
  }
  return firebase
    .firestore()
    .collection('users')
    .doc(currentUserUid)
    .set(
      {
        messaging: {
          mostRecentToken: messagingToken,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      },
      { merge: true }
    )
}

let vapidKeyHasBeenInitialized = false

/**
 * Get messaging token from Firebase messaging
 */
function getMessagingToken() {
  const messaging = firebase.messaging()

  if (!vapidKeyHasBeenInitialized) {
    messaging.usePublicVapidKey(publicVapidKey)
    vapidKeyHasBeenInitialized = true
  }

  return messaging.getToken().catch((err) => {
    console.error('Unable to retrieve refreshed token ', err) // eslint-disable-line no-console
    return Promise.reject(err)
  })
}

/**
 * Get Cloud Messaging Token and write it to the currently logged
 * in user's profile
 */
function getTokenAndWriteToProfile() {
  return getMessagingToken().then(updateUserProfileWithToken)
}

/**
 * Request permission from the user to display display
 * browser notifications
 */
function requestPermission() {
  return firebase
    .messaging()
    .requestPermission()
    .then(getTokenAndWriteToProfile)
    .catch((err) => {
      if (
        err &&
        (err.code === 'messaging/permission-blocked' ||
          err.code === 'messaging/permission-default')
      ) {
        console.log('Messaging permission blocked') // eslint-disable-line no-console
        triggerAnalyticsEvent('denyMessagingPermission')
        // Skip throwing of error to prevent this from going to the error handler
      } else {
        console.error('Error requesting permission to notify:', err) // eslint-disable-line no-console
        return Promise.reject(err)
      }
    })
}

/**
 * Setup Firebase Cloud Messaging. This  requests permission from the
 * user to show browser notifications. If the user approves or if they have
 * approved in the passed, then a Cloud Messaging Token is written to the
 * user's profile.
 */
export function initializeMessaging() {
  const messaging = firebase.messaging()

  // Handle Instance ID token updates
  messaging.onTokenRefresh(() => {
    getTokenAndWriteToProfile()
  })

  // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a service worker
  //   `messaging.setBackgroundMessageHandler` handler.
  messaging.onMessage((payload) => {
    // const DEFAULT_MESSAGE = 'Message!'
    // const message = get(payload, 'notification.body', DEFAULT_MESSAGE)
    // const messageMethod = message.toLowerCase().includes('success')
    //   ? 'showSuccess'
    //   : 'showMessage'
    // Dispatch showSuccess action
    // TODO: Move this into the NotificationsProvider
    // messageActions[messageMethod](message)(dispatch)
  })

  // Request permission to setup browser notifications
  requestPermission()
}
