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
	space = ' ',
	packageInfo = fs.existsSync(__dirname + '/package.json') ? require(__dirname + '/package.json') : {};



fs.readFile(packageFileName, function (err, data) {
	if (err) {
		console.log((space + 'No ' + packageFileName + ' found').red());
		process.exit();
	}
	orig_pack = JSON.parse(data);

	if(!fs.existsSync(backupPackageFileName)) {
		fs.writeFile(backupPackageFileName, JSON.stringify(orig_pack, null, 4), 'utf8', function () {
			console.log(space + backupPackageFileName + ' backup file written');
		}); 
	}
	start();
});

function start(){

	console.log(space + (packageInfo.name + ' v. ' + packageInfo.version).underline() + ' locking versions for ' + (orig_pack.name+' v. ' + orig_pack.version).white());
	
	console.log(space + 'Output file is: '.red() + outFileName);

	var packs = {};
	
	fs.readdir(modulesFolder, function (err, files) {
		var pFolders = [];
		
		files.forEach(function (folder){
			if (folder.match(/\..*/)) {
	  			return;
	  		} else {
	  			pFolders.push(folder);
	  		}
		})
		scan(pFolders);
	  	
	});
	function scan(pFolders){
		var counter = pFolders.length;

		console.log(space + 'Dependencies locked: ' + counter);
		console.log(space + 'starting')
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
					console.log(space + 'doing ' + pack.white())
					packs[pack] = JSON.parse(data);
					if (counter == 0) createFile();
				});
			}
			
	    	function createFile() {
	    		console.log(space + 'done!')
	    		var j,
	    			outFile = {};
	    		for (j in packs) outFile[j] = packs[j].version;
	    		orig_pack.dependencies = outFile;
	    		fs.writeFile(outFileName, JSON.stringify(orig_pack, null, 4), 'utf8', function () {
	    			console.log(space + outFileName + ' written');
	    		}); 
	    	}
	  	});
	}
}