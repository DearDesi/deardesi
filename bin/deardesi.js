#!/usr/bin/env node
'use strict';

var PromiseA = require('bluebird')
  , fs = PromiseA.promisifyAll(require('fs'))
  , fsx = PromiseA.promisifyAll(require('fs.extra'))
  , tar = require('tar')
  //, requestAsync = PromiseA.promisify(require('request'))
  , request = PromiseA.promisifyAll(require('request'))
  , forEachAsync = require('foreachasync').forEachAsync
  //, spawn = require('child_process').spawn
  , path = require('path')
  , cli = require('cli')
  , UUID = require('node-uuid')
  , Desi
  , zlib = require('zlib')
  ;

cli.parse({
  blogdir: ['d', 'Where your blog is, i.e. ~/path/to/blog', 'string', './']
//, output: ['o', 'name of output directory within ~/path/to/blog', 'string', './compiled']
});

function init() {
  Desi = require('desirae').Desirae;

  //
  // 1. Transform (yml, slug, etc)
  //
  Desi.registerTransform(
    'lint'
  , require('desirae/lib/transform-core').DesiraeTransformCore.lint
  , { collections: true }
  );
  Desi.registerTransform(
    'root'
  , require('desirae/lib/transform-core').DesiraeTransformCore.root
  , { root: true }
  );
  Desi.registerTransform(
    'normalize'
  , require('desirae/lib/transform-core').DesiraeTransformCore.normalize
  , { root: true, collections: true }
  );
  Desi.registerTransform(
    'disqus'
  , require('desirae/lib/transform-core').DesiraeTransformCore.disqus
  , { collections: true }
  );

  //
  // 2. Aggregate (rss, categories, tags, etc)
  //
  Desi.registerAggregator(require('desirae/lib/aggregate-core').DesiraeAggregateCore.collate);

  //
  // 3. Datamap (ruhoh, desirae, jade, mustache, liquid)
  //
  Desi.registerDataMapper('desirae', require('desirae/lib/datamap-core').DesiraeDatamapCore);
  Desi.registerDataMapper('desirae@1.0', require('desirae/lib/datamap-core').DesiraeDatamapCore);
  // TODO ruhoh versions are ruhoh-twitter (1.0) and ruhoh-boostrap-2 (2.6)
  Desi.registerDataMapper('ruhoh', require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);
  Desi.registerDataMapper('ruhoh@1.0', require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);
  Desi.registerDataMapper('ruhoh@2.6', require('desirae-datamap-ruhoh').DesiraeDatamapRuhoh);

  //
  // 4. Render (md -> html, less -> css, etc)
  //
  Desi.registerRenderer(
    'js'
  , require('desirae/lib/render-core').DesiraeRenderCss
  , { themes: true, assets: true }
  );
  Desi.registerRenderer(
    'css'
  , require('desirae/lib/render-core').DesiraeRenderCss
  , { themes: true, assets: true }
  );

  ['html', 'htm', 'xhtm', 'xhtml'].forEach(function (ext) {
    Desi.registerRenderer(
      ext
    , require('desirae/lib/render-core').DesiraeRenderHtml
    , { root: true, collections: true, themes: true, assets: true }
    );
  });

  ['md', 'markdown', 'mdown', 'mkdn', 'mkd', 'mdwn', 'mdtxt', 'mdtext'].forEach(function (ext) {
    Desi.registerRenderer(
      ext
    , require('desirae/lib/render-core').DesiraeRenderMarkdown
    , { root: true, collections: true }
    );
  });

  Desi.registerRenderer(
    'jade'
  , require('desirae/lib/render-core').DesiraeRenderJade
                                    // TODO how to support jade in place of Mustache for layouts?
  , { root: true, collections: true, themes: true }
  );
}

