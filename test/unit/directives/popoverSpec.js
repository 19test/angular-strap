'use strict';

describe('popover', function () {
  var scope, $sandbox, $compile, $timeout, $httpBackend, $templateCache;

  beforeEach(module('$strap.directives'));

  beforeEach(inject(function ($injector, $rootScope, _$compile_, _$timeout_, _$httpBackend_, _$templateCache_) {
    scope = $rootScope;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $templateCache = _$templateCache_;

    $sandbox = $('<div id="sandbox"></div>').appendTo($('body'));
    scope.content = "World<br />Multiline Content<br />";
    scope.popover = 'Hello <span ng-bind-html-unsafe="content"></span>';

  }));

  afterEach(function() {
    $sandbox.remove();
    scope.$destroy();
  });

  var templates = {
    'default': '<a class="btn" bs-popover="\'partials/popover.html\'" data-title="aTitle" data-placement="left"></a>',
    'unique': '<a class="btn" bs-popover="\'partials/popover.html\'" data-unique="1" data-title="aTitleBis" data-placement="left"></a>',
    'cache': '<script type="text/ng-template" id="cachedPopover.html">' + 'Hello <span ng-bind-html-unsafe="content"></span>' + '</script><a class="btn" bs-popover="\'cachedPopover.html\'" data-unique="1" data-title="aTitleBis" data-placement="left"></a>'
  };

  function compileDirective(template, expectCache) {
    template = template ? templates[template] : templates['default'];
    template = $(template).appendTo($sandbox);
    if(!expectCache) { $httpBackend.expectGET('partials/popover.html').respond(scope.popover); }
    var elm = $compile(template)(scope);
    if(!expectCache) { $httpBackend.flush(); }
    else { scope.$digest(); } // evaluate $evalAsync queue used by $q
    return elm;
  }

  // Tests

  it('should fetch the partial with $http and build the popover', function () {
    var elm = compileDirective();
    expect(elm.data('popover')).toBeDefined();
    expect(typeof elm.data('popover').options.content === 'function').toBe(true);
    expect(elm.data('popover').options.content()).toBe(scope.popover);
  });

  it('should fetch the partial from cache and build the popover', function () {
    var elm = compileDirective('cache', true);
    expect(scope.$$asyncQueue.length).toBe(0);
    // @fixme
    // expect(elm.data('popover')).toBeDefined();
    // expect(typeof elm.data('popover').options.content === 'function').toBe(true);
    // expect(elm.data('popover').options.content()).toBe(scope.popover);
  });

  it('should correctly call $.fn.popover', function () {
    var spy = spyOn($.fn, 'popover').andCallThrough();
    var elm = compileDirective();
    expect(spy).toHaveBeenCalled();
  });

  it('should define a correct title', function() {
    var elm = compileDirective();
    elm.popover('show'); $timeout.flush();
    expect(elm.data('popover').tip().find('.popover-title').text()).toBe('aTitle');
  });

  it('should resolve scope variables in the external partial', function() {
    var elm = compileDirective();
    elm.popover('show'); $timeout.flush();
    expect(elm.data('popover').tip().find('.popover-content').text()).toBe('Hello ' + scope.content.replace(/<br \/>/g, ''));
  });

  it('should define the popover reference on the tip', function() {
    var elm = compileDirective();
    elm.trigger('click');
    expect(elm.data('popover').tip().data('popover')).toBeDefined();
    expect(elm.data('popover')).toBe(elm.data('popover').tip().data('popover'));
  });

  it('should show/hide the popover on click', function() {
    var elm = compileDirective();
    elm.trigger('click');
    expect(elm.data('popover').tip().hasClass('in')).toBe(true);
    elm.trigger('click');
    expect(elm.data('popover').tip().hasClass('in')).toBe(false);
  });

  it('should support data-unique attribute', function() {
    var elm = compileDirective(), elm2 = compileDirective('unique', true);
    elm.trigger('click');
    expect(elm.data('popover').tip().hasClass('in')).toBe(true);
    elm2.trigger('click');
    expect(elm.data('popover').tip().hasClass('in')).toBe(false);
  });

});
