'use strict';

var PromiseA = require('bluebird')
  , fs = PromiseA.promisifyAll(require('fs'))
  , path = require('path')
  , cli = require('cli')
  ;

cli.parse({
  blogdir: ['d', 'Where your blog is, i.e. ~/path/to/blog', 'string', './']
//, output: ['o', 'name of output directory within ~/path/to/blog', 'string', './compiled']
});

function serve(blogdir) {
  var http = require('http')
    //, https = require('https')
    , app = require('../server').create({ blogdir: blogdir })
    , server
    ;

  server = http.createServer(app).listen(65080, function () {
    console.log("Listening from " + blogdir);
    console.log("Listening on http://local.dear.desi:" + server.address().port);
  });
  //secureServer = https.createServer(app).listen(65043);
}

function build(blogdir) {
  var Desi = require('desirae').Desirae
    , desi = {}
    , env = {}
    ;

  env.working_path = env.blogdir = blogdir;
  Desi.init(desi, env).then(function () {
    env.url = desi.site.base_url + desi.site.base_path.replace(/^\/$/, '');
    env.base_url = desi.site.base_url;
    env.base_path = desi.site.base_path;
    env.compiled_path = 'compiled';
    //env.since = 0;

    Desi.buildAll(desi, env).then(function () {
      Desi.write(desi, env).then(function () {
        console.log('Build Success!');
      });
    });
  });
}

cli.main(function (args, options) {
  var command = args[0]
    , blogdir = options.blog
    ;
  
  if (!blogdir) {
    blogdir = path.resolve('./');
  }

  if (!fs.existsSync(path.join(options.blog, 'site.yml'))) {
    console.error("Usage: deardesi [serve|init|post] -b ~/path/to/blog");
    console.error("(if ~/path/to/blog doesn't yet exist or doesn't have config.yml, site.yml, etc, "
      + "try `deardesi init -b ~/path/to/blog'");
    process.exit(1);
    return;
  }

  if ('init' === command) {
    console.error("`init' not yet implemented");
    process.exit(1);
    return;
  }
  else if ('build' === command) {
    build(blogdir);
    return;
  }
  else if ('post' === command) {
    console.error("`post' not yet implemented");
    process.exit(1);
    return;
  }
  else if ('serve' === command) {
    serve(blogdir);
    return;
  }
  else {
    console.error("Usage: deardesi [serve|init|post] -b ~/path/to/blog");
    return;
  }
});
