// document.getElementsByTagName('html')[0].dataset.tkPrefix = 'po';

describe('angulartics', function () {

	var analytics = window.analytics;

	it('analytics library should be loaded', function () {
		expect(analytics).toBeDefined();
	});

	/**
	 * Helper functions
	 */
	function accessProviders(fn) {
		var name = 'test_' + new Date().getTime().toString();
		angular.module(name, []).config(fn);
		module(name);
	}

	var angularticsProvider, angulartics;

	beforeEach(module('angulartics'));

	beforeEach(function () {
		accessProviders(function (_angularticsProvider_) { angularticsProvider = _angularticsProvider_; });
		inject(function (_angulartics_) { angulartics = _angulartics_; });
	});		

	describe('provider', function () {

		describe('metric method', function () {
			it('returns reference to provider', function () {
				expect(angularticsProvider.metric('dummy')).toBe(angularticsProvider);
			});
		});

		// it('should initialize null metric', function () {
		// 	angularticsProvider.metric('test');
		// 	expect(angulartics.metric('test')).toBeNull();
		// });

		// it('should initialize metric with args', function () {
		// 	angularticsProvider.metric('test', {});
		// 	expect(angulartics.metric('test')).toEqual(jasmine.any(Function));
		// 	expect(angulartics.metric('test')()).toEqual({});
		// });

		// it('should correctly create metric block', function () {
		// 	angularticsProvider
		// 		.metric('test-outside-block-1', { bar: 'bar' })
		// 		.beginMetricBlock({ foo: 'foo' })
		// 		.metric('test-inside-block')
		// 		.endMetricBlock()
		// 		.metric('test-outside-block-2', { moe: 'moe' });
		// 	expect(angulartics.metric('test-outside-block-1')()).toEqual({ bar: 'bar' });
		// 	expect(angulartics.metric('test-inside-block')()).toEqual({ foo: 'foo' });
		// 	expect(angulartics.metric('test-outside-block-2')()).toEqual({ moe: 'moe' });
		// });

		// it('should not allow nested metric blocks', function () {
		// 	expect(function () {
		// 		angularticsProvider.beginMetricBlock({}).beginMetricBlock({});
		// 	}).toThrow('Already in a metric block');
		// });
	});

	// describe('service', function () {
	// 	it('should throw error for inexistent metric', function () {
	// 		expect(function () { angulartics.metric('nope'); }).toThrow('Invalid metric: "nope"');
	// 	});
	// });

    describe('event tracking', function () {

		function compile(html) {
			var elem = angular.element(html);
			$compile(elem)(scope);
			return elem;
		}

	    var $compile, scope;

		beforeEach(function () {
			inject(function (_$compile_, $rootScope) {
				$compile = _$compile_;
				scope = $rootScope.$new();
			});			
			spyOn(analytics, 'track');
		});

		beforeEach(function () {
			angularticsProvider
			.metric('test')
			.metric('testWithParams', { foo: 'foo' })
			.metric('testWithFunction', function (data) { return { bar: data.bar } });
		});

		it('is triggered on explicit event', function () {
			compile('<button track-metric="test" track-on="click"></button>').triggerHandler('click');
			expect(analytics.track).toHaveBeenCalledWith('test');
		});

		describe('is triggered on', function () {
			[/*'a:click',*/ 'button:click', 'form:submit', 'iframe:load'].forEach(function (testCase) {
				var split = testCase.split(':'), tag = split[0], trigger = split[1];

				it('inferred "' + trigger + '"" event handler for <' + tag + '>', function () {
					var element = document.createElement(tag);
					element.setAttribute('track-metric', 'test');
					compile(element).triggerHandler(trigger);
					expect(analytics.track).toHaveBeenCalledWith('test');
				});
			});
		});

		it('is triggered with attribute parameters', function () {
			compile('<button track-metric="test" track-params="{bar:\'bar\'}"></button>').triggerHandler('click');
			expect(analytics.track).toHaveBeenCalledWith('test', { bar: 'bar' });
		});

		it('is triggered with metric parameters', function () {
			compile('<button track-metric="testWithParams"></button>').triggerHandler('click');
			expect(analytics.track).toHaveBeenCalledWith('testWithParams', { foo: 'foo' });
		});		

		it('is triggered with metric function', function () {
			scope.data = { bar: 'bar' };
			compile('<button track-metric="testWithFunction" track-params="data"></button>').triggerHandler('click');		
			expect(analytics.track).toHaveBeenCalledWith('testWithFunction', { bar: 'bar' });
		});

		// it('should be triggered with ng-model and args', function () {
		// 	angularticsProvider.metric('test', function (model) { return { modelBar: model.bar, argFoo: 'foo' } });
		// 	scope.data = { bar: 'bar' };
		// 	compile('<button track-metric="test" ng-model="data"></button>').triggerHandler('click');		
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { modelBar: 'bar', argFoo: 'foo' });
		// });

		// it('should be triggered with inherited args', function () {
		// 	angularticsProvider.beginMetricBlock({ argFoo: 'foo' }).metric('test');
		// 	compile('<button track-metric="test"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { argFoo: 'foo' });
		// });

		// it('should be triggered with inherited and overriden args', function () {
		// 	angularticsProvider
		// 		.beginMetricBlock({ argFoo: 'foo' })
		// 		.metric('test', { argFoo: 'bar', argBar: 'bar' })
		// 		.endMetricBlock();
		// 	compile('<button track-metric="test"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { argFoo: 'bar', argBar: 'bar' });
		// });

		// it('should be triggered with inherited ng-model', function () {
		// 	angularticsProvider
		// 		.beginMetricBlock(function (model) { return { modelBar: model.bar }})
		// 		.metric('test')
		// 		.endMetricBlock();
		// 	scope.data1 = { bar: 'bar' };
		// 	scope.data2 = { bar: 'foo' }
		// 	compile('<button track-metric="test" ng-model="data1"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { modelBar: 'bar' });
		// 	compile('<button track-metric="test" ng-model="data2"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { modelBar: 'foo' });
		// });

		// it('should be triggered with inherited and overriden ng-model', function () {
		// 	angularticsProvider
		// 		.beginMetricBlock(function (model) { return { modelBar: model.bar, modelFoo: model.foo }})
		// 		.metric('test', { modelFoo: 'bar' })
		// 		.endMetricBlock();
		// 	scope.data = { bar: 'bar', foo: 'foo' };
		// 	compile('<button track-metric="test" ng-model="data"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { modelBar: 'bar', modelFoo: 'bar' });
		// });

		// it('should correctly apply metric block', function () {
		// 	angularticsProvider
		// 		.metric('test-outside-block-1', { bar: 'bar' })
		// 		.beginMetricBlock({ foo: 'foo' })
		// 		.metric('test-inside-block')
		// 		.endMetricBlock()
		// 		.metric('test-outside-block-2', { moe: 'moe' });
		// 	compile('<button track-metric="test-outside-block-1"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test-outside-block-1', { bar: 'bar' });
		// 	compile('<button track-metric="test-inside-block"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test-inside-block', { foo: 'foo' });
		// 	compile('<button track-metric="test-outside-block-2"></button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test-outside-block-2', { moe: 'moe' });
		// });

		// it('should be triggered with literal params', function () {
		// 	angularticsProvider.metric('test');
		// 	compile('<button track-metric="test" track-params="{bar: \'bar\'}">Button</button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { bar: 'bar' });
		// });

		// it('should be triggered with scope-referencing params', function () {
		// 	angularticsProvider.metric('test');
		// 	scope.data = {foo: 'foo'};
		// 	compile('<button track-metric="test" track-params="{foo: data.foo}">Button</button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { foo: 'foo' });
		// });

		// it('should be triggered with args overriden params', function () {
		// 	console.log('---------------------');
		// 	angularticsProvider.metric('test', { foo: 'foo', bar: 'bar' });
		// 	compile('<button track-metric="test" track-params="{foo: \'bar\'}">Button</button>').triggerHandler('click');
		// 	expect(analytics.track).toHaveBeenCalledWith('test', { foo: 'bar', bar: 'bar' });
		// });

	});

		// it('is activated with specified event (hover)', function () {
		// 	var subject = angular.element('<button track-metric="Sample" track-metric-on="hover"></button>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');		
		// 	expect(trackFn).not.toHaveBeenCalledWith('Sample', {});

		// 	subject.triggerHandler('hover');		
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is activated with inferred event for button', function () {
		// 	var subject = angular.element('<button track-metric="Sample"></button>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('hover');
		// 	expect(trackFn).not.toHaveBeenCalledWith('Sample', {});

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is not activated for buttons without metric attribute', function () {
		// 	var subject = angular.element('<button></button>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).not.toHaveBeenCalled();
		// });

		// it('is activated with inferred event for anchor', function () {
		// 	var subject = angular.element('<a href="#" track-metric="Sample"></a>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is not activated for anchors without metric attribute', function () {
		// 	var subject = angular.element('<a href="#"></a>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).not.toHaveBeenCalled();
		// });

		// it('is activated with inferred event for form', function () {
		// 	var subject = angular.element('<form track-metric="Sample"></form>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('submit');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is not activated for forms without metric attribute', function () {
		// 	var subject = angular.element('<form></form>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('submit');
		// 	expect(trackFn).not.toHaveBeenCalled();
		// });

		// it('is activated with inferred event for iframe', function () {
		// 	var subject = angular.element('<iframe track-metric="Sample"></iframe>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('load');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is not activated for iframes without metric attribute', function () {
		// 	var subject = angular.element('<iframe></iframe>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('load');
		// 	expect(trackFn).not.toHaveBeenCalled();
		// });

		// it('is activated with inherited metric', function () {
		// 	var subject = angular.element('<nav track-metric="Sample"><a href="#"></a></nav>');
		// 	$compile(subject)(scope);

		// 	subject.find('a').triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', {});
		// });

		// it('is activated with overriden property', function () {
		// 	var subject = angular.element('<nav track-metric="Sample"><a track-metric="Override" href="#"></a></nav>');
		// 	$compile(subject)(scope);

		// 	subject.find('a').triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Override', {});
		// });

		// it('is activated with specified event as expression', function () {
		// 	scope.metric = 'Dynamic Sample';
		// 	var subject = angular.element('<button track-metric="{{metric}}" track-metric-on="click"></button>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');		
		// 	expect(trackFn).toHaveBeenCalledWith('Dynamic Sample', {});

		// 	scope.metric = 'Another Sample';
		// 	subject.triggerHandler('click');		
		// 	expect(trackFn).toHaveBeenCalledWith('Another Sample', {});
		// });

		// it('is activated with additional args', function () {
		// 	var subject = angular.element('<button track-metric="Sample" track-metric-arg1="arg1" track-metric-arg2="arg2"></button>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', { arg1: 'arg1', arg2: 'arg2' });
		// });

		// it('is activated with inherited additional args', function () {
		// 	var subject = angular.element('<form track-metric-arg1="arg1" track><button track-metric="Sample" track-metric-arg2="arg2"></button></form>');
		// 	$compile(subject)(scope);

		// 	subject.triggerHandler('click');
		// 	expect(trackFn).toHaveBeenCalledWith('Sample', { arg1: 'arg1', arg2: 'arg2' });
		// });

});


	// analytics
		// .metric(['Files Downloaded', 'Files Uploaded', 'Files Deleted'])
		// .property('category', 'Files');

		// analytics
		// .metric(['Sign in', 'Sign up', 'Forgot Password'])
		// .property('category', 'Activity');


