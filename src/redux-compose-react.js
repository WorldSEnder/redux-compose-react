import { Component, Children } from 'react'
import PropTypes from 'prop-types'

import ProxyStore from './ProxyStore.js'

const subscriptionShape = PropTypes.shape({
  trySubscribe: PropTypes.func.isRequired,
  tryUnsubscribe: PropTypes.func.isRequired,
  notifyNestedSubs: PropTypes.func.isRequired,
  isSubscribed: PropTypes.func.isRequired,
})

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
})

function warning(message) {
  if (console !== undefined && typeof console.error === 'function') {
    console.error(message)
  }
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message)
  } catch (e) {}
}

let hasReceivedWarning = false;
function warnAboutUpdatedPath() {
	// Unsupported, because Connect does not react to the store changing
	if(hasReceivedWarning) return;
	
	warning('<SubProvider> does not support changing the path into the store on the fly.' +
		'The reason is that nested <Connect> elements will not react to these changes')
	hasReceivedWarning = true;
}

export function createProvider(storeKey = 'store', subKey) {
	const subscriptionKey = subKey || `${storeKey}Subscription`;

	class SubProvider extends Component {
		static propTypes = {
			path: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
			children: PropTypes.element.isRequired,
		}
		static contextTypes = {
			[storeKey]: storeShape.isRequired,
			[subscriptionKey]: subscriptionShape,
		}
		static childContextTypes = {
			[storeKey]: storeShape.isRequired,
			[subscriptionKey]: subscriptionShape,
		}

		constructor(props, context) {
			super(props, context)
			this[storeKey] = new ProxyStore(context[storeKey], props.path)
			this[subscriptionKey] = context[subscriptionKey]
		}

		getChildContext() {
			return { [storeKey]: this[storeKey], [subscriptionKey]: this[subscriptionKey] }
		}

		render() {
			return Children.only(this.props.children)
		}

		componentWillUpdate(props, context) {
			if(process.env.NODE_ENV !== 'production' && this.props.path !== props.path) {
				warnAboutUpdatedPath();
			}
		}
	}

	return SubProvider
}

export default createProvider()

