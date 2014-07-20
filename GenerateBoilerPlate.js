var fs = require('fs');
var EventEmitter = require( 'events' ).EventEmitter;

var AppBuilder = {
	init: function( BasePath, DirStruct, AppName ) {
		var self = this;

		self.AppBuilderEvents = new EventEmitter();
		self.initAppBuilderEvents();

		// TODO: validate this
		self.DirStruct = DirStruct;

		// TODO: validate this
		self.bp = BasePath;
		self.bpFull = self.bp+'/';

		// validate appname and create
		self.appName = AppName;
		if (
			typeof self.appName !== "undefined"
			&& self.appName !== ""
			&& self.appName.match( /\s+/g ) === null
		) {
			fs.mkdir(
				self.bpFull+self.appName
				, 0755
				, self.onDirErr( 'AppNameCreated' )
			);
		} else {    throw new Error( 'Invalid appName' );    }
	}
	, runDirStruct: function( DirStruct ) {
		// can be used recursively to generate files within files
		var self = this;

		// create file structure
		for ( var element in DirStruct ) {
			var curr = DirStruct[ element ];
			// if type is "dir", we create folder
			if ( curr.type == "dir" ) {
				// add the 'dir' prop to curr (for future recursion purposes)
				curr.dir = element;

				// create dir
				fs.mkdir(
					self.bpFull+element
					, 0755
					, self.onDirErr( 'AppDirCreated', curr )
				);
			} else {	// otherwise, file
				var data = {
					dir: undefined
					, files: curr
				};
				// create file
				self.createFiles( 0,  data );
			}
		}
	}
	, initAppBuilderEvents: function() {
		// init all events here
		var self = this;

		// fires after creation of the app folder
		// updates the name of basepath and basepath full
		// calls first go around of runDirStruct
		self.AppBuilderEvents
		.on(
			'AppNameCreated'
			, function(e) {

				self.bpFull += self.appName + '/';
				self.bp += '/'+self.appName;

				self.runDirStruct( self.DirStruct );
			}
		);

		// once a folder in app has been created
		// calls createFiles which goes through and generates files that live inside it
		self.AppBuilderEvents
		.on(
			'AppDirCreated'
			, self.createFiles( 1 )
		);

		// handles recursively adding more directories within a since AppDir
		self.AppBuilderEvents
		.on(
			'AppRecuseDir'
			, function( data ) {
				if ( typeof data.dir === "undefined" ) return false;
				
				var element = data.dir;
				for ( var items in data ) {
					if ( items === "type" ) continue;
					if ( items === "files" ) continue;
					if ( items === "dir" ) continue;

					// if we are here, this is a valid dir that must be created
					// runDirStruct invoked to grab all files that might be inside it
					var obj = {};
					obj[ element+'/'+items ] = data[ items ];
					self.runDirStruct( obj );

				}
			}
		);
	}
	, createFiles: function( isFromEvt, fileData ) {
		var self = this;

		function __createFiles( data ) {
			var currPathFull;

			// get current path from bpFull
			if ( data.dir !== undefined ) {
				currPathFull = self.bpFull + data.dir + '/';
			} else {
				currPathFull = self.bpFull;
			}

			// check for interior folders that may need to be created
			self.AppBuilderEvents.emit( 'AppRecuseDir', data );

			// create files
			// TODO: need to set this up to also spit out strings into files if requested by user
			for (var fileItem in data.files ) {
				var curr = data.files[ fileItem ];
				fs.writeFile(
					currPathFull+curr
					, ''
					, self.onDirErr()
				);
			}
		}		

		// trick for dual use of this fuction
		// if called as cb from event, we invoke first if statement
		// if called as regular function, we invoke the else
		if ( isFromEvt ) {    return __createFiles;    } 
		else {    __createFiles( fileData );    }
	}
	, onDirErr: function( evtName, evtData ) {
		// generic error handler
		// runs event if no error, the event is passed in by runDirStruct
		var self = this;
		return function( err ) {
			if ( err ) {
				throw new Error( err );
			} else if ( typeof evtName !== "undefined" ) {
				self.AppBuilderEvents.emit( evtName, evtData );
			}
		}
	}
}

function init() {
	return Object.create( AppBuilder );
}

exports.init = init;
