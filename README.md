Dear Desi
=========

A nice, friendly tool to help you get set up and start blogging with Desirae

Front-end written in AngularJS, back-end in Node.js

Install and Usage
=================

If you're on OS X or Linux, it's as easy as pie to install and use Desirae.

First install io.js (or node.js), if you haven't already.

```bash
# io.js

echo "v1.0.1" > /tmp/NODE_VER
curl -fsSL bit.ly/easy-install-iojs | bash

# node.js

echo "v0.11.14" > /tmp/NODE_VER
curl -fsSL bit.ly/easy-install-node | bash
```

Then install desi

```bash
npm install -g desi
```

And create a copy of the desirae-seed

```
git clone git@github.com:DearDesi/desirae-blog-template.git ~/my-desirae-blog
pushd ~/my-desirae-blog

git submodule init
git submodule update
```

And now fire up Dear Desi to get started

```
desi serve -b ~/my-desirae-blog
```

Now open up your evergreen browser to <http://local.dear.desi:65080>

Commandline
===========

Once you've done the initial setup in the browser, you can run `desi` from the commandline

**NOTE:** You can omit the `-b` if you are already in your blog directory.

Build Production Site
---------------------

You must set `base_path` and `base_url` in `site.yml` before attempting to build.

```
desi build -b ~/my-desirae-blog
```

Outputs to `~/my-desirae-blog/compiled`

Create a new Post
-----------------

```
desi post "My First Post" -b ~/my-desirae-blog
```

Outputs to `~/my-desirae-blog/posts/my-first-post.md`
