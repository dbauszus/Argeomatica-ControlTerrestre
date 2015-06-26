var currentFeature;

loadFeaturesContrato = function(response) {
	geoJSON = new ol.format.GeoJSON();
	sourceContrato.addFeatures(geoJSON.readFeatures(response));
	};

var sourceContrato = new ol.source.Vector({
	loader: function(extent, resolution, projection) {
		$.ajax('http://187.177.83.48:8080/geoserver/wfs',{
			type: 'GET',
			data: {
				service: 'WFS',
				version: '1.1.0',
				request: 'GetFeature',
				typename: 'ctrl_contrato',
				srsname: 'EPSG:3857',
				outputFormat: 'application/json',
				bbox: extent.join(',') + ',EPSG:3857'
				},
			}).done(loadFeaturesContrato);
		},
		strategy: ol.loadingstrategy.tile(new ol.tilegrid.XYZ({
			maxZoom: 19
			})),
	});

var layerContrato = new ol.layer.Vector({
	source: sourceContrato,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'orange',
			width: 2
			})
		})
	});

loadFeaturesCTRL = function(response) {
	geoJSON = new ol.format.GeoJSON();
	sourceCTRL.addFeatures(geoJSON.readFeatures(response));
	};

var sourceCTRL = new ol.source.Vector({
	loader: function(extent, resolution, projection) {
		$.ajax('http://187.177.83.48:8080/geoserver/wfs',{
			type: 'GET',
			data: {
				service: 'WFS',
				version: '1.1.0',
				request: 'GetFeature',
				typename: 'ctrl_control',
				srsname: 'EPSG:3857',
				outputFormat: 'application/json',
				bbox: extent.join(',') + ',EPSG:3857'
				},
			}).done(loadFeaturesCTRL);
		},
		strategy: ol.loadingstrategy.tile(new ol.tilegrid.XYZ({
			maxZoom: 19
			})),
	});

function styleVector (feature, resolution) {
	scale = 1 / resolution;
	if (scale > 0.2){scale = 0.2};
	label = {
		font: '20px Calibri,sans-serif',
		offsetY: -30,
		fill: new ol.style.Fill({
			color: '#000'
			}),
		stroke: new ol.style.Stroke({
			color: '#fff',
			width: 3
			}),
		text: feature.get('ctrlid'),
		};
	switch(feature.get('ctrltype')) {
		case 'VÉRTICE':
			src = 'icons/triangle_orange.svg';
			break;
		case 'MOJONERA':
			src = 'icons/square_orange.svg';
			break;
		case 'PLACA':
			src = 'icons/circle_orange.svg';
			break;
		case 'BN':
			src = 'icons/bn_orange.svg';
			break;
		case 'OTRO':
			src = 'icons/star_orange.svg';
			break;
		default:
			src = 'icons/cross_orange.svg';
		}
	styleCTRL = [new ol.style.Style({
		image: new ol.style.Icon({
			src: src,
			scale: scale
			}),
		text: new ol.style.Text(label)
		})];
	return styleCTRL;
	};
	
function styleVector_select (feature, resolution) {
	scale = 1 / resolution;
	if (scale > 0.2){scale = 0.2};
	label = {
		font: '20px Calibri,sans-serif',
		offsetY: -30,
		fill: new ol.style.Fill({
			color: '#000'
			}),
		stroke: new ol.style.Stroke({
			color: '#fff',
			width: 3
			}),
		text: feature.get('ctrlid'),
		};
	switch(feature.get('ctrltype')) {
		case 'VÉRTICE':
			src = 'icons/triangle_red.svg';
			break;
		case 'MOJONERA':
			src = 'icons/square_red.svg';
			break;
		case 'PLACA':
			src = 'icons/circle_red.svg';
			break;
		case 'BN':
			src = 'icons/bn_red.svg';
			break;
		case 'OTRO':
			src = 'icons/star_red.svg';
			break;
		default:
			src = 'icons/cross_red.svg';
		}
	styleCTRL = [new ol.style.Style({
		image: new ol.style.Icon({
			src: src,
			scale: scale
			}),
		text: new ol.style.Text(label)
		})];
	return styleCTRL;
	};
    
var layerCTRL = new ol.layer.Vector({
	maxResolution: 200,
	source: sourceCTRL,
	style: styleVector
	});

var layerOSM = new ol.layer.Tile({
	source: new ol.source.OSM()
	});

var map = new ol.Map({
	target: 'map',
	overlays: [],
	controls: [],
	layers: [layerOSM,layerContrato,layerCTRL],
	view: new ol.View({
		center: ol.proj.transform([-103.77, 24.59], 'EPSG:4326', 'EPSG:3857'),
		zoom: 5
		})
	});

map.on('moveend', function(e){
	var v = e.map.getView();
	if (v.q.resolution < 200){$('#btnNewCTRL').show();};
})

var selectInteraction = new ol.interaction.Select({
	layers:[layerCTRL],
	style: styleVector_select
	});

function resizeTextArea(textarea){
	var hiddenDiv = $('.hiddendiv').first();
	if (hiddenDiv.length) {
	      hiddenDiv.text(textarea.val() + '\n');
	      var content = hiddenDiv.html().replace(/\n/g, '<br>');
	      hiddenDiv.html(content);
		  hiddenDiv.css('width', textarea.width());
		  textarea.css('height', hiddenDiv.height());
	}
};

