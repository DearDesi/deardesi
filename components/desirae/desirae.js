angular.module('myApp.services', []).
  factory('Desirae', ['$q', '$http', function ($q, $http) {
    var Desi        = window.Desi || require('./deardesi').Desi
      , desi        = {/*TODO api_base: '/api'*/}
      , fsapi       = window.fsapi
      ;

    function getBlogdir () {
      return $http.get('/api/fs/rootdir').then(function (resp) {
        desi.blogdir = resp.data;
        return resp.data;
      });
    }
    getBlogdir();

    return {
      reset: function () {
        desi = {};
        return getBlogdir();
      }
    , toDesiDate: Desi.toLocaleDate
    , meta: function () {
        var d = $q.defer()
          ;

        if (desi.meta) {
          d.resolve(desi);
          return d.promise;
        }

        Desi.init(desi).then(function () {
          d.resolve(desi);
        });

        return d.promise;
      }
    , build: function (env) {
        var d = $q.defer()
          ;

        if (desi.built) {
          d.resolve(desi);
          return d.promise;
        }

        Desi.buildAll(desi, env).then(function () {
          d.resolve(desi);
        });

        return d.promise;
      }
    , write: function (env) {
        var d = $q.defer()
          ;

        if (desi.written) {
          d.resolve(desi);
          return d.promise;
        }

        Desi.write(desi, env).then(function () {
          d.resolve(desi);
        });

        return d.promise;
      }
    , putFiles: function (files) {
        return $q.when(fsapi.putFiles(files));
      }
    };
  }]
);
