import { routeDown } from 'redux-composed'

function getSafely(obj, element) {
	return obj == null ? undefined : obj[element];
}

export default class ProxyStore {
	constructor(store, path) {
		this.store = store;
		this.path = path;
	}

	getState = () => {
		var state = this.store.getState();
		for(var pathElement of this.path) {
			state = getSafely(state, pathElement);
		}
		return state;
	}

	dispatch = (action) => {
		for (var i = this.path.length - 1; i >= 0; i--) {
			var component = this.path[i];
			action = routeDown(action, component);
		}
		this.store.dispatch(action);
	}

	subscribe = (listener) => {
		// TODO: possibly only trigger when the action affected this part of the store?
		return this.store.subscribe(listener);
	}
}

