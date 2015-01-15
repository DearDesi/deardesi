'use strict';

var fsapi       = require('desirae/lib/node-adapters').fsapi
  ;

module.exports.create = function (options) {
  var restful = {}
    ;

  //
  // Required for desirae
  //
  restful.walk = function (req, res, next) {
    if (!(/^GET$/i.test(req.method) || /^GET$/i.test(req.query._method))) {
      next();
      return;
    }

    var opts = {}
      , dirnames = req.query.dir && [req.query.dir] || (req.query.dirs && req.query.dirs.split(/,/g)) || req.body.dirs
      ;

    if (!dirnames || !dirnames.length) {
      res.send({ error: "please specify GET w/ req.query.dir or POST w/ _method=GET&dirs=path/to/thing,..." });
      return;
    }

    if (!dirnames.every(function (dirname) {
      return 'string' === typeof dirname;
    })) {
      res.send({ error: "malformed request: " + JSON.stringify(dirnames) });
      return;
    }

    /*
    if (req.query.excludes) {
      opts.excludes = req.query.excludes.split(',');
    }
    */

    if (req.query.extensions) {
      opts.extensions = req.query.extensions.split(/,/g);
    }

    if ('true' === req.query.dotfiles) {
      opts.dotfiles = true;
    }
    if ('false' === req.query.sha1sum) {
      opts.sha1sum = false;
    }
    if ('true' === req.query.contents) {
      opts.contents = true;
    }

    // TODO opts.contents?
    fsapi.walk.walkDirs(options.blogdir, dirnames, opts).then(function (stats) {
      if (!req.body.dirs && !req.query.dirs) {
        res.send(stats[dirnames[0]]);
      } else {
        res.send(stats);
      }
    });
  };

  restful.getFiles = function (req, res, next) {
    if (!(/^GET$/i.test(req.method) || /^GET$/i.test(req.query._method))) {
      next();
      return;
    }

    var filepaths = req.query.path && [req.query.path] || (req.query.paths && req.query.paths.split(/,/g)) || req.body.paths
      ;

    if (!filepaths || !filepaths.length) {
      res.send({ error: "please specify GET w/ req.query.path or POST _method=GET&paths=path/to/thing,..." });
      return;
    }

    return fsapi.getfs(options.blogdir, filepaths).then(function (files) {
      if (!req.body.paths && !req.query.paths) {
        res.send(files[0]);
      } else {
        res.send(files);
      }
    });
  };

  restful.putFiles = function (req, res, next) {
    if (!(/^POST|PUT$/i.test(req.method) || /^POST|PUT$/i.test(req.query._method))) {
      next();
      return;
    }

    var opts = {}
      , files = req.body.files
      ;

    if (!files || !files.length) {
      res.send({ error: "please specify POST w/ req.body.files" });
      return;
    }

    opts.tmpdir = options.tmpdir;
    return fsapi.putfs(options.blogdir, files, opts).then(function (results) {
      res.send(results);
    });
  };

  restful.copy = function (req, res, next) {
    if (!(/^POST|PUT$/i.test(req.method) || /^POST|PUT$/i.test(req.query._method))) {
      next();
      return;
    }

    var opts = {}
      , files = req.body.files
      ;

    if ('object' !== typeof files || !Object.keys(files).length) {
      res.send({ error: "please specify POST w/ req.body.files" });
      return;
    }

    return fsapi.copyfs(options.blogdir, files, opts).then(function (results) {
      res.send(results);
    });
  };
  //
  // end Desirae API
  //

  return restful;
};
