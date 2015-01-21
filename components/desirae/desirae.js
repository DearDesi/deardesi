angular.module('myApp.services', []).
  factory('Desirae', ['$q', '$http', function ($q, $http) {
    var Desi        = window.Desirae || require('./deardesi').Desirae
      , desi        = {/*TODO api_base: '/api'*/}
      ;

    // TODO what version of ruhoh are ruhoh-twitter and ruhoh-boostrap-2
    Desi.registerDataMapper('ruhoh', window.DesiraeDatamapRuhoh || require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);
    Desi.registerDataMapper('ruhoh@2.6', window.DesiraeDatamapRuhoh || require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);

    function gdrive2host(str) {
      // https://drive.google.com/folderview?id=0ByLnfhJOd1-baUh1Wms0US16QkE&usp=sharing
      // https://googledrive.com/host/0ByLnfhJOd1-baUh1Wms0US16QkE

      var m
        ;

      str = str || '';
      m = str.match(/(?=drive.*google|google.*drive).*folderview.*id=([^&]+)/i);
      console.log(m);
      if (m && m[1]) {
        return 'https://googledrive.com/host/' + m[1];
      }
    }

    function dropbox2host(str) {
      if (!/dropbox/.test(str)) {
        return;
      }
      // https://dl.dropboxusercontent.com/u/146173/index.html

      // https://www.dropbox.com/s/3n20djtrs2p0j9k
      // https://www.dropbox.com/s/3n20djtrs2p0j9k/index.html?dl=0
      // https://dl.dropboxusercontent.com/s/3n20djtrs2p0j9k/index.html

      str = str || '';
      if (!str.match(/dropboxusercontent\.com\/u\/([^\/]+)\/index.html/)) {
        window.alert("Sorry, Desi can't use that type of dropbox link."
          + "\n\n1. Open the Dropbox folder on your computer"
          + "\n   (The DropBox app must be installed)"
          + "\n\n2. Open the Public folder"
          + "\n   (if you don't have a Public folder, your account doesn't support hosting websites and you're simply out of luck)"
          + "\n\n2. Create a new file called index.html"
          + "\n\n3. Right-click on index.html"
          + "\n\n4. Select 'Copy Public Link'"
          + "\n\n5. Paste that link as the URL for Desi"
          );
        return;
      }

      return str.replace(/\/index\.html$/, '');
    }

    function splitUrl(str) {
      var m
        ;

      str = str || '';
      m = str.match(/(https?:\/\/)?([^\.\/?#]+\.[^\/?#]+)(\/[^#?]+)?/i);
      console.log(m);
      if (!m || !m[2]) {
        return;
      }
      return {
        baseUrl: (m[1] || 'http://') + m[2]
      , basePath: (m[3] && m[3].replace(/\/$/, '')) || '/'
      };
    }

    function getBlogdir () {
      return $http.get('/api/fs/rootdir').then(function (resp) {
        desi.blogdir = resp.data;
        return resp.data;
      });
    }
    getBlogdir();

    return {
      splitUrl: splitUrl
    , gdrive2host: gdrive2host
    , dropbox2host: dropbox2host
    , reset: function () {
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
        return $q.when(Desi.fsapi.putFiles(files));
      }
    };
  }]
);
