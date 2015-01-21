'use strict';

angular.module('myApp.site', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/site', {
    templateUrl: 'views/site/site.html',
    controller: 'SiteCtrl as Site'
  });
}])

.controller('SiteCtrl', ['$scope', '$location', 'Desirae', function ($scope, $location, Desirae) {
  var scope = this
    ;

  function init() {
    console.log('desi loading');
    Desirae.meta().then(function (desi) {
      scope.blogdir = desi.blogdir.path.replace(/^\/(Users|home)\/[^\/]+\//, '~/');
      scope.site = desi.site;

      var parts = Desirae.splitUrl(scope.site.base_url + (scope.site.base_path || '/'))
        ;

      if (parts) {
        scope.base_url = scope.site.base_url;
        scope.base_path = scope.site.base_path;
        scope.url = scope.base_url + scope.site.base_path;
      }

      scope.onChange();
    }).catch(function (e) {
      window.alert("An Error Occured. Most errors that occur in the init phase are parse errors in the config files or permissions errors on files or directories, but check the error console for details.");
      console.error(e);
      throw e;
    });
  }

  scope.onChange = function () {
    console.log('new url [0]', scope.url);
    var parts = Desirae.splitUrl(scope.url)
      , url
      ;

    if (!parts) {
      scope.base_url = '';
      scope.base_path = '';
      return;
    }

    scope.base_url = parts.baseUrl;
    scope.base_path = parts.basePath;

    scope.dropboxIndex = '';

    url = Desirae.gdrive2host(scope.url)
      ;

    if (!url && Desirae.dropbox2host(scope.url)) {

      url = Desirae.dropbox2host(scope.url);
      scope.dropboxIndex = '/index.html';
    }

    console.log('new url [1]', url);

    if (url) {
      parts = Desirae.splitUrl(url);
      scope.base_url = parts.baseUrl;
      scope.base_path = parts.basePath;
    }

    //scope.url = scope.base_url + scope.base_path;
  };

  scope.upsert = function () {
    var files = []
      ;

    if (!scope.base_url || !scope.base_path) {
      window.alert("URL: " + (scope.url) + "\nSomething about your URL doesn't look right.");
      return;
    }
    // Just in case of http://blog.com/me/ + /blog vs http://blog.com + /me/blog
    // don't change it unless it's truly different.
    if ((scope.base_url + scope.base_path) !== (scope.site.base_url + scope.site.base_path)) {
      scope.site.base_url = scope.base_url;
      scope.site.base_path = scope.base_path;
    }
    files.push({ path: 'site.yml', contents: scope.site });

    console.log(files);
    Desirae.putFiles(files).then(function (results) {
      console.log('TODO check for error');
      console.log(results);
      $location.path('/post');
    }).catch(function (e) {
      console.error(scope.site);
      console.error(e);
      window.alert("Error Nation! :/");
      throw e;
    });
  };

  init();
}]);
