const centerMap = { lat: 37.41361589, lng: -122.07342005 }

function initLeafMap () {
    var baseLayers = {
      'satelite' : new L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 22,
          subdomains:['mt0','mt1','mt2','mt3']
           }),
      'street':  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
          maxZoom: 22,
          subdomains:['mt0','mt1','mt2','mt3']
          })
    }
    
    var map = L.map('map',{
      center : [centerMap.lat, centerMap.lng],
      zoom: 17,
      layers: [
          baseLayers.satelite
        ]
  });

  marker = L.marker([centerMap.lat, centerMap.lng]).addTo(map);

  //Control de mapas base
L.Control.Custom = L.Control.Layers.extend({
    options:{
        position: 'topleft'
    },
    onAdd: function () {
          this._initLayout();
          this._update();
          return this._container;
      }
  });

  new L.Control.Custom(baseLayers).addTo(map);