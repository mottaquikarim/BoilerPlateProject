// INCLUDE OBJECTS LOADED FROM REQUIRE() HERE
var fs = require( 'fs' );
var EventEmitter = require( 'events' ).EventEmitter;

/*
 *	NODE BOILER PLATE
 *	MODULES SHOULD FOLLOW THIS PATTERN
 */

// all methods are set as properties of this object
var MyModuleObject = {}

// init() returns an instance of our module object
// this means we can include our module and then have 
// access to all our methods right away
function init() {
	return Object.create( MyModuleObject );
}

// set up module.export
exports.init = init;

// USAGE EXXAMPLE:
/*
 *	var myModuleObj = require( './_modules/_boilerplate/BoilerPlate' );
 *	var myModuleInstance = myMobileObj.init();
 *	myModuleInstance.method1( arg1, arg2  );
 */
