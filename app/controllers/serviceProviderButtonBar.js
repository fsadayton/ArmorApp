var args = arguments[0] || {};
var countySelector = require("countySelectorUtils");

var providerListObject;

exports.setProviderListObject = function(listObject){
	providerListObject = listObject;
};

/**
 * Function that either displays list of service providers or map of
 * service providers based on user preference. 
 */
function toggleMapListView(){
	var mapModule = providerListObject.getMapViews().mapModule;
	var map = providerListObject.getMapViews().map;
	var listView = providerListObject.getListView();
	
	if(mapModule.visible){
		setMapVisibility(false);
	}
	else{
		setMapVisibility(true);
		//TODO: Find better alternative to setting map region
		map.setRegion({latitude:39.719704, longitude:-84.219832, latitudeDelta:0.2, longitudeDelta:0.2});
	}
	
	function setMapVisibility(isMapVisible){
		mapModule.visible = isMapVisible;
		$.mapButton.visible = !isMapVisible;
		
		listView.visible = !isMapVisible;
		$.listButton.visible = isMapVisible;
	}
}

/**
 * Function that passes in all category names and counties, a callback method
 * to be executed once filtering option have been submitted, and the 
 * current counties and categories that users are viewing to the filter 
 * window and opens it. 
 */
function filterResults(){
	var plzWait = null;
	if(Alloy.Globals.isAndroid && countySelector.isCountiesNull()){
		plzWait = Alloy.createController("pleaseWait").getView();
		plzWait.open();
	}
	countySelector.getCounties(function(counties){
		if(plzWait){
			plzWait.close();
		}
		createFilter(counties);
	});
	
	/**
	 * helper function for creating filter view
	 */
	function createFilter(countiesList){
		var params = providerListObject.getFilterParams();
		params.counties = countiesList;
		Alloy.createController("serviceProviderFilter", params).getView().open();
	}
}