// describe('analytics', function () {
//   var _ = angular.noop;

//   /**
//    * Load Google Analytics
//    */
//   var ga;
//   beforeEach(function () {
//     (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
//     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
//     })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

//     ga = spyOn(window, 'ga');
//   });

//   /**
//    * Inject Angular mocks
//    */
//   var $window;
//   beforeEach(inject(function (_$window_, analytics) {
//     $window = _$window_;
//   }));

//   var GA;
//   beforeEach(module('angulartics', function (analyticsProvider) {
//     GA = analyticsProvider.register('ga', $window.ga);
//   }));

//   it('should call native tracker', function () {
//     expect(GA).toEqual(jasmine.any(analytics.AnalyticsProvider));
//   });

//   it('should do things', function () {
//     expect($window.ga).toBeDefined();


//     // implement event tracking as the default (unnamed) tracking method
//     GA.implement(function (tracker, data) {
//       tracker('send', angular.extend({ 'hitType': 'event' }, data));
//     });

//     // additional tracking methods can be added under a unique name (e.g., 'pageview')
//     GA.implement('pageview', function (tracker, data) {
//       data = typeof data === 'string' ? { page: data } : { page: data.path, title: data.title };
//       tracker('send', angular.extend({ 'hitType': 'pageview' }, data));
//     });

