<!--
Not a Web Developer?
====================

You're in the wrong place. **Go to <http://dear.desi>** and follow the instructions there.
-->

Did you mean to come here?
==========================

If you're a normal person interested in *Desi, the DIY blog platform for normal people*,
you might have meant to go to [DearDesi](http://dear.desi) instead.

Otherwise, if you're a cyborg, wizzard, or web developer: carry on.

Dear Desi
=========

These instructions cover the command line only.

If you want instructions for the web interface, head over to [DearDesi](http://dear.desi).

Command Line Install (for developers)
--------------------

This assumes that you already have `git` and `iojs` (or `node`) installed,
otherwise see [iojs-install-script](https://github.com/coolaj86/iojs-install-script)

```
npm install -g desi
```

That was easy

Quick Usage
-------

* desi init -d ~/Desktop/new-blog
* pushd ~/Desktop/new-blog
* desi post "my first post"
* desi build
* desi serve

<http://local.dear.desi:65080>

**Note**: both through command line and web you need `site.yml` and `authors/xyz.yml` configured in order to create a post (as well as build).
The post commands output the location of post in various formats.

Initialize your blog (step 1)
--------

You can do this 3 ways:

1. Create a new blog with `desi init -d ~/Desktop/blog`
2. Clone the seed project and themes yourself
3. Clone the seed project and import your posts and themes

### Automated (desi init)

```bash
# initialize (and or create) a blog directory
desi init -d ~/Desktop/blog

# initialize the current directory
pushd ~/Desktop/blog
desi init
```

Note that you cannot initialize a directory that is already in use
(where 'in use' means has at least one non-dotfile).

### Manual (clone yourself)

There are a number of themes available at <https://github.com/DearDesi>,
just look for ones with 'theme' in the description.

```bash
git clone git@github.com:DearDesi/desirae-blog-template.git ~/my-desirae-blog
pushd ~/my-desirae-blog

git submodule add git@github.com:DearDesi/ruhoh-bootstrap-2.git themes/ruhoh-bootstrap-2
```

You will need to make sure that you have some details about your theme in `config.yml`.
Basically that means that you specify a [`datamap`](https://github.com/DearDesi?query=datamap)
and which defaults for a `page` and `post` in the `layouts` folder.

Just open it up, it'll make sense.

### Migrate (import another blog)

Obviously this is a little different for everyone, so here's what I'd recommend:

1. start by following the Automated procedure above
2. copy over your posts/articles folder(s)
3. edit `config.yml` to add a config with a permalink with your collections (posts, articles, essays, whatever you call them)
4. skip ahead to the *Setup your blog* section and make sure your `site.yml` and `authors/xxx.yml` are correct.
5. run `desi build -d /path/to/blog` to test if there are any issues with your existing yaml
  * if there are, you can take a look at the [normalize](https://github.com/DearDesi/desirae/blob/master/lib/transform-core.js#L72) function and perhaps hand-edit a few things (and when you're ready, you can [register your transform](https://github.com/DearDesi/deardesi/blob/master/bin/deardesi.js#L28) for collections. 
6. Now copy over your theme and set it to be the default in `site.yml`
7. build again. Your site probably won't look right:
  * look for stuff like `urls.base_url`, `host`, `page.url` that might have an extra `/` at the beginning or end or be named slightly differently.

See <https://github.com/DearDesi/desirae/blob/master/GLOSSARY.md> for disambiguation about the meaning of terms in Desi.

Setup your blog (step 2)
------------

1. Create an authors file in `authors/YOUR_NAME.yml` and model it after [this example](https://github.com/DearDesi/deardesi/blob/master/example/authors/johndoe.yml)
  * You don't need to use all of the fields (your template might not even support them all)
2. Create a site file as `site.yml`, similar to [this example](https://github.com/DearDesi/deardesi/blob/master/example/site.yml)

**Important Things**

  * `site.yml.base_url` - the point of ownership (usually blog.example.com or example.com)
  * `site.yml.base_path` - where the blog is "mounted", relative to the `base_url` (usually `/` or `/blog`)
  * `authors/me.yml.name` - most templates use this
  * `authors/me.yml.email` - and this
  * `authors/me.yml.twitter` - and this

Build your blog (step 2)
------------

The build *will* fail if you don't have `site.yml` and `authors/johndoe.yml` configured.

```bash
desi build -d /path/to/blog

desi serve -d /path/to/blog
```

Now open up your evergreen browser to <http://local.dear.desi:65080>
