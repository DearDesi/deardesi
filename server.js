'use strict';

var path = require('path');

function create(options) {
  var connect     = require('connect')
    , query       = require('connect-query')
    , bodyParser  = require('body-parser')
    , serveStatic = require('serve-static')
    , send        = require('connect-send-json')

    , app         = connect()
    , restful     = require('./desirae-http-api').create(options)
    ;

  app
    .use(send.json())
    .use(query())
    .use(bodyParser.json({ limit: 10 * 1024 * 1024 })) // 10mb
    .use(require('compression')())
    ;

  //
  // Keeping the API *required* by desirae super minimal
  // so that it can be implemented easily in any language
  //
  app
    .use('/api/fs/static', serveStatic(options.blogdir))
    .use('/api/fs/walk', restful.walk)
    .use('/api/fs/files', restful.getFiles)
    .use('/api/fs/files', restful.putFiles)
    .use('/api/fs/copy', restful.copy)
    ;
  // end Desirae API

  if (options.tmpdir) {
    app.use(serveStatic(options.tmpdir));
  }

  // this is used by DearDesi, but not required for desirae
  app
    .use('/api/fs/rootdir', function (req, res) {
      var pathname = path.resolve(options.blogdir)
        ;

      res.send({
        path: pathname
      , name: path.basename(pathname)
      , relativePath: path.dirname(pathname)
      });
      return;
    })
    ;

  app
    // the AngularJS App
    .use(serveStatic(__dirname))
    // TODO change file requests to '/blog'
    //.use(serveStatic(options.blogdir))
    .use('/blog', serveStatic(options.blogdir))
    .use('/compiled_dev', serveStatic(path.join(options.blogdir, '/compiled_dev')))
    .use('/compiled', serveStatic(path.join(options.blogdir, '/compiled')))
    ;

  return app;
}

module.exports = create({ blogdir: path.join(__dirname, 'blog') });
module.exports.create = create;
