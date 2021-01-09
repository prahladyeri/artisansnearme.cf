var SITEMAP_INDEX_URL = "/sitemaps/index.xml";
var DOMAIN = "artisansnearme.cf";

function readTextContent(data) {
	return data.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/);
}

function showListings(ct, state, city, prof, suburb) {
	var url = null;
	if (suburb) {
		url = "/data/"+ct+"/"+state+"/"+city+"/"+suburb+"/"+prof+".json";	
	}
	else {
		url = "/data/"+ct+"/"+state+"/"+city+"/"+prof+".json";
	}
	$.getJSON(url, function(data){
		window.data = data;
		data.data.forEach(function(item, idx){
			//console.log("item:", item, "idx:", idx);
			html = "<tr>";
			html += "<td>"  + (idx+1) + "</td>"
			
			
			var nametg = (item.url ? "<a target='_blank'  href='"+item.url+"'>"+item.name+"</a>" : item.name);
			
			var body = nametg + "<br>";
			if (item.address) {
				body += item.address + ",<br>";
			}
			
			if (suburb && (!item.address || !item.address.includes(suburb))) {
				body += suburb + "<br>";
			}
			
			body += state + " " + city + " "
			if (item.zip) body += item.zip 
			body += "<br>";
			
			if (item.phone) body += "Phone: " + item.phone + "<br>";
			//if (item.url) body += "Website: <a target='_blank' href='" + item.url + "'>" + item.url + "</a><br>";
			
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
	var suburb = urlParams.get('suburb');
	
	var ldData = { //for bread-crumbs
		"@context":  "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": ct, 
		"item":"https://" + DOMAIN + "?ct=" + ct
      }],
	}
	
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
				//spritetg = "<span class='f32'><span class='flag "+ct+"'></span></span>"
				spritetg = "<span class='flag-icon flag-icon-"+ct+"'></span>";
				$("#articleBlock").append(spritetg+"&nbsp;<a class='display-4' href='/?ct="+ct+"'>"+ct+"</a>");
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
		var title = prof + " in ";
		$(".disp-summary-page").remove();
		$("#tblMain").removeClass("d-none");
		if (suburb!=null) {
			title += suburb + ", "
		}
		title += city + ", " + state;
		document.title = title + " - " + document.title;
		$("#lblTitle").text(prof + " in " + city + ", " + state);
		if (suburb != null) {
			//var suburbtg = "<small>("+suburb+" suburb)</small>";
			$("#lblSuburb").text("("+suburb+" Suburb)");
		}
		showListings(ct, state, city, prof, suburb);
		
		//add more crumbs to ldData
		var obj = null;
		obj = {"@type": "ListItem", "position": 2,"name": state,"item":"https://"+DOMAIN+"?ct="+ct+"&state="+state}
		ldData.itemListElement.push(obj);
		obj = {"@type": "ListItem", "position": 3,"name": city, "item":"https://"+DOMAIN+"?ct="+ct+"&state="+state+"&city="+city}
		ldData.itemListElement.push(obj);
		tcnt  = 4
		if (suburb!=null) {
			obj = {"@type": "ListItem", "position": tcnt, "name":suburb, "item":"https://"+DOMAIN+"?ct="+ct+"&state="+state+"&city="+city+"&suburb="+suburb}
			ldData.itemListElement.push(obj);
			tcnt += 1;
		}
		obj = {"@type": "ListItem", "position": tcnt, "name":prof, "item":"https://"+DOMAIN+"?ct="+ct+"&state="+state+"&city="+city+"&prof="+prof}
		ldData.itemListElement.push(obj);
	}
	
	//add script element for bread-crumbs
	var script = document.createElement('script');
	script.type = "application/ld+json";
	script.innerHTML = JSON.stringify(ldData);
	//window.script = script;
	document.getElementsByTagName('head')[0].appendChild(script);
	console.log('bread-crumbs added');
	
	//build footer
	var url = "/sitemaps/"+ct+".txt", linkcnt=0;
	$.get(url, function(data){
		data = readTextContent(data);
		data.forEach(function(item, idx){
			//console.log('item:', item, 'idx:', idx);
			if (linkcnt>=16 && (ct&&state&&city&&prof)) return;
			if (item=="") return;
			turl = new URL(item);
			var params = new URLSearchParams(turl.search);
			var suburb = params.get('suburb');
			var ss = params.get('prof') + " in " 
			if (suburb != null) {
				ss += suburb + ", ";
			}
			ss += params.get('city');
			var elem = "<a class='text-success link' href='" + item + "'>" + ss + "</a>" + "&nbsp;";
			$("#footerBlock").append(elem);
			linkcnt++;
		});
		$("#footerBlock").append("<br>");
	});
});
