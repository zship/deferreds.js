module.exports = {

	baseUrl: 'src',

	optimize: 'none',

	packages: [
		{ name: 'amd-utils', location: '../lib/amd-utils/src' }
	],

	paths: {
		'jquery': '../lib/jquery'
	},

	keepBuildDir: true,

	locale: "en-us",

	useStrict: false,

	skipModuleInsertion: false,

	findNestedDependencies: false,

	removeCombined: false,

	preserveLicenseComments: false,

	//Sets the logging level. It is a number. If you want "silent" running,
	//set logLevel to 4. From the logger.js file:
	//TRACE: 0,
	//INFO: 1,
	//WARN: 2,
	//ERROR: 3,
	//SILENT: 4
	//Default is 0.
	logLevel: 0

};
