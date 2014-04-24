describe('Module: angulartics', function() {
  'use strict';

  beforeEach(module('angulartics'));

  it('should be configurable', function() {
    module(function(_$analyticsProvider_) {
      _$analyticsProvider_.virtualPageviews(false);
    });
    inject(function(_$analytics_) {
      expect(_$analytics_.settings.pageTracking.autoTrackVirtualPages).toBe(false);
    });
  });

  describe('Provider: analytics', function() {
    var analytics,
      rootScope,
      location;
    beforeEach(inject(function(_$analytics_, _$rootScope_, _$location_) {
      analytics = _$analytics_;
      location = _$location_;
      rootScope = _$rootScope_;

      spyOn(analytics, 'pageTrack');
    }));

    describe('initialize', function() {
      it('should tracking pages by default', function() {
        expect(analytics.settings.pageTracking.autoTrackVirtualPages).toBe(true);
      });
    });

    it('should tracking pages on location change', function() {
      location.path('/abc');
      rootScope.$emit('$locationChangeSuccess');
      expect(analytics.pageTrack).toHaveBeenCalledWith('/abc');
    });

  });

  describe('Directive: analyticsOn', function () {
    var analytics,
      elem,
      scope;

    function compileElem() {
      inject(function ($compile) {
        $compile(elem)(scope);
      });
      scope.$digest();
    }

    beforeEach(inject(function(_$analytics_, _$rootScope_) {
      analytics = _$analytics_;
      scope = _$rootScope_.$new();
    }));

    it('should not send on and event fields to the eventTrack function', function () {
      elem = angular.element('<div>').attr({
        'analytics-on': 'click',
        'analytics-event': 'InitiateSearch',
        'analytics-category': 'Search'
      });
      spyOn(analytics, 'eventTrack');
      expect(analytics.eventTrack).not.toHaveBeenCalled();

      compileElem();
      elem.triggerHandler('click');
      expect(analytics.eventTrack).toHaveBeenCalledWith('InitiateSearch', {category : 'Search'});
    });
  });

});
