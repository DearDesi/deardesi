Dear Desi
=========

A nice, friendly tool to help you get set up and start blogging with Desirae

Front-end written in AngularJS, back-end in Node.js

Install and Usage
=================

If you're on OS X or Linux, it's as easy as pie to install and use Desirae.

First install node.js, if you haven't already.

```bash
# Install node.js/io.js v0.11.14+

echo "v0.11.14" > /tmp/NODE_VER
curl -fsSL bit.ly/easy-install-node | bash
```

Then install deardesi

```bash
npm install -g deardesi
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
deardesi ~/my-desirae-blog 65080
```


Once you've done the initial setup, you can run deardesi from the commandline

```
deardesi ~/my-desirae-blog ~/my-desirae-blog/compiled
```

Create a new Post
-----------------

```
deardesi post "My First Post"
```
