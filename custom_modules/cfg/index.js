//
//
//
// automat.finance config
//
//
//
const Fs = require('fs');
const Process = require('process');
//
//
//
let option = Process.argv[2];
let input = Process.argv[3];
let _server = null;
//
//
// Check for command line options, defaults to production settings (for ease of use with Forever.js)
switch(option){
	//
	//
	//
	case 'm':
	case '-m':
	case '-M':
	case '-mode':
	case '--mode':
	case '--MODE':
	case '--Mode':
		//
		//
		//
		switch(input){
			//
			//
			//
			case 'd':
			case 'dv':
			case 'dev':
			case 'development':
			case 'D':
			case 'DV':
			case 'DEV':
			case 'DEVELOPMENT':
				//
				//
				//
				_server = {
					mode: 'dev',
					isDev: true,
					isProd: false,
					port: 8443,
					launchmsg: 'Dev server running @ https://localhost:8443/',
					ssl:{
						key: Fs.readFileSync('./ssl/dev/self-signed.key'),
				  		cert: Fs.readFileSync('./ssl/dev/self-signed.crt')
					}
				};
				//
				//
				//
			break;
			//
			//
			//
			case 'p':
			case 'prd':
			case 'prod':
			case 'production':
			case 'P':
			case 'PRD':
			case 'PROD':
			case 'PRODUCTION':
				//
				//
				//
				_server = {
					mode: 'prod',
					isDev: false,
					isProd: true,
					port: 443,
					launchmsg: 'Server started on port 443',
					ssl:{
						key: Fs.readFileSync('./ssl/prd/*.key'),
				  		cert: Fs.readFileSync('./ssl/prd/*.crt')
					}
				};
				//
				//
				//
			break;
			//
			//
			//
			default:
				//
				//
				//
				console.log('Default Server Configuration enabled.');
				_server = {
					mode: 'prod',
					isDev: false,
					isProd: true,
					port: 443,
					launchmsg: 'Server started on port 443',
					ssl:{
						key: Fs.readFileSync('./ssl/prd/*.key'),
				  		cert: Fs.readFileSync('./ssl/prd/*.crt')
					}
				};
				//
				//
				//
			break;
		}
		//
		//
		//
	break;
	//
	//
	//
	default:
		//
		//
		//
		_server = prdServer;
		//
		//
		//
	break;
}
//
//
// Build finalized config object
let _cfg = {
	server: _server,
	
}; 
//
//
//
module.exports = _cfg;