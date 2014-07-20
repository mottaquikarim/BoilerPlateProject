var bp = require( './GenerateBoilerPlate' ).init()
    , fs = require( 'fs' )
    , path
    , appname
    , myJSON;

process.argv.forEach(function (val, index, array) {
	if ( index === 2 && val == "help" ) {
		console.log( 'node app.js [path/to/save/dir] [name of app] [path/to/JSON/file/config]' );
	}
	if ( index === 2 ) path = val;
	if ( index === 3 ) appname = val;
	if ( index === 4 ) {
		fs.readFile(
			val
			, {encoding: 'utf-8'}
			, function(err,data){
				if ( err ) {
					throw new Error( err );
				}		
				myJSON = JSON.parse( data );
				bp.init( path, myJSON, appname );
			}
		);
	}
});