function serve(displayDir, blogdir) {
  var http = require('http')
    //, https = require('https')
    , app = require('../server').create({ blogdir: blogdir })
    , server
    ;

  server = http.createServer(app).listen(65080, function () {
    console.info("Listening from " + displayDir);
    console.info("Listening on http://local.dear.desi:" + server.address().port);
  }).on('error', function (err) {
    if (/EADDRINUSE/.test(err.message)) {
      console.error("");
      console.error("You're already running desi in another tab.");
      console.error("");
      console.error("Go to the other tab and press <control> + c to stop her. Then you can come back here to try again.");
      console.error("");
      console.error("");
      return;
    }

    throw err;
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
      Desi.write(desi, env).then(function (info) {
        console.info(
            'wrote', info.numFiles
          , 'files'
          , '(' + (info.size && (info.size / (1024 * 1024)).toFixed(2) || 'unkown'), 'MiB)'
          , 'in'
          , ((info.end - info.start) / 1000).toFixed(3) + 's'
        );

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

  var desi = {}
    , env = {}
    , post = {}
    , slug
    , filepath
    , displaypath
    ;

  env.working_path = env.blogdir = blogdir;

  Desi.init(desi, env).then(function () {
    // TODO move this 'create new post' logic to desirae proper
    var collectionname = Object.keys(desi.config.collections)[0]
      , collection = desi.config.collections[collectionname]
      , entity = {}
      ;

  /*
  Desi.init(desi, env).then(function () {
    env.url = desi.site.base_url + desi.site.base_path.replace(/^\/$/, '');
    env.base_url = desi.site.base_url;
    env.base_path = desi.site.base_path;
    env.compiled_path = 'compiled';
    //env.since = 0;
  */

    post.title = title;
    post.description = "";
    post.date = Desi.toLocaleDate(new Date());
    // TODO use site.permalink or collection.permalink or something like that

    slug = Desi.slugify(post.title);
   
    // TODO as per config
    post.uuid = UUID.v4();
    // TODO as per config for default collection and default format (jade, md, etc)
    filepath = path.join(blogdir, collectionname, slug + '.md');
    displaypath = path.join(originalDir, 'posts', slug + '.md').replace(/^\/(Users|home)\/[^\/]+\//, '~/').replace(/ /g, '\\ ');

    ['updated', 'theme', 'layout', 'swatch'].forEach(function (key) {
      if (!post[key]) {
        delete post[key];
      }
    });


    Object.keys(post).forEach(function (key) {
      entity[key] = post[key];
    });
    entity.slug = slug;

    post.permalink = Desi.permalinkify(
      desi
    , collection.fallback_permalink || collection.permalink
    , entity);
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
      }

      console.log('');
      console.log(displaypath);
      console.log('');
      console.log('Markdown: [' + post.title + ']('
        + desi.site.base_url
        + path.join(desi.site.base_path, post.permalink)
        + ')'
      );
      console.log('HTML: <a href="'
        + desi.site.base_url
        + path.join(desi.site.base_path, post.permalink)
        + '">' + post.title + '</a>'
      );
      console.log('');
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

function initialize(displayPath, blogdir) {
  console.info("\nCreating new blog", displayPath);

  return fs.readdirAsync(blogdir).then(function (nodes) {
    // ignore dotfiles (.DS_Store, etc)
    nodes = nodes.filter(function (node) {
      return !/^\./.test(node);
    });

    if (nodes.length) {
      console.error("\n\tOops! It looks like that directory is already being used");
      console.error("\nIf you want you can DELETE it and start from scratch:");
      console.error("\n\trm -r '" + blogdir.replace("'", "'\"'\"'") + "'");
      console.error("\nOr you can specify a different directory.");
      console.error("\n");
      process.exit(1);
    }
  }).catch(function (/*err*/) {
   // doesn't exist? No problamo (all the better, actually)
    return;
  }).then(function () {
    return fsx.mkdirp(blogdir);
  }).then(function () {
    return new PromiseA(function (resolve, reject) {
      var t = tar.Extract({ path: blogdir, strip: 1 })
        , gunzip = zlib.createGunzip()
        ;

      console.info("Downloading blog template...", displayPath);
      request.get("https://github.com/DearDesi/desirae-blog-template/archive/v1.1.0.tar.gz")
        .pipe(gunzip)
        .pipe(t)
        .on('end', resolve)
        .on('error', reject)
        ;
    });
  }).then(function () {
    var themes
      ;

    themes = [
      { name: 'ruhoh-twitter'
      , url: "https://github.com/DearDesi/ruhoh-twitter/archive/v1.0.0.tar.gz"
      }
    , { name: 'ruhoh-bootstrap-2'
      , url: "https://github.com/DearDesi/ruhoh-bootstrap-2/archive/v1.0.1.tar.gz"
      }
    ];

    return forEachAsync(themes, function (theme) {
      return new PromiseA(function (resolve, reject) {
        var t = tar.Extract({ path: path.join(blogdir, 'themes', theme.name), strip: 1 })
          , gunzip = zlib.createGunzip()
          ;

        console.info("Downloading theme '" + theme.name + "'");
        request.get(theme.url)
          .pipe(gunzip)
          .pipe(t)
          .on('end', resolve)
          .on('error', reject)
          ;
      });
    });
  }).then(function () {
    console.info("Done.");
    console.info("\nTo start the web editor run this:");
    console.info("\n\tdesi serve -d '" + blogdir.replace("'", "'\"'\"'") + "'");
  })
  ;
}


cli.main(function (args, options) {
  init();

  var command = args[0]
    , blogdir = options.blogdir
    , originalDir = blogdir
    , displayPath
    ;
  
  if (!blogdir) {
    blogdir = path.resolve('./');
    originalDir = './';
  }

  displayPath = path.resolve(originalDir)
    .replace(/^\/(Users|home)\/[^\/]+\//, '~/')
    .replace(/ /g, '\\ ')
    ;

  if ('init' === command) {
    initialize(displayPath, blogdir);
    return;
  }

  if (!fs.existsSync(path.join(blogdir, 'site.yml'))) {
    console.error("Usage: desi [serve|init|post] -d ~/path/to/blog");
    console.error("(if ~/path/to/blog doesn't yet exist or doesn't have config.yml, site.yml, etc, "
      + "try `deardesi init -d ~/path/to/blog'");
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
    serve(displayPath, blogdir);
    return;
  }
  else {
    console.error("Usage: desi [serve|init|post] -d ~/path/to/blog");
    return;
  }
});
