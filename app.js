var SITEMAP_INDEX_URL = "/sitemaps/index.xml";

function readTextContent(data) {
	return data.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/);
}

function showListings(ct, state, city, prof) {
	var url = "/data/"+ct+"/"+state+"/"+city+"/"+prof+".json";
	$.getJSON(url, function(data){
		data.data.forEach(function(item, idx){
			//console.log("item:", item, "idx:", idx);
			html = "<tr>";
			html += "<td>"  + (idx+1) + "</td>"
			
			body = item.name + "<br>";
			if (item.address) body += item.address + ",<br>";
			
			body += state + " " + city + " "
			if (item.zip) body += item.zip 
			body += "<br>";
			
			body += "Phone: " + item.phone + "<br>";
			if (item.url) body += "Website: <a target='_blank' href='" + item.url + "'>" + item.url + "</a><br>";
			
			html += "<td>"  + body + "</td>"
			html += "</tr>";
			$("#tblMain").append(html);
		});
	});
}

window.addEventListener("DOMContentLoaded", function(){
	console.log("All is well!");
	var urlParams = new URLSearchParams(window.location.search);
	var ct = urlParams.get('ct'); //?ct=au
	var state = urlParams.get('state');
	var city = urlParams.get('city');
	var prof = urlParams.get('prof');
	
	if (ct == null) { //list all countries
		$.get(SITEMAP_INDEX_URL, function(xmldata){
			//window.xmldata = data;
			//console.log('xml data:', data);
			 
			locs = xmldata.getElementsByTagName('sitemapindex')[0].getElementsByTagName('sitemap');
			for(var i=0;i<locs.length;i++){
				var item = locs[i];
				url = new URL(item.getElementsByTagName('loc')[0].textContent);
				parts = url.pathname.split('/');
				ct = parts[parts.length-1].split('.txt')[0];
				//$("#lblTitle").text(ct  + " - " + document.title);
				$("#articleBlock").append("<a href='/?ct="+ct+"'><h1>"+ct+"</h1></a>");
				$("#articleBlock").append("<br>");
			};
			//parser = new DOMParser();
			//xmlDoc = parser.parseFromString(data,"text/xml");
			//console.log('xml data:', xmlDoc);
		});
		return;
	}
	else if (state==null || city==null || prof==null) {
		//list all details for this country (see below the if block)
		//@todo: make the footer block bigger as there will be many entries in this case
	}
	else { //all entries proper
		var title = prof + " in " + city + ", " + state;
		document.title = title + " - " + document.title;
		$("#lblTitle").text(title);
		showListings(ct, state, city, prof);
	}
	
	
	//console.log('url:', url);
	var url = "/sitemaps/"+ct+".txt";
	$.get(url, function(data){
		data = readTextContent(data);
		data.forEach(function(item, idx){
			console.log('item:', item, 'idx:', idx);
			if (item=="") return;
			turl = new URL(item);
			var params = new URLSearchParams(turl.search);
			var ss = params.get('prof') + " in " + params.get('city');
			var elem = "<a class='text-danger' href='" + item + "'>" + ss + "</a>" + "<br>";
			$("#footerBlock").append(elem);
		});
		$("#footerBlock").append("<br>");
	});
});
