"use strict";

var path = require( "path" )
  , fs = require( "fs" );

exports.defaults = function() {
  return {
    eslint: {
      exclude: [],
      vendor: false,
      options: {
        config: "eslint.json",
        rulesdir: null,
        format: "stylish"
      }
    }
  };
};

exports.placeholder = function() {
  var ph = "\n  eslint:             # settings for eslint module\n" +
     "    exclude:[]              # array of strings or regexes that match files to not eslint,\n" +
     "                            # strings are paths that can be relative to the watch.sourceDir\n" +
     "                            # or absolute\n" +
     "    vendor: false           # whether or not to lint vendor scripts\n" +
     "    options:                # pass through options to ESLint\n" +
     "      config: 'eslint.json' # Path to your ESLint configuration file\n" +
     "      rulesdir: null        # path to directory where any additional custom eshint rules exist\n" +
     "      format: 'stylish'     # name of eslint output formatter\n";
  return ph;
};

exports.validate = function ( config, validators ) {
  var errors = [];

  if ( validators.ifExistsIsObject(errors, "eslint config", config.eslint ) ) {
    validators.ifExistsFileExcludeWithRegexAndString( errors, "eslint.exclude", config.eslint, config.watch.sourceDir );
    validators.ifExistsIsBoolean( errors, "eslint.vendor", config.eslint.vendor );

    if ( validators.ifExistsIsObject( errors, "eslint.options", config.eslint.options ) ) {
      if ( validators.ifExistsIsString( errors, "eslint.options.config", config.eslint.options.config ) ) {
        var fullPath = path.join( config.root, config.eslint.options.config );
        if ( !fs.existsSync( fullPath ) ) {
          config.log.info( "Cannot find default eslint config, will use default configuration." );
          config.eslint.options.config = null;
        }
      }

      validators.ifExistsIsString( errors, "eslint.options.rulesdir", config.eslint.options.rulesdir );
      validators.ifExistsIsString( errors, "eslint.options.format", config.eslint.options.format );
    }

  }

  return errors;
};