//     var analytics = jasmine.createSpyObj('analytics', ['trackers']);
//     // var tracker = 

//     return;

//     // $analytics.trackers().hit({ action: 'Killed monster', category: 'Gameplay', label: 'Skeleton' });

//     /**
//      * Plugin implementation
//      */

//     // Registering a tracker
//     // needs a name and a function returning the vendor api object
//     var GA = $analyticsProvider.register('ga', function () { return window.ga; });

//     // trackerFactory is used by Angulartics to resolve the tracker object
//     // the default behavior is to return the original vendor api object
//     GA.trackerFactory = function (name, api) {
//       return function (command, data) {
//         api((name && name.concat('.') || '') + command, data);
//       };
//     };

//     GA.registerTracker('shop');

//     // all plugins have a default tracking method which accepts the tracking data
//     GA.implement(function (tracker, data) {
//       tracker('send', angular.extend({ 'hitType': 'event' }, data));
//     });

//     // additional methods can be added under a unique name (e.g., 'pageview')
//     GA.implement('pageview', function (tracker, data) {
//       data = typeof data === 'string' && { page: data } || angular.extend({ page: data.path }, data);
//       tracker('send', angular.extend({ 'hitType': 'pageview' }, data));
//     });
//     GA.implement('social', function (tracker, data) {
//       tracker('send', angular.extend({ 'hitType': 'social' }, data)); 
//     });


