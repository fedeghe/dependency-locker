# dependency-locker

This package aim to lock the versions of your depencencies, so You will never run into cascade dependency bugs and will eliminate fears running `npm  install`.

### Installation  

Install dependency-locker running:

    $ [sudo] npm install dependency-locker [-g]

### Usage  

_Dependency-locker_ can be started just running into your project folder

    $ dependency-locker [-r]

the option `-r` allows to rewrite the `package.json`; by the way if a file `_package.json` is not found will be created with a backup of your `package.json`.