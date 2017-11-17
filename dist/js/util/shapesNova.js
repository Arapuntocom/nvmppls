var app = angular.module('ShapesNova', []);
app.factory('ShapesNova', function() {
  return {
    cicloConversacional : joint.shapes.basic.Generic.extend({
  		markup:'<g class="rotatable"><g class="scalable"><ellipse/><path class="left"/><path class="up"/><path class="right"/><path class="bottom"/></g><text class="nombre"/><text class="cliente"/><text class="realizador"/><text class="observador"/><text class="idNova"/></g>',
  		defaults: joint.util.deepSupplement({
  			type: 'cicloConversacional',
  			attrs:{
  				'ellipse':{
  					fill: '#ffffff',
  					stroke: '#000000',
  					rx: 60,
  					ry: 30
  				},
  				'path.left':{ stroke: '#000000', d: 'M-65 0 h 10 L -60 6 z'},
  				'path.up':{ stroke: '#000000', d: 'M0 -35 v 10 L 6 -30 z'},
  				'path.right':{ stroke: '#000000', d: 'M55 0 h 10 L 60 6 z'},
  				'path.bottom':{ stroke: '#000000', d: 'M0 25 v 10 L -6 30 z'},
  				'.nombre': {
  					'ref': 'ellipse',
            'ref-x': '50%',
            'ref-y': '50%',
            'x-alignment': 'middle',
            'y-alignment': 'middle'
          },
  	      '.cliente':{
            'ref': 'path.left',
            'ref-x': '-5%',
            'ref-y': '50%',
            'x-alignment': 'right',
            'y-alignment': 'middle'
  	      },
  	      '.realizador':{
            'ref':'path.right',
            'ref-x': '105%',
            'ref-y': '50%',
  					'x-alignment': 'left',
  					'y-alignment': 'middle'
  	      },
  	      '.observador':{
  					'ref': 'path.bottom',
            'ref-x': '50%',
            'ref-y': '130%',
            'x-alignment': 'middle',
            'y-alignment': 'up'
  	      },
  	      '.idNova':{
            'ref': 'ellipse',
            'ref-x': '-5%',
            'ref-y': '-5%',
            'x-alignment': 'left',
            'y-alignment': 'middle',
            fill: '#bfbfbf'
  	      }
  			}
  		})
    }),

    estacionAnd : joint.shapes.basic.Generic.extend({
      markup: '<g class="rotatable"><g class="scalable"><circle/><path class="vertical"/><path class="horizontal"/></g><text class="idNova"/></g>',
      defaults: joint.util.deepSupplement({
        type: 'estacionAnd',
        size: { width: 35, height: 35 },
        attrs: {
          'circle': {
            fill: '#ffffff',
            stroke: '#000',
            r: 12,
            cx: 0,
            cy: 0
          },
          '.idNova': {
            'ref': 'circle',
            'ref-x': '-25%',
            'ref-y': '-25%',
            'x-alignment': 'left',
            'y-alignment': 'middle',
            fill: '#bfbfbf'
          },
          'path.vertical':{ stroke: '#000000', d: 'M0 -4 v 8 '},
          'path.horizontal':{stroke: '#000000', d: 'M-4 0 h 8 '}
        }
      })
    }),

    estacionOr : joint.shapes.basic.Generic.extend({
      markup: '<g class="rotatable"><g class="scalable"><path class="rombo"/></g><text class="idNova"/><text class="condiciones"/></g>',
      defaults: joint.util.deepSupplement({
        type: 'estacionOr',
        size: { width: 35, height: 35 },
        attrs:{
          'path.rombo': { stroke: '#000000', d: 'M 30 0 L 60 30 30 60 0 30 z', fill: '#ffffff'},
          '.idNova': {
            'ref': 'path.rombo',
            'ref-x': '-25%',
            'ref-y': '-25%',
            'x-alignment': 'left',
            'y-alignment': 'middle',
            fill: '#bfbfbf'
          },
          '.condiciones': {
            'ref': 'path.rombo',
            'ref-x': '115%',
            'ref-y': '115%',
            'x-alignment': 'left',
            'y-alignment': 'middle',
            fill: '#000000'
          }
        }
      })
    }),

    enlace: joint.dia.Link.extend({
        defaults: {
          type: 'enlace',
          attrs:{
            text:{
              'etapaOrigen':'',
              'etapaDestino':'',
              'rotulo': '',
    	    		'tipoEnlace': '',
    	    		'mostrarRotulo' : true
            }
          }
        },
        arrowheadMarkup: [
          '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
            '<circle class="marker-arrowhead" end="<%= end %>" r="3" fill="green" stroke="green"/>',
          '</g>'
        ].join('')
    })
  }
});
