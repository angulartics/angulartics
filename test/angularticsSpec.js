describe('window.angulartics', function() {
  beforeEach(function() {
    jasmine.clock().install();
  });
  afterEach(function() {
    delete window.angularticsTestVendor;
    jasmine.clock().uninstall();
  });

  it('should manage vendor wait count', function() {
    spy = jasmine.createSpy('vendorCallback');
    spyWhenLoaded = jasmine.createSpy('vendorCallbackWhenLoaded');
    angulartics.waitForVendorApi('angularticsTestVendor', 1, 'loaded', spy);
    angulartics.waitForVendorApi('angularticsTestVendor', 1, spyWhenLoaded);
    expect(window.angulartics.waitForVendorCount).toEqual(2);

    jasmine.clock().tick(1);
    expect(window.angulartics.waitForVendorCount).toEqual(2);

    window.angularticsTestVendor = {};
    jasmine.clock().tick(1);
    expect(angulartics.waitForVendorCount).toEqual(1);

    window.angularticsTestVendor.loaded = true;
    jasmine.clock().tick(1);
    expect(window.angulartics.waitForVendorCount).toEqual(0);
    expect(spyWhenLoaded).toHaveBeenCalledWith(window.angularticsTestVendor);
  });

});

describe('Module: angulartics', function() {
  'use strict';

  beforeEach(module('angulartics'));

  describe('Configuration', function() {
    it('should configure virtualPageviews', function() {
      module(function(_$analyticsProvider_) {
        _$analyticsProvider_.virtualPageviews(false);
      });
      inject(function(_$analytics_) {
        expect(_$analytics_.settings.pageTracking.autoTrackVirtualPages).toBe(false);
      });
    });

    it('should be configured to use the <base> element', function() {
      var baseUrl = 'http://my/path';

      module(function($provide, _$analyticsProvider_) {
        var baseEl = document.createElement('base');
        baseEl.setAttribute('href', baseUrl);
        document.getElementsByTagName('body')[0].appendChild(baseEl);
        _$analyticsProvider_.withBase(true);
      });
      inject(function(_$analytics_) {
        expect(_$analytics_.settings.pageTracking.basePath).toBe(baseUrl);
      });

    });

    it ('should configure excluded routes', function() {
      module(function(_$analyticsProvider_) {
        _$analyticsProvider_.excludeRoutes(['/abc/def']);
      });
      inject(function(_$analytics_) {
        expect(_$analytics_.settings.pageTracking.excludedRoutes).toEqual(['/abc/def']);
      });
    });

    describe('Query string filtering',function(){
      it('should configure Whitelisted keys', function(){
        var keyArr = ['foo',/utm_.*/];
        module(function(_$analyticsProvider_) {
          _$analyticsProvider_.queryKeysWhitelist(keyArr);
        });
        inject(function(_$analytics_) {
          expect(_$analytics_.settings.pageTracking.queryKeysWhitelisted).toEqual(keyArr);
        });
      });
      it('should configure Blacklisted keys', function(){
        var keyArr = ['email',/cc_.*/];
        module(function(_$analyticsProvider_) {
          _$analyticsProvider_.queryKeysBlacklist(keyArr);
        });
        inject(function(_$analytics_) {
          expect(_$analytics_.settings.pageTracking.queryKeysBlacklisted).toEqual(keyArr);
        });
      });
    });

    describe('URL segment filtering',function(){
      it('should configure URL segment filters', function(){
        var filtersArr = ['foo',/utm_.*/];
        module(function(_$analyticsProvider_) {
          _$analyticsProvider_.filterUrlSegments(filtersArr);
        });
        inject(function(_$analytics_) {
          expect(_$analytics_.settings.pageTracking.filterUrlSegments).toEqual(filtersArr);
        });
      });
    });
  });

  describe('Provider: analytics', function() {

    describe('initialize', function() {
      it('should track pages by default', function() {
        inject(function(_$analytics_) {
          expect(_$analytics_.settings.pageTracking.autoTrackVirtualPages).toBe(true);
        });
      });
    });

    describe('ngRoute support', function() {
      var analytics,
          rootScope,
          location;
      beforeEach(module('ngRoute'));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
      }));

      it('should track pages on route change', function() {
        location.path('/abc');
        rootScope.$emit('$routeChangeSuccess');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/abc', location);
      });
    });

    describe('ui-router support', function() {
      var analytics,
          rootScope,
          location;
      beforeEach(module('ui.router'));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
      }));

      it('should track pages on route change', function() {
        location.path('/abc');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/abc', location);
      });
    });

    describe('ui-router@>=1.0.0 support', function() {
      var analytics,
          rootScope,
          location,
          registeredHook,
          $transition$;
      beforeEach(module('ui.router', function($provide) {
        // mock $transitions service, that's coming in UI Router 1.0
        $provide.service('$transitions', function() {
          this.onSuccess = function(matchCriteria, callback) {
            registeredHook = callback;
          };
        });

      }));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
        $transition$ = jasmine.createSpyObj('$transition', ['options']);
        $transition$.options.and.returnValue({
          notify: true
        });
      }));

      it('should track pages if $transitions are being used instead of state events', function() {
        location.path('/abc');

        registeredHook($transition$);

        expect(analytics.pageTrack).toHaveBeenCalledWith('/abc', location);
        expect($transition$.options).toHaveBeenCalled();
      });

      it('should only track pages on transitions which would have otherwise triggered $stateChangeSuccess', function() {
        location.path('/abc');
        $transition$.options.and.returnValue({
          notify: false
        });

        registeredHook($transition$);

        expect(analytics.pageTrack).not.toHaveBeenCalled();
        expect($transition$.options).toHaveBeenCalled();
      });

      it('should not trigger twice, even if state events are manually re-enabled', function() {
        location.path('/abc');

        registeredHook($transition$);
        rootScope.$emit('$stateChangeSuccess');

        expect(analytics.pageTrack.calls.count()).toEqual(1);
        expect($transition$.options).toHaveBeenCalled();
      });
    });

    describe('excludedRoutes', function() {
      var analytics,
          rootScope,
          location;
      beforeEach(module('ui.router'));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
      }));

      it('should have empty excludedRoutes by default', function () {
        expect(analytics.settings.pageTracking.excludedRoutes.length).toBe(0);
      });

      it('should trigger page track if excludeRoutes is empty', function() {
        analytics.settings.pageTracking.excludedRoutes = [];
        location.path('/abc');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/abc', location);
      });

      it('should trigger page track if excludeRoutes do not match current route', function() {
        analytics.settings.pageTracking.excludedRoutes = ['/def'];
        location.path('/abc');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/abc', location);
      });

      it ('should not trigger page track if current route is excluded', function() {
        analytics.settings.pageTracking.excludedRoutes = ['/abc'];
        location.path('/abc');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).not.toHaveBeenCalled();
      });

      it ('should not allow for multiple route exclusions to be specified', function() {
        analytics.settings.pageTracking.excludedRoutes = ['/def','/abc'];
        // Ignore excluded route
        location.path('/abc');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).not.toHaveBeenCalled();
        // Ignore excluded route
        location.path('/def');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).not.toHaveBeenCalled();
        // Track non-excluded route
        location.path('/ghi');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/ghi', location);
      });

      it ('should allow specifying excluded routes as regular expressions', function() {
        analytics.settings.pageTracking.excludedRoutes = [/\/sections\/\d+\/pages\/\d+/];
        // Ignore excluded route
        location.path('/sections/123/pages/456');
        rootScope.$emit('$stateChangeSuccess');
        expect(analytics.pageTrack).not.toHaveBeenCalled();
      });

    });

    describe('Query string filtering', function(){
        var analytics,
            rootScope,
            location;
        beforeEach(module('ui.router'));
        beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
          analytics = _$analytics_;
          location = _$location_;
          rootScope = _$rootScope_;

          spyOn(analytics, 'pageTrack');
        }));

        var query = {
          email: 'j.doe@example.com',
          foo: 'bar',
          utm_campaign: '42'
        };

        function setLocationAndRootScopeEmit(location,rootScope) {
          location.path('/abc');
          var orderedKeys = [];
          for (var k in query){ orderedKeys.push(k); }
          orderedKeys.sort();
          for (var i = 0; i < orderedKeys.length; i++) {
            location.search(orderedKeys[i], query[orderedKeys[i]]);
          }
          rootScope.$emit('$stateChangeSuccess');
        }

        describe('Whitelisted', function(){
          it('should be empty by default', function () {
            expect(analytics.settings.pageTracking.queryKeysWhitelisted.length).toBe(0);
          });

          it('should remove all Non-matched key/value pairs', function () {
            analytics.settings.pageTracking.queryKeysWhitelisted = [/^utm_.*/];
            setLocationAndRootScopeEmit(location,rootScope);
            expect(analytics.pageTrack).toHaveBeenCalledWith('/abc?utm_campaign=42', location);
          });
        }); //End: Whitelisted

        describe('Blacklisted', function(){
          it('should be empty by default', function () {
            expect(analytics.settings.pageTracking.queryKeysBlacklisted.length).toBe(0);
          });
          it('should remove all Matched key/value pairs', function () {
            analytics.settings.pageTracking.queryKeysBlacklisted = ['email'];
            setLocationAndRootScopeEmit(location,rootScope);
            expect(analytics.pageTrack).toHaveBeenCalledWith('/abc?foo=bar&utm_campaign=42', location);
          });
        }); //End: Blacklisted

        it('Blacklisted supercedes Whitelisted', function () {
          analytics.settings.pageTracking.queryKeysBlacklisted = ['email'];
          analytics.settings.pageTracking.queryKeysWhitelisted = ['email', /^utm_.*/];
          setLocationAndRootScopeEmit(location,rootScope);
          expect(analytics.pageTrack).toHaveBeenCalledWith('/abc?utm_campaign=42', location);
        });
    });

    describe('URL segment filtering', function(){
      var analytics,
        rootScope,
        location;
      beforeEach(module('ui.router'));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
      }));

      function setLocationAndRootScopeEmit(location,rootScope) {
        location.path('/abc/123/xyz');
        rootScope.$emit('$stateChangeSuccess');
      }

      it('should be empty by default', function () {
        expect(analytics.settings.pageTracking.filterUrlSegments.length).toBe(0);
      });

      it('should remove all Matched segments', function () {
        analytics.settings.pageTracking.filterUrlSegments = ['abc', /\d+/];
        setLocationAndRootScopeEmit(location,rootScope);
        expect(analytics.pageTrack).toHaveBeenCalledWith('/FILTERED/FILTERED/xyz', location);
      });

      describe('with basePath', function() {
        beforeEach(function() {
          analytics.settings.pageTracking.basePath = 'foo.com';
        });

        it('should be empty by default', function () {
          expect(analytics.settings.pageTracking.filterUrlSegments.length).toBe(0);
        });

        it('should remove all Matched segments', function () {
          analytics.settings.pageTracking.filterUrlSegments = [/^foo*$/, 'abc', /\d+/];
          setLocationAndRootScopeEmit(location,rootScope);
          expect(analytics.pageTrack).toHaveBeenCalledWith('foo.com/FILTERED/FILTERED/xyz', location);
        });
      });
    });

    describe('clearIds', function(){
      var analytics,
        rootScope,
        location;

      function setLocationAndRootScopeEmit(location,rootScope, url) {
        location.url(url);
        rootScope.$emit('$stateChangeSuccess');
      }

      beforeEach(module('ui.router'));
      beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
        analytics = _$analytics_;
        location = _$location_;
        rootScope = _$rootScope_;

        spyOn(analytics, 'pageTrack');
      }));

      it('should not clear ids by default', function () {
        expect(analytics.settings.pageTracking.clearIds).toBe(false);
      });

      it('should not change url if clearIds is false', function () {
        analytics.settings.pageTracking.clearIds = false;
        setLocationAndRootScopeEmit(location,rootScope, '/sections/01234567-9ABC-DEF0-1234-56789ABCDEF0/pages/456');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/sections/01234567-9ABC-DEF0-1234-56789ABCDEF0/pages/456', location);
      });

      it('should remove ids and uuids from url if clearIds is true', function () {
        analytics.settings.pageTracking.clearIds = true;
        setLocationAndRootScopeEmit(location,rootScope, '/0sections0/01234567-9ABC-DEF0-1234-56789ABCDEF0/pages?param=456');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/0sections0/pages?param=456', location);
      });

      it('should remove ids using custom regex if idsRegExp is set', function () {
        analytics.settings.pageTracking.clearIds  = true;
        analytics.settings.pageTracking.idsRegExp  = /^[a-z]\d+$/;
        setLocationAndRootScopeEmit(location,rootScope, '/0sections0/a01/pages/page/2/summary?param=456');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/0sections0/pages/page/2/summary?param=456', location);
      });

      it('should remove query params if clearQueryParams is set', function () {
        analytics.settings.pageTracking.clearQueryParams = true;
        setLocationAndRootScopeEmit(location,rootScope, '/0sections0/a01/pages/page/2/summary?param=456');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/0sections0/a01/pages/page/2/summary', location);
      });

      it('should remove hash if clearHash is set', function () {
        analytics.settings.pageTracking.clearHash  = true;
        setLocationAndRootScopeEmit(location,rootScope, '/0sections0/a01/pages/page/2/summary#authCode=123');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/0sections0/a01/pages/page/2/summary', location);
      });

      it('should remove ids and query params if clearQueryParams and clearIds are set', function () {
        analytics.settings.pageTracking.clearQueryParams = true;
        analytics.settings.pageTracking.clearIds = true;
        setLocationAndRootScopeEmit(location,rootScope, '/0sections0/01234567-9ABC-DEF0-1234-56789ABCDEF0/pages?param=456');
        expect(analytics.pageTrack).toHaveBeenCalledWith('/0sections0/pages', location);
      });
    });
  });

  describe('$analyticsProvider', function() {

    describe('registration', function() {
      var expectedHandler = [
        'pageTrack',
        'eventTrack',
        'exceptionTrack',
        'setUsername',
        'setUserProperties',
        'setUserPropertiesOnce',
        'setSuperProperties',
        'setSuperPropertiesOnce',
        'incrementProperty',
        'userTimings'
      ];
      var capitalize = function(input) {
        return input.replace(/^./, function(match) {
          return match.toUpperCase();
        });
      };

      var $analytics, $analyticsProvider;
      beforeEach(function() {
        module(function(_$analyticsProvider_) {
          $analyticsProvider = _$analyticsProvider_;
        });
        inject(function(_$analytics_) {
          $analytics = _$analytics_;
        });
      });
      angular.forEach(expectedHandler, function(handlerName) {
        it('should install a register function for "' + handlerName + '" on $analyticsProvider', function() {
          var fn = $analyticsProvider['register' + capitalize(handlerName)];
          expect(fn).toBeDefined();
          expect(typeof fn).toEqual('function');
        });
        it('should expose a handler "' + handlerName + '" on $analytics', function() {
          var fn = $analytics[handlerName];
          expect(fn).toBeDefined();
          expect(typeof fn).toEqual('function');
        });
      });
    });
  });

  describe('$analytics', function() {

    describe('registering hooks', function() {
      var $analytics, $analyticsProvider, eventTrackSpy, someService;
      beforeEach(function() {
        someService = {
          makeRequest: jasmine.createSpy()
        };
        module(function(_$analyticsProvider_, $provide) {
          $analyticsProvider = _$analyticsProvider_;
          $provide.value('someService', someService);
        });

        inject(function(_$analytics_) {
          $analytics = _$analytics_;
        });
      });
      it('should provide a way to access services within tracking', function() {
        $analyticsProvider.registerEventTrack(function(action, properties) {
          this.$inject(function(someService) {
            someService.makeRequest('toBeAwesome');
          });
        });
        $analytics.eventTrack('foo');
        expect(someService.makeRequest).toHaveBeenCalledWith('toBeAwesome');
      });
    });

    describe('promise-based completion', function() {
      var $rootScope, $analyticsProvider, $analytics;


      beforeEach(module(function(_$analyticsProvider_, $provide) {
          $analyticsProvider = _$analyticsProvider_;
        }));

      beforeEach(inject(function(_$rootScope_, _$analytics_) {
        $rootScope = _$rootScope_;
        $analytics = _$analytics_;
      }));

      it('waits until all handlers that have callbacks return', function() {
        var calledBack = jasmine.createSpy();
        var someService = {}, anotherService = {};
        anotherService.makeRequest = jasmine.createSpy();
        someService.makeRequest = function(event, callback) {
          callback(event);
        };

        $analyticsProvider.registerEventTrack(function(cb, action, properties) {
          someService.makeRequest('meow', cb);
        }, {async: true});

        $analyticsProvider.registerEventTrack(function(action, properties) {
          anotherService.makeRequest(action);
        });

        $analytics.eventTrack('foo').then(calledBack);
        $rootScope.$digest();
        expect(anotherService.makeRequest).toHaveBeenCalledWith('foo');
        expect(calledBack).toHaveBeenCalledWith(jasmine.any(Array));
      });
    });

    describe('buffering', function() {
      var $analytics, $analyticsProvider, eventTrackSpy;
      beforeEach(function() {
        module(function(_$analyticsProvider_) {
          $analyticsProvider = _$analyticsProvider_;
          $analyticsProvider.settings.bufferFlushDelay = 0;
        });
        inject(function(_$analytics_) {
          $analytics = _$analytics_;
        });
      });

      beforeEach(function() {
        eventTrackSpy = jasmine.createSpy('eventTrackSpy');
      });

      it('should buffer events if waiting on a vendor', function() {
        angulartics.waitForVendorCount++; // Mock that we're waiting for a vendor api
        $analytics.eventTrack('foo'); // These events should be buffered
        $analytics.eventTrack('bar'); // This event should be buffered

        $analyticsProvider.registerEventTrack(eventTrackSpy); // This should immediately flush
        expect(eventTrackSpy.calls.count()).toEqual(2);
        expect(eventTrackSpy.calls.argsFor(0)).toEqual(['foo']);
        expect(eventTrackSpy.calls.argsFor(1)).toEqual(['bar']);
      });

      it('should not buffer events if not waiting on any vendors', function() {
        angulartics.waitForVendorCount = 0; // Mock that we're waiting for a vendor api
        $analytics.eventTrack('foo'); // These events should be buffered
        $analyticsProvider.registerEventTrack(eventTrackSpy); // This should immediately flush
        expect(eventTrackSpy).not.toHaveBeenCalled();
      });

      it('should continue to buffer events until all vendors are resolved', function() {
        angulartics.waitForVendorCount = 2; // Mock that we're waiting for a vendor api
        $analytics.eventTrack('foo'); // These events should be buffered

        $analyticsProvider.registerEventTrack(eventTrackSpy); // This should immediately flush
        expect(eventTrackSpy).toHaveBeenCalledWith('foo');

        $analytics.eventTrack('bar');
        expect(eventTrackSpy.calls.count()).toEqual(2);
        expect(eventTrackSpy.calls.argsFor(1)).toEqual(['bar']);

        var secondVendor = jasmine.createSpy('secondVendor');
        $analyticsProvider.registerEventTrack(secondVendor); // This should immediately flush
        expect(secondVendor.calls.count()).toEqual(2);
        expect(secondVendor.calls.argsFor(0)).toEqual(['foo']);
        expect(secondVendor.calls.argsFor(1)).toEqual(['bar']);

      });
    });
  });

  describe('Directive: analyticsOn', function() {
    var analytics,
        elem,
        scope;

    function compileElem() {
      inject(function($compile) {
        $compile(elem)(scope);
      });
      scope.$digest();
    }

    beforeEach(inject(function(_$analytics_, _$rootScope_) {
      analytics = _$analytics_;
      scope = _$rootScope_.$new();
    }));

    it('should not send on and event fields to the eventTrack function', function() {
      elem = angular.element('<div>').attr({
        'analytics-on': 'click',
        'analytics-event': 'InitiateSearch',
        'analytics-category': 'Search'
      });
      spyOn(analytics, 'eventTrack');
      expect(analytics.eventTrack).not.toHaveBeenCalled();

      compileElem();
      elem.triggerHandler('click');
      expect(analytics.eventTrack).toHaveBeenCalledWith('InitiateSearch', {category: 'Search', eventType: 'click'});
    });
  });

});
