# [fm-ui](http://stash.securepassage.com/projects/WEBC/repos/fm-ui)

Package for all common CSS including the FireMonIcon font.  Also has some common bootstrap overrides and javascript constants for colors and breakpoints.


## Table of Contents
<!-- MarkdownTOC -->

- [Quick Start](#quick-start)
- [FireMonIcons](#firemonicons)
- [Dependencies](#dependencies)

<!-- /MarkdownTOC -->


## Quick Start

`npm install`
`bower install`
`grunt build` - Build distribution files.
`grunt serve` - Demo/docs hosted at localhost:9000.


## FireMonIcons

Currently, to update the FireMonIcons icon set, you'll need to talk to Bryan Kearney or Chuck Atteberry.

**PROPOSAL**: Move this process into Grunt/Gulp, SVG's supplied by XD.


## Dependencies

**fm-ui** aggregates the following dependencies:

* angular-ui-sortable
* angular-bootstrap\*
* angular-strap\**
* bootstrap
* bootstrap-sass-official
* fm-dependencies

\*  We're only including the modal directive from Bootstrap-UI

\** We're including only the following modules from Angular-Strap:
 `mgcrea.ngStrap.tooltip`, `mgcrea.ngStrap.popover`, `mgcrea.ngStrap.datepicker`, `mgcrea.ngStrap.button`, `mgcrea.ngStrap.select`, `mgcrea.ngStrap.collapse`, `mgcrea.ngStrap.dropdown`
     

