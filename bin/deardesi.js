#!/usr/bin/env node
'use strict';

var PromiseA = require('bluebird')
  , fs = PromiseA.promisifyAll(require('fs'))
  , path = require('path')
  , cli = require('cli')
  , UUID = require('node-uuid')
  , Desi
  ;

cli.parse({
  blogdir: ['d', 'Where your blog is, i.e. ~/path/to/blog', 'string', './']
//, output: ['o', 'name of output directory within ~/path/to/blog', 'string', './compiled']
});

function init() {
  Desi = require('desirae').Desirae;

  Desi.registerDataMapper('ruhoh', require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);
  Desi.registerDataMapper('ruhoh@2.6', require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);
}

function serve(blogdir) {
  var http = require('http')
    //, https = require('https')
    , app = require('../server').create({ blogdir: blogdir })
    , server
    ;

  server = http.createServer(app).listen(65080, function () {
    console.info("Listening from " + blogdir);
    console.info("Listening on http://local.dear.desi:" + server.address().port);
  });
  //secureServer = https.createServer(app).listen(65043);
}

function build(blogdir) {
  var desi = {}
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
        console.info('Built and saved to ' + path.join(env.working_path, env.compiled_path));
      });
    });
  });
}

function createPost(originalDir, blogdir, title, extra) {
  if (!title) {
    console.error("Usage desi post \"My First Post\"");
    console.error("(you didn't specify a title)");
    process.exit(1);
  }
  if (extra) {
    console.error("Usage desi post \"My First Post\"");
    console.error("(too many arguments - maybe you didn't put your title in quotes?)");
    process.exit(1);
  }

  var env = {}
    , post = {}
    , slug
    , filepath
    , displaypath
    ;

  env.working_path = env.blogdir = blogdir;

  Desi._initFileAdapter(env).then(function () {
  /*
  Desi.init(desi, env).then(function () {
    env.url = desi.site.base_url + desi.site.base_path.replace(/^\/$/, '');
    env.base_url = desi.site.base_url;
    env.base_path = desi.site.base_path;
    env.compiled_path = 'compiled';
    //env.since = 0;
  */

    // TODO move this logic to desirae
    post.title = title;
    post.description = "";
    post.date = Desi.toLocaleDate(new Date());
    // TODO use site.permalink or collection.permalink or something like that

    slug = post.title.toLowerCase()
      .replace(/["']/g, '')
      .replace(/\W/g, '-')
      .replace(/^-+/g, '')
      .replace(/-+$/g, '')
      .replace(/--/g, '-')
      ;
   
    // TODO as per config
    post.permalink = path.join('/', 'articles', slug + '.html');
    post.uuid = UUID.v4();
    // TODO as per config for default collection and default format (jade, md, etc)
    filepath = path.join(blogdir, (/*config.collection ||*/ 'posts'), slug + '.md');
    displaypath = path.join(originalDir, 'posts', slug + '.md').replace(/^\/(Users|home)\/[^\/]+\//, '~/').replace(/ /g, '\\ ');

    ['updated', 'theme', 'layout', 'swatch'].forEach(function (key) {
      if (!post[key]) {
        delete post[key];
      }
    });

    return Desi.fsapi.putFiles([{
      path: filepath
    , contents: 
          '---\n'
        + Desi.YAML.stringify(post).trim()
        + '\n'
        + '---\n'
        + '\n'
        + '\n'
    }], { overwrite: false }).then(function (r) {
      var err
        ;

      if (r.error || r.errors.length) {
        err = r.error || r.errors[0];
        if (/exists/i.test(err.message)) {
          console.error('');
          console.error("Looks like that post already exists. Try a different name?");
          console.error('');
          console.error('');
        } else {
          throw err;
        }

        return;
      }

      console.log('');
      console.log(displaypath);
      console.log('');
      console.log('vim ' + displaypath);
      console.log('(or emacs ' + displaypath + ', if you swing that way)');
      console.log('');
      console.log('');
    });
  /*
  });
  */
  });
}


cli.main(function (args, options) {
  init();

  var command = args[0]
    , blogdir = options.blogdir
    , originalDir = blogdir
    ;
  
  if (!blogdir) {
    blogdir = path.resolve('./');
    originalDir = './';
  }

  if (!fs.existsSync(path.join(options.blogdir, 'site.yml'))) {
    console.error("Usage: desi [serve|init|post] -d ~/path/to/blog");
    console.error("(if ~/path/to/blog doesn't yet exist or doesn't have config.yml, site.yml, etc, "
      + "try `deardesi init -d ~/path/to/blog'");
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
    createPost(originalDir, blogdir, args[1], args[2]);
    return;
  }
  else if ('serve' === command) {
    serve(blogdir);
    return;
  }
  else {
    console.error("Usage: desi [serve|init|post] -d ~/path/to/blog");
    return;
  }
});
