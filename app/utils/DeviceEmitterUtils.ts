import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';

/**
 * Event bus names.
 */
export enum EventBusName {
  WORKOUT = 'Workout',
  GROUP = 'Group'
}

/**
 * Workout event names.
 */
export enum WorkoutEvent {
  CLOSE_SWIPEABLE = 'closeWorkoutSwipeable',
  CLOSE_ALL_SWIPEABLE = 'closeAllWorkoutSwipeable'
}

/**
 * Group event names.
 */
export enum GroupEvent {
  CLOSE_SWIPEABLE = 'closeGroupSwipeable',
  CLOSE_ALL_SWIPEABLE = 'closeAllGroupSwipeable'
}

/**
 * Event bus keys.
 */
type EventBusKey = `${WorkoutEvent}` | `${GroupEvent}`;

/**
 * Emit an event to the event bus.
 *
 * @param {EventBusName} eventName - The name of the event
 * @param {EventBusKey} key - The key of the event
 * @param {any} [value] - The value of the event. Will be frozen before emitting.
 * @returns {void} None
 */
export const emitEventBus = (eventName: EventBusName, key: EventBusKey, value?: any): void => {
  const data = Object.freeze({
    [key]: value
  });
  DeviceEventEmitter.emit(eventName, data);
};

/**
 * Listen to an event on the event bus.
 *
 * @param {EventBusName} eventName - The name of the event
 * @param {(eventData: Object) => void} callback - The callback to be invoked when the event is emitted.
 * The callback will receive an object with the specified event key.
 * @returns {EmitterSubscription} The subscription of the listener,
 * which can be used to remove the listener later.
 */
export const eventBusListener = (
  eventName: EventBusName,
  callback: (eventData: Object) => void
): EmitterSubscription => {
  return DeviceEventEmitter.addListener(eventName, callback);
};
