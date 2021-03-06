"use strict";

var linter = require( "eslint" ).linter
  , moduleConfig = require( "./config" );

var _eslint = function( eslintConfig, src, filePath ) {
  var results = linter.verify( src.replace( /^#![^\r\n]+[\r\n]/, "" ), eslintConfig.options, false );
  if ( results ) {
    var resultsObj = {
      messages: results,
      filePath: filePath
    };

    var output = eslintConfig.formatter( [ resultsObj ], eslintConfig.options );
    if ( output ) {
      /* eslint no-console:0 */
      console.log( output );
    }
  }
};

var _process = function ( mimosaConfig, options, next ) {
  if ( options.files && options.files.length ) {
    var es = mimosaConfig.eslint;

    options.files.forEach( function( file ) {
      var text = es.executeAfterCompile ? file.outputFileText : file.inputFileText
        , fileName = file.inputFileName;

      if ( text && text.length > 0 ) {
        if ( es.exclude && es.exclude.indexOf( fileName ) !== -1 ) {
          if ( mimosaConfig.log.isDebug() ) {
            mimosaConfig.log.debug( "Not ESLinting [[ " + file.inputFileName + " ]] because it has been excluded via string path." );
          }
        } else if ( es.excludeRegex && fileName.match( es.excludeRegex ) ) {
          if ( mimosaConfig.log.isDebug() ) {
            mimosaConfig.log.debug( "Not ESLinting [[ " + file.inputFileName + " ]] because it has been excluded via regex." );
          }
        } else if ( options.isVendor && !es.vendor ) {
          if ( mimosaConfig.log.isDebug() ) {
            mimosaConfig.log.debug( "Not ESLinting vendor script [[ " + fileName + " ]]" );
          }
        } else {
          _eslint( es, text, fileName );
        }
      }
    });
  }

  next();
};

var registration = function (config, register) {
  var step = config.eslint.executeAfterCompile ? 'afterCompile' : 'beforeCompile';
  register( [ "buildFile", "add", "update"], step, _process, config.extensions.javascript );
};

module.exports = {
  registration: registration,
  defaults: moduleConfig.defaults,
  validate: moduleConfig.validate
};
