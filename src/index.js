"use strict";

var path = require( 'path' )
  , eslint = require('eslint').cli
  , logger = null
  , config = require('./config');

var _eslint = function( opts, src ) {
  var args = [ '', '' ];

  if ( opts.config ) {
    args.push( '--config', path.resolve( opts.config ) );
  }

  if ( opts.rulesdir ) {
    args.push( '--rulesdir', opts.rulesdir );
  }

  if (opts.format) {
    args.push( '--format', opts.format );
  }

  eslint.execute( args.concat( src ) );
};

var _process = function (mimosaConfig, options, next) {
  if ( options.files && options.files.length ) {
    options.files.forEach( function( file ) {
      var outputText = file.outputFileText
        , fileName = file.inputFileName;

      if ( outputText && outputText.length > 0 ) {
        if ( mimosaConfig.eslint.exclude && mimosaConfig.eslint.exclude.indexOf( fileName ) !== -1 ) {
          if ( logger.isDebug() ) {
            logger.debug( "Not ESLinting [[ " + file.inputFileName + " ]] because it has been excluded via string." );
          }
        } else if ( mimosaConfig.eslint.excludeRegex && fileName.match( mimosaConfig.eslint.excludeRegex ) ) {
          if ( logger.isDebug() ) {
            logger.debug( "Not ESLinting [[ " + file.inputFileName + " ]] because it has been excluded via regex." );
          }
        } else if ( options.isVendor && !mimosaConfig.eslint.vendor ) {
          if ( logger.isDebug() ) {
            logger.debug( "Not ESLinting vendor script [[ " + fileName + " ]]" );
          }
        } else {
          _eslint( mimosaConfig.eslint.options, file.outputFileName );
        }
      }

    });
  }

  next();
};

var registration = function (config, register) {
  logger = config.log;
  register(
    ['buildFile','add','update'],
    'afterWrite',
    _process,
    config.extensions.javascript );
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};
