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