//     /**
//      * API usage
//      */

//     // syntax
// //    $analytics.trackers('['name', '...']').hit(['eventType'], Object);

//     // examples

//     // track event 'Killed monster' on all registered trackers
//     $analytics.trackers().hit({ action: 'Killed monster', category: 'Gameplay', label: 'Skeleton' });

//     // track pageview on GA only
//     $analytics.trackers('ga').hit('pageview', '/my/sample-page');

//     // track pageview on GA only, using a specific tracker (if multiple trackers configured)
//     $analytics.trackers('ga.tracker2').hit('pageview', '/my/sample-page');

//     // track event 'Download file' on GA and Chartbeat only
//     $analytics.trackers('ga','cb').hit('Download file', { label: 'sdk2013.zip', category: 'SDK downloads' });

//     // enables/disables tracker if arg is specified, or returns enable state otherwise
//     $analytics.trackers('cb').enabled([true|false]);


//     // one call to rule them all using selective params
//     // (based on contribution by https://github.com/hekike)
//     var commonData = { label: 'Null and typeof', url: 'http://kiro.me/blog/typeof_null.html' },
//       gaData = { category: 'Social (Twitter)' },
//       kmData = { network: 'Twitter' };

//     $analytics.trackers().hit('Share article', commonData, { 'ga': gaData, 'km': kmData });


//   });
// });