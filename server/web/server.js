
var express = require("express");
var http = require("http");
var fs = require("fs");

var data = {};

var links = {};

var cache = {};

var issueNumbers = {};

cache["home"] = fs.readFileSync("./public/force.html",['utf8']);

var app = express();



app.get('/', function(req, res){
  res.send(cache["home"]);
});

app.get('/set.json', function(req, res){
  res.json(data);
});

app.get('/links.json', function(req, res){
  res.json(links);
});

app.configure( function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler());
});

var makeData = function(page){

	var json = JSON.parse(page);

	var jsonArr = Object.keys(json);
	var arr = [];

	var min = 0;
	var max = json[jsonArr[0]];

	for(var i=0; i<jsonArr.length; i++){
		var num = json[jsonArr[i]];
		var curr = {"name": jsonArr[i], "num": num };
		if(num < min){
			min = num;
		}
		if(num > max){
			max = num;
		}
		arr.push(curr);
		issueNumbers[jsonArr[i]] = i;

	}

	//normalize data

	for(var i=0; i<jsonArr.length; i++){
		var curr = jsonArr[i];
		var currNum = json[jsonArr[i]];
		arr[issueNumbers[jsonArr[i]]].num = (1.0* currNum - min) / (1.0 * max - min);

	}

	data["nodes"] = arr;

	getEdges();

	console.log(data);
}

var makeLinks = function(page){

	var linkObj = JSON.parse(page);

	//console.log(linkObj);

	links = linkObj

	//console.log(links);
}

var makeEdges = function(page){

	var edgeObj = JSON.parse(page);

	var links = [];

	//console.log(edgeObj);


	var edgesArr = Object.keys(edgeObj);

	for(var i=0; i<edgesArr.length; i++){
		var currIssue = edgesArr[i];
		//console.log(currIssue);

		var theseLinks = []

		var currSet = edgeObj[edgesArr[i]];

		var currArr = Object.keys(currSet);

		for(var x=0; x<currArr.length; x++){
			var currIssue2 = currArr[x];
			theseLinks.push({"source": issueNumbers[currIssue],
				"target": issueNumbers[currIssue2],"value": currSet[currIssue2]});
		}

		theseLinks.sort(function(a,b){
			return b["value"] - a["value"];
		});

		
		if(theseLinks.length > 2){
			theseLinks.splice(2,theseLinks.length-3);
		}


		for(var a=0; a<theseLinks.length; a++){

			links.push(theseLinks[a]);
		}

		
	}

	//console.log(links);

	data["links"] = links;

	/*
	console.log(issueNumbers);
	console.log(links);
	console.log(edgeObj);
	*/



}

var getData = function (){

	var url = "http://issues-crawler.jit.su/set";

	var pageData = "";

	http.get(url, function(res) {
  		    res.on('data', function (chunk) {
      			pageData += chunk;
    		});

    		res.on('end', function(){
      			makeData(pageData);
    		});
	});
}

var getLinks = function (){

	var url = "http://issues-crawler.jit.su/links";

	var pageData = "";

	http.get(url, function(res) {
  		    res.on('data', function (chunk) {
      			pageData += chunk;
    		});

    		res.on('end', function(){
      			makeLinks(pageData);
    		});
	});
}

var getEdges = function (){

	var url = "http://issues-crawler.jit.su/edges";

	var pageData = "";

	http.get(url, function(res) {
  		    res.on('data', function (chunk) {
      			pageData += chunk;
    		});

    		res.on('end', function(){
      			makeEdges(pageData);
    		});
	});
}

var getAll = function(){
	getData();
	getLinks();
}

getAll();
setInterval(getAll,5*60*1000,getData);

app.listen(8888);