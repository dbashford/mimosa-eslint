"use strict";

var path = require( "path" )
  , fs = require( "fs" )
  , YAML = require( "js-yaml" )
  , rules = require( "eslint/lib/rules" )
  , util = require( "eslint/lib/util" )
  , Config = require( "eslint/lib/config" );

exports.defaults = function() {
  return {
    eslint: {
      exclude: [],
      vendor: false,
      rulesdir: null,
      format: "stylish",
      options: {}
    }
  };
};

exports.validate = function ( config, validators ) {
  var errors = []
    , es = config.eslint;

  if ( validators.ifExistsIsObject(errors, "eslint config", es ) ) {
    validators.ifExistsFileExcludeWithRegexAndString( errors, "eslint.exclude", es, config.watch.sourceDir );
    validators.ifExistsIsBoolean( errors, "eslint.vendor", es.vendor );

    if ( validators.ifExistsIsString( errors, "eslint.rulesdir", es.rulesdir ) ) {
      if ( es.rulesdir ) {
        rules.load( es.rulesdir );
      }
    }

    if ( validators.ifExistsIsString( errors, "eslint.format", es.format ) ) {

      // set formatter into config for later use
      try {
        es.formatter = require( "eslint/lib/formatters/" + es.format );
      } catch ( err ) {
        config.log.warn( "Could not resolve eslint formatter [[ " + es.format + " ]], defaulting to [[ stylish ]]" );
        es.formatter = require( "eslint/lib/formatters/stylish" );
      }
    }

    if ( es.options ) {
      if ( typeof es.options === "string" ) {
        var fullPath = path.join( config.root, config.eslint.options );
        if ( !fs.existsSync( fullPath ) ) {
          errors.push( "eslint.options string path cannot be found" );
        } else {
          try {
            if ( es.options === '.eslintrc' ) {
              // .eslintrc files are yaml; parse it as such
              es.options = YAML.safeLoad(fs.readFileSync(fullPath, 'utf8'));
            } else {
              // try to parse as a regular node module or JSON
              es.options = require( fullPath );
            }
            if ( !es.options || ( typeof es.options !== "object" || Array.isArray( es.options ) ) ) {
              errors.push( "eslint.options file does not contain an object" );
            }
          } catch ( err ) {
            errors.push( "Could not load eslint.options, " + err );
          }
        }
      } else {
        if ( typeof es.options !== "object" ) {
          errors.push( "eslint.options must be a string path or an object" );
        }
      }

      if ( errors.length === 0 ) {
        var validKeys = [ "globals", "env", "rules", "ecmaFeatures", "parser" ];
        Object.keys( es.options ).forEach( function( eslintKey ) {
          if ( validKeys.indexOf( eslintKey ) === -1 ){
            errors.push( "eslint.options contains invalid key " + eslintKey + ". Valid keys are " + validKeys.join( ", " ) );
          }
        });
      }
    }
  }

  if ( errors.length === 0 ) {
    var eConfig = new Config();
    es.options = util.mergeConfigs( eConfig.baseConfig, es.options || {} );
  }

  return errors;
};
