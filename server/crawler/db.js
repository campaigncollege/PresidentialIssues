
var buckets = require('./buckets').buckets;
var http = require('http');
var picksy = require('./extractor.js');
var htmlparser = require("htmlparser");
//var glossary = require("glossary");


var numFinds = 0;
var maxFinds = 1000;

var maxLinksPerIssue = 10;

var issueSet = {};
/*
issueSet["abortion"] = ["reproductive rights","birth control"];
issueSet["child support"] = ["children","child","daughter","prenup","son"];
issueSet["budget"] = ["OMB","treasury"];
issueSet["economy"] = ["banking","stimulus","bailout","business"];
issueSet["religion"] = ["mormon","church","protestant","muslim","christian"];
issueSet["crime"] = ["jail","prison","gang","police"];
issueSet["death penalty"] = ["lethal injection","electric chair"];
issueSet["drugs"] = ["cartel","marijuana","medicin","cocaine"];
issueSet["energy"] = ["renewab","solar","wind","frack","natural gas"];
issueSet["taxes"] = ["subsity","refund","tax return","audit"];
issueSet["gay rights"] = ["homo","civil union","marriage"]
issueSet["health care"] = ["romneycare","obamacare","medicare","medicaid","health"];
issueSet["immigration"] = ["illegals","mexicans","border"]
issueSet["gun control"] = ["NRA", "rifle","handgun"];
issueSet["privacy"] = ["big brother","surveil","tracking"];
issueSet["internet"] = ["cyber","piracy","web"];
issueSet["terrorism"] = ["jihad","al-qua","terror"]
issueSet["unemployment"] = ["jobs","work","welfare","labor",];
issueSet["environment"] = ["sustainab","climate","earth","atmosp","warming"]
issueSet["military"] = ["veterans","bombs","drone","army","navy"];
*/

issueSet["abortion"] = [];
issueSet["child support"] = [];
issueSet["budget"] = [];
issueSet["economy"] = [];
issueSet["religion"] = [];
issueSet["crime"] = [];
issueSet["death penalty"] = [];
issueSet["drugs"] = [];
issueSet["energy"] = [];
issueSet["taxes"] = [];
issueSet["gay rights"] = []
issueSet["health care"] = [];
issueSet["immigration"] = []
issueSet["gun control"] = [];
//issueSet["privacy"] = [];
issueSet["internet"] = [];
issueSet["terrorism"] = []
issueSet["unemployment"] = [];
issueSet["environment"] = []
issueSet["military"] = [];


var issues = Object.keys(issueSet);

// keeps track of number of times issue is found
var countSet = {};

for(var i=0; i<issues.length; i++){
	countSet[issues[i]] = 0;
}

//set of links found
var linkSet = {};

//keeps track of issues in the same article
var edgeSet = {};

for(var i=0; i<issues.length; i++){
	edgeSet[issues[i]] = {};
}

//linkset organized by issue. each issue has an array of links
var foundLinksByIssue = {};

for(var i=0; i<issues.length; i++){
	foundLinksByIssue[issues[i]] = [];
}


/* 
	callback must take 2 string args
	1: content of page
	2: url
*/
var getPage = function (url, onEnd){

	console.log("GET\t" + url.substr(0,100));

	var pageData = "";

	http.get(url, function(res) {
  		    res.on('data', function (chunk) {
      			pageData += chunk;
    		});

    		res.on('end', function(){
      			onEnd(pageData,url);
    		});
	});
}

var getNews = function(topic){

	getPage("http://www.google.com/search?hl=en&gl=us&tbm=nws&q=" + topic ,parseNews);
}

var parseNews = function(str,url){

	str = str.toLowerCase();

	var regex = /<a href="\/url\?q=(.{0,200})&amp;sa/g;

	var links = str.match(regex);

	for(var i=0; i<links.length; i++){
			var link = links[i].toString();
			var link = link.replace("<a href=\"/url?q=","").replace("&amp;sa","");	

			if(!linkSet[link]){
				getPage(link,parseNewsPage);
			}

			linkSet[link] = true;	

	}
}


var parseNewsPage = function(content,url){

	var issuesFound = {};

	//html parser
	/*var handler = new htmlparser.DefaultHandler();	
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(content);
	*/

	//picksy extracts content

	var result = content;

	/*
	console.log(handler.dom.children)

	if(handler.dom){
		result = picksy.analyze(handler.dom);
		//console.log(result.content);
		result = result.content;
		//console.log(result);
		if(result == null){
			console.log("ignored!");
			return;
		}
	}else{
		console.log("ignored!");
		return;
	}

	console.log(result.substr(0,500));
	*/

	//find each issue
	for(var i=0; i<issues.length; i++){
		var currIssue = issues[i];
		//console.log(currIssue);

		var currLinks = foundLinksByIssue[currIssue];

		var matches = result.match(new RegExp(currIssue));
		if(matches){
			countSet[currIssue]++;
			issuesFound[currIssue] = true;
			if(currLinks.length >= maxLinksPerIssue){
				delete currLinks[currLinks.length-1];
			}
			if(currLinks.length < maxLinksPerIssue && currLinks.indexOf(url) == -1){
				currLinks.unshift(url);
			}
			numFinds++;
		}
		var moreIssues = issueSet[currIssue];
		for(var x=0; x<moreIssues.length; x++){
			var curr = moreIssues[i];
			matches = result.match(new RegExp(curr));
		    if(matches){
				countSet[currIssue]++;
				issuesFound[currIssue] = true;
				if(currLinks.length >= maxLinksPerIssue){
					delete currLinks[currLinks.length-1];
				}
				if(currLinks.length < maxLinksPerIssue && currLinks.indexOf(url) == -1){
					currLinks.unshift(url);
				}
				numFinds++;
			}
		}
		//console.log(countSet);
	}

	//update edgeSet
	var issuesArr = Object.keys(issuesFound);
	for(var i=0; i<issuesArr.length; i++){
		var currIssue = issuesArr[i];

		for(var x=0; x<issuesArr.length; x++){
			var currIssue2 = issuesArr[x];
			if(currIssue !== currIssue2){
				if(edgeSet[currIssue][currIssue2]){
					edgeSet[currIssue][currIssue2]++;
				}else{
					edgeSet[currIssue][currIssue2] = 1;
				}
			}
		}

	}

	//console.log(edgeSet);

	console.log("numFinds: " + numFinds);
	//console.log(foundLinksByIssue);

}

var extractLinks = function(content){

}

var getAllNews = function(){

	if(numFinds > maxFinds){

		console.log("Resetting data: " + numFinds);

		numFinds = 0;

		countSet = {};

		edgeSet = {};

		for(var i=0; i<issues.length; i++){
			countSet[issues[i]] = 0;
		}

		linkSet = {};

		var foundLinksByIssue = {};

		for(var i=0; i<issues.length; i++){
			foundLinksByIssue[issues[i]] = [];
		}
	}

	getNews("obama");
	getNews("romney");
	getNews("paul ryan");
	getNews("joe biden");
	getNews("election");
	

}

getAllNews();

setInterval(getAllNews,15*60*1000);

exports.countSet = countSet;
exports.links = foundLinksByIssue;
exports.edgeSet = edgeSet;

