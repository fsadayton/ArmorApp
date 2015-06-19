var args = arguments[0] || {};

var Map = require('ti.map');
var geocoder = require('ti.geocoder');


Alloy.Globals.sendHttpRequest("GetCategoryLookupIndex", "GET", null, storeCategoryLookup);
var categoryDictionary = null;
var allHeaders = [];
function storeCategoryLookup(){
	categoryDictionary = JSON.parse(this.responseText);
	
	_.each(categoryDictionary, function(category){
		if (_.contains(args.categories, category.id)){
			allHeaders.push(Ti.UI.createTableViewSection({title:category.id, headerView: Alloy.createController('TableViewHeader', {text:category.name}).getView()}));
		}
	});
	
	Alloy.Globals.sendHttpRequest("GetServiceProviders?counties=57&categories=" 
	+ args.categories.join(), "GET", null, parseServiceProviders);
}

function parseServiceProviders(){
	
	var crisisHeaders = [];
	var json = JSON.parse(this.responseText);
	
_.each(json, function(provider){
	var row = Alloy.createController('serviceProviderRow', {
			name:provider.name,
			address:provider.address,
			description:provider.description,
			phone: provider.phoneNumber,
			email: provider.email,
			website: provider.website,
		}).getView();	
	
	_.each(provider.categories, function(category){
		
		_.find(allHeaders, function(header){
			if(header.title === category){
				addProviderToMap(provider.address, provider.name);
				header.add(row);
				if(provider.crisisNumber){
					crisisHeaders.push(Alloy.createController('serviceProviderRow', {
					name:provider.name,
					crisis: provider.crisisNumber
					}).getView());
				}
				return true;
			}
		});	
	});
});

$.menu.setData(allHeaders);
$.crisisMenu.setData(crisisHeaders);
}

    
function providerDetail(e){
	Alloy.createController('providerDetail',{
		name:e.row.name,
		address: e.row.address,
		description: e.row.description,
		phone: e.row.phone,
		email: e.row.email,
		website: e.row.website
	}).getView().open();
}

function callPhoneNumber(e){
    var cleanNumber = e.row.crisis.replace(/\s|-|\./g,'');
    Ti.Platform.openURL('tel:' + cleanNumber);
}

function addProviderToMap(address, providerName){
	geocoder.forwardGeocoder(address, function(e){
		if(e.success)
		{
			var annotation = Map.createAnnotation({
	            latitude: e.places[0].latitude,
	   			longitude: e.places[0].longitude,
	            title: providerName,
	            subtitle: address
           });
           $.map.addAnnotation(annotation);
		}
		else{
				Ti.API.info("error with " + address +": "+ e.error);
			}
		
	});	
}

function toggleMapListView(){
	if($.mapModule.visible){
		setMapVisibility(false);
	}
	else{
		setMapVisibility(true);
		$.map.setRegion({latitude:39.719704, longitude:-84.219832, latitudeDelta:0.2, longitudeDelta:0.2});
	}
	
	function setMapVisibility(isMapVisible){
		$.mapModule.visible = isMapVisible;
		$.mapView.visible = !isMapVisible;
		
		$.menu.visible = !isMapVisible;
		$.listView.visible = isMapVisible;
	}
}

function filterResults(){
	alert("This feature is coming soon!");
}

Alloy.Globals.addActionBarButtons($.tabGroup);

