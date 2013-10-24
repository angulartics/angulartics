angular.module('angulartics').provider('angulartics', function () {

	var noop = angular.noop, 
		metrics = {},
		metricBlockDefinition = noop;

	/**
	 * Service definition.
	 */
	var angulartics = {
		/**
		 * Determines if console logging is enabled.
		 */
		log: false,

		/**
		 * Returns the specified metric or raises an exception if it doesn't exist.
		 *
		 * @returns {Function}
		 */
		metric: function (name) { 
			if (metrics[name] === undefined) throw 'Invalid metric: "' + name + '"';
			return metrics[name]; 
		}
	};

	function normalize(definition) {
		return angular.isFunction(definition) && definition || function (params) { return angular.extend({}, definition, params); };
	}

	this.beginMetricBlock = function (definition) {
		if (metricBlockDefinition !== noop) throw 'Already in a metric block';
		metricBlockDefinition = normalize(definition);
		return this;
	}

	this.endMetricBlock = function () {
		metricBlockDefinition = noop;
		return this;
	}

	this.metric = function (name, definition) {
		if (definition && !angular.isObject(definition) && !angular.isFunction(definition)) {
			throw 'Metric definition must be an object or a function';
		}

		var blockDefinition = angular.copy(metricBlockDefinition);
		metrics[name] = (blockDefinition !== noop || definition) && function (subject) {
			return angular.extend({}, blockDefinition(subject), normalize(definition)(subject));
		} || null;

		return this;
	};

	this.consoleLogging = function (enabled) {
		angulartics.log = enabled;
		return this;
	}

	this.$get = function () {
		return angulartics;
	}
	
});