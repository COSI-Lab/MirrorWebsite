var fs = require('fs')
var result = "";

fs.readFile('ips.txt', 'utf-8', (err, data) => {
	if(err) throw err;

	result = "p Unique IPs: " + data;

	fs.writeFile('./includes/_ips.pug', result, err => {
		if(err) return console.log(err);

		console.log("saved");
	});
});