selectInteraction.getFeatures().on('add', function(e) {
	currentFeature = e.element;
	props = e.element.getProperties();
	if (props.contrato){
		$('#CONTRATO').val(props.contrato);
		$('#CONTRATO, #CONTRATO_LABEL').addClass('active');
	} else {
		$('#CONTRATO').val('');
		$('#CONTRATO, #CONTRATO_LABEL').removeClass('active');
	}
	if (props.ctrlid){
		$('#CTRLID').val(props.ctrlid);
		$('#CTRLID, #CTRLID_LABEL').addClass('active');
	} else {
		$('#CTRLID').val('');
		$('#CTRLID, #CTRLID_LABEL').removeClass('active');
	}
	if (props.descripcion){
		$('#DESCRIPCION').val(props.descripcion.replace(/<br>/g,'\n'));
		$('#DESCRIPCION, #DESCRIPCION_LABEL').addClass('active');
	} else {
		$('#DESCRIPCION').val('');
		$('#DESCRIPCION, #DESCRIPCION_LABEL').removeClass('active');
	}
	$('#TIPO div input').val(props.ctrltype);
	$('#btnNewCTRL').css({'right':'295px'});
	$('#panel').show();
	setTimeout(function(){
		$('#btnSave').show();
		$('#btnDeleteCTRL').show();
		resizeTextArea($('#DESCRIPCION'));
		}, 300);
	});

selectInteraction.getFeatures().on('remove', function(e) {
	$('#btnNewCTRL').css({'right':'20px'});
	$('#btnSave').hide();
	$('#btnDeleteCTRL').hide();
	$('#panel').hide();
	});

map.addInteraction(selectInteraction);

var formatWFS = new ol.format.WFS();
var formatGML = new ol.format.GML({
	featureNS: 'http://argeomatica.com',
	featureType: 'ctrl_control',
	srsName: 'EPSG:3857'
	});
var transactWFS = function(p,f) {
	switch(p) {
	case 'insert':
		node = formatWFS.writeTransaction([f],null,null,formatGML);
		break;
	case 'update':
		node = formatWFS.writeTransaction(null,[f],null,formatGML);
		break;
	case 'delete':
		node = formatWFS.writeTransaction(null,null,[f],formatGML);
		break;
	}
	s = new XMLSerializer();
	str = s.serializeToString(node);
	$.ajax('http://geoserver-dbauszus.rhcloud.com/wfs',{
		type: 'POST',
		dataType: 'xml',
		processData: false,
		contentType: 'text/xml',
		data: str
		}).done(function(response){
			if (p=='insert'){
				tResponse = formatWFS.readTransactionResponse(response);
				currentFeature.setId(tResponse.insertIds[0]);
				}
			});
	}

$('#btnZoomIn').on('click', function() {
	var view = map.getView();
	var newResolution = view.constrainResolution(view.getResolution(), 1);
	view.setResolution(newResolution);
	});

$('#btnZoomOut').on('click', function() {
	var view = map.getView();
	var newResolution = view.constrainResolution(view.getResolution(), -1);
	view.setResolution(newResolution);
	});

$('#btnNewCTRL').on('click', function() {
	interaction = new ol.interaction.Draw({
	    type: 'Point',
	    source: layerCTRL.getSource()
		});
	map.addInteraction(interaction);
	interaction.on('drawend', function(e) {
		currentFeature = e.feature;
		var g = currentFeature.getGeometry();
		var cF = sourceContrato.getClosestFeatureToCoordinate(g.j);
		map.removeInteraction(interaction);
		currentFeature.setProperties({contrato:cF.q.contrato});
		$('#CONTRATO').val(cF.q.contrato);
		$('#CONTRATO, #CONTRATO_LABEL').addClass('active');
		$('#CTRLID').val('');
		$('#CTRLID, #CTRLID_LABEL').removeClass('active');
		$('#DESCRIPCION').val('');
		$('#DESCRIPCION, #DESCRIPCION_LABEL').removeClass('active');
		e.feature.setProperties({ctrltype:'VÉRTICE'});
		$('#TIPO div input').val('VÉRTICE');
		$('#panel').show();
		transactWFS('insert',currentFeature);	
    	});
	});

$('#btnDeleteCTRL').on('click', function() {
	if (confirm('Eliminar CTRL?')) {
		transactWFS('delete',currentFeature);
		sourceCTRL.removeFeature(currentFeature);
		selectInteraction.getFeatures().clear();
		$('#panel').hide();
		}
	});

$('#btnSave').on('click', function() {
	featureProperties = currentFeature.getProperties();
	delete featureProperties.bbox;
	var clone = new ol.Feature(featureProperties);
	clone.setId(currentFeature.getId());
	transactWFS('update',clone);
	});

$(document).ready(function() {
    $('select').material_select();
    $('[id="TIPOselect"]').change(function () {
    	selectValue = $(':selected', this).val();
    	wrapper = $(this).parent();
    	wrapper.find('li').removeClass('active');
    	wrapper.find('li:contains("' + selectValue + '")').addClass('active');
     	currentFeature.setProperties({ctrltype:selectValue});
    	});
    $('[id="CTRLID"]').change(function () {
    	selectValue = $(this).val();
     	currentFeature.setProperties({ctrlid:selectValue});
    	});
    $('[id="DESCRIPCION"]').change(function () {
    	selectValue = $(this).val();
    	text = selectValue.replace(/\n\r?/g, '<br>');
     	currentFeature.setProperties({
     		descripcion: text
     		});
    	});
	});