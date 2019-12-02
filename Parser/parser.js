const Papa = require('papaparse');
const fs = require('fs');
var file= fs.createReadStream("./SacramentocrimeJanuary2006.csv");

Papa.parse(file,{
	header:true,
	
	complete: function(results) {
		
		console.log("Finished:", results.data);
	}
	
});
