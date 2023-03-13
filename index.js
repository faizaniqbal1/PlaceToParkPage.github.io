var isParkingOneAvaliable = { val: false };
var isParkingTwoAvaliable = { val: false };
var map;
//disabled Marker Icon's URL
var IconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
var marker;
var markers = [];

//Blyink API's URL for fetching parking data and device status
var parkingOneDataUrl = "https://lon1.blynk.cloud/external/api/get?token=QOvuUWkhXY6MYcLQJXkD_uFWSYULNz8O&dataStreamId=1";
var parkingTwoDataUrl = "https://lon1.blynk.cloud/external/api/get?token=fIvblL3NxGf9OjyxtXYPDBYQo_CJP4Qh&dataStreamId=1";
var parkingOneStatusUrl = "https://lon1.blynk.cloud/external/api/isHardwareConnected?token=QOvuUWkhXY6MYcLQJXkD_uFWSYULNz8O"
var parkingTwoStatusUrl = "https://lon1.blynk.cloud/external/api/isHardwareConnected?token=fIvblL3NxGf9OjyxtXYPDBYQo_CJP4Qh"
var ParkingOneData = { val: 0 };
var ParkingTwoData = { val: 0 };

//locations array for storing parking locations which includes parking name, latitude, longitude and parking status
var locations = [
    ['Additional Hospital Carpark', 53.73685568634291, -2.4581691000000006, isParkingOneAvaliable],
    ['Staff Parking', 53.73703773968194, -2.4645102153413183, isParkingTwoAvaliable]
];

//called these funtions on page load to get parking status and set markers on the map
getParkingOneStatus();
getParkingTwoStatus();
getParkingDataRepeatedly();

//fuction for initializing map on the page.
function initMap() {
    const mid = { lat: 53.73604824177822, lng: -2.4621044198268685 };

    //map object with zoom level and center point 
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: mid
    });
    map.setOptions({ styles: styles["hide"] });
    //start fetching parking status and set markers accordingly on initization.
    getParkingStatusRepeatedly();
}

