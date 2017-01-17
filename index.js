#!/usr/bin/env node
var fs = require('fs'),
	stringproto = require('./stringproto'),
	modulesFolder = './node_modules/',
	orig_pack,
	args = process.argv.splice(2),
	rewritePackage = args.length && args[0] == '-r',
	packageFileName = 'package.json',
	backupPackageFileName = '_package.json',
	outFileName = rewritePackage ? 'package.json' : 'package_solved.json',
	packageInfo = fs.existsSync(__dirname + '/package.json') ? require(__dirname + '/package.json') : {},
	log = function (msg) {console.log(' ' + msg)}; 

fs.readFile(packageFileName, function (err, data) {
	if (err) {
		log(('No ' + packageFileName + ' found').red());
		process.exit();
	}
	orig_pack = JSON.parse(data);
	start();
});

function start(){

	log((packageInfo.name + ' v. ' + packageInfo.version).underline() + ' locking versions for ' + (orig_pack.name+' v. ' + orig_pack.version).white());
	
	log('Output file is: '.red() + outFileName);

	var packs = {};

	fs.readdir(modulesFolder, function (err, files) {
		var pFolders = [];
		files.forEach(function (folder){
			if (folder.match(/\..*/)) {
	  			return;
	  		}
	  		pFolders.push(folder);
		})
		scan(pFolders);
	});

	function scan(pFolders){
		var counter = pFolders.length;
		log('Dependencies locked: ' + counter);
		if (counter == 0) {
			log('...nothing to do');
			return;
		} else {
			if(!fs.existsSync(backupPackageFileName)) {
				fs.writeFile(backupPackageFileName, JSON.stringify(orig_pack, null, 4), 'utf8', function () {
					log(backupPackageFileName + ' backup file written');
				}); 
			}
		}
		log('starting')
		pFolders.forEach(function (folder){

			fs.stat(modulesFolder + folder, function(err, stats) {
			    if (stats.isDirectory()) {
			        seekPackage(folder);
			    } else {
			    	return --counter;
			    }	 
			});

			function seekPackage(pack) {
				fs.stat(modulesFolder + '/' + pack + '/' + packageFileName, function(err, stats) {
					if (err) return;
				    if (stats.isFile()) {
				        getPackageContent(pack);
				    }		 
				});
			}

			function getPackageContent(pack) {
				fs.readFile(modulesFolder + '/' + pack + '/' + packageFileName, function (err, data) {
					--counter;
					if (err) throw err;
					log('doing ' + pack.white())
					packs[pack] = JSON.parse(data);
					if (counter == 0) createFile();
				});
			}
			
	    	function createFile() {
	    		log('done!')
	    		var j,
	    			outFile = {};
	    		for (j in packs) outFile[j] = packs[j].version;
	    		orig_pack.dependencies = outFile;
	    		fs.writeFile(outFileName, JSON.stringify(orig_pack, null, 4), 'utf8', function () {
	    			log(outFileName + ' written');
	    		}); 
	    	}
	  	});
	}
}