//funtion to add markers on the map using locations array
function addMarkers(locationsArray) {
    //clear all markers from the map before adding new markers
    deleteMarkers();
    var infowindow = new google.maps.InfoWindow();
    var i;

    //iterate through locations array and add markers on the map
    for (i = 0; i < locationsArray.length; i++) {
        marker = new google.maps.Marker({
            //set marker position using latitude and longitude from locations array
            position: new google.maps.LatLng(locationsArray[i][1], locationsArray[i][2]),
            map: map,
            //set marker label using parking name from locations array
            label: locationsArray[i][0],
            //set custom marker incon if parking is not available
            icon: locationsArray[i][3].val ? null : IconUrl
        });
        markers.push(marker);

        //if parking is available then add click event on marker to open parking detail popup
        if (locationsArray[i][3].val) {
            //add click event on marker to open parking detail popup 
            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    openParkingDetailModal(locationsArray[i][1], locationsArray[i][2], locationsArray[i]);
                }
            })(marker, i));
        } else {
            //if parking is not available then show alert message
            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    alert("Parking is not available");
                }
            })(marker, i));
        }

        //add mouseover event on marker to show parking name
        google.maps.event.addListener(marker, 'mouseover', (function (marker, i) {
            return function () {
                infowindow.setContent(locationsArray[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

//below 3 funtions are used to manuplate markers on the map in realtime
{
    function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function hideMarkers() {
        setMapOnAll(null);
    }
    function deleteMarkers() {
        hideMarkers();
        markers = [];
    }
}

//funtion to open parking detail popup
function openParkingDetailModal(longitude, latitude, parking) {
    $('#parkingModelLabel').html("Parking Details");
    //bloew line used to create direction url for google map
    dirUrl = "https://www.google.com/maps/dir/?api=1&destination=" + longitude + "," + latitude;
    //set direction url on the direction button
    $('#direction').attr('href', dirUrl);
    //after calling this function first this funtion check which marker is clicked and then show parking detail accordingly if maarker 1 is clicked then show parking 1 detail and hide parking 2 detail and vice versa
    if (parking == 0) {
        $('#totalSlotsTwo').hide();
        $('#freeSlotsTwo').hide();
        $('#occupiedSlotsTwo').hide();
        //if parking 1 is full then hide parking 1 detail
        if (ParkingOneData.val == 5) {
            $('#totalSlotsOne').hide();
            $('#freeSlotsOne').hide();
            $('#occupiedSlotsOne').hide();
        }
    } else {
        $('#totalSlotsOne').hide();
        $('#freeSlotsOne').hide();
        $('#occupiedSlotsOne').hide();
        //if parking 2 is full then hide parking 2 detail
        if (ParkingTwoData.val == 5) {
            $('#totalSlotsTwo').hide();
            $('#freeSlotsTwo').hide();
            $('#occupiedSlotsTwo').hide();
        }
    }
    //open parking detail popup using bootstrap modal after setting all the values
    document.getElementById("modalBtn").click();
}

//funtion to get parking 1 status using blynk api with ajax call and set parking 1 status in isParkingOneAvaliable variable
function getParkingOneStatus() {
    ajaxRequest = $.ajax({
        url: parkingOneStatusUrl,
        cache: false,
        method: "GET",
        success: function (response) {
            console.log(response);
            isParkingOneAvaliable.val = response;
        }
    });
}

//funtion to get parking 2 status using blynk api with ajax call and set parking 2 status in isParkingTwoAvaliable variable
function getParkingTwoStatus() {
    ajaxRequest = $.ajax({
        url: parkingTwoStatusUrl,
        cache: false,
        method: "GET",
        success: function (response) {
            console.log(response);
            isParkingTwoAvaliable.val = response;
        }
    });
}

//funtion to get parking status in every 5 seconds and set markers accordingly if any parking is available then set marker on the map and if parking is not available then remove/disbale marker from the map
function getParkingStatusRepeatedly() {
    addMarkers(locations);
    setTimeout(getParkingStatusRepeatedly, 5000);
    getParkingOneStatus();
    getParkingTwoStatus();
}

//funtion to get parking 1 data using blynk api with ajax call and set parking 1 data in ParkingOneData variable
function getParkingOneData() {
    ajaxRequest = $.ajax({
        url: parkingOneDataUrl,
        cache: false,
        method: "GET",
        success: function (response) {
            console.log(response);
            ParkingOneData.val = response;
        }
    });
}
//funtion to get parking 2 data using blynk api with ajax call and set parking 2 data in ParkingTwoData variable
function getParkingTwoData() {
    ajaxRequest = $.ajax({
        url: parkingTwoDataUrl,
        cache: false,
        method: "GET",
        success: function (response) {
            console.log(response);
            ParkingTwoData.val = response;
        }
    });
}

//funtion to get parking data in every 2 seconds and set parking data in parking detail popup accordingly
function getParkingDataRepeatedly() {
    getParkingOneData();
    getParkingTwoData();
    var availableSlotsOne = 5 - ParkingOneData.val;
    var availableSlotsTwo = 5 - ParkingTwoData.val;
    $('#totalSlotsOne').text('5');
    $('#freeSlotsOne').text(availableSlotsOne);
    $('#occupiedSlotsOne').text(ParkingOneData.val);
    //if parking is full then show message in parking detail popup
    if (ParkingOneData.val == 5) {
        $('#isParkingOneFull').text("This Parking space is full kindly choose another parking space from the map");
    }
    if (ParkingTwoData.val == 5) {
        $('#isParkingTwoFull').text("This Parking space is full kindly choose another parking space from the map");
    }
    $('#totalSlotsTwo').text('5');
    $('#freeSlotsTwo').text(availableSlotsTwo);
    $('#occupiedSlotsTwo').text(ParkingTwoData.val);
    setTimeout(getParkingDataRepeatedly, 2000);
}

//stle object to hide unnecessary labels/details on the map
const styles = {
    default: [],
    hide: [
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.business",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }
    ]
};

//this line used to call initMap function on page load.
window.initMap = initMap;