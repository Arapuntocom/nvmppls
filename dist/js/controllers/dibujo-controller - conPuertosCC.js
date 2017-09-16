'use strict';

angular.module('dibujo', ['ngRoute', 'ui.router','ngMaterial', 'md.data.table', 'ngContextMenu'])

.controller('DibujoController', function($scope, $timeout, $mdSidenav, $log, $mdDialog, $document, contextMenu, $mdMenu, $rootScope, $compile) {
	$log.debug("DibujoController is here!!!");
	$scope.toggleTree = buildDelayedToggler('tree');
	$scope.toggleModelo = buildToggler('propertiesNav');
	$scope.toggleCC = buildToggler('CCNav');
	$scope.toggleEnlace = buildToggler('enlaceNav');
	$scope.toggleCondicional = buildToggler('condNav');

	$scope.message = "msj";

	$scope.w1 = {cliente : ''};	


	$scope.fijar = function(){
		if($scope.blocked == true){
			$scope.blocked = false;
		}
		else{
			$scope.blocked = true;
		}
	}

	$scope.blocked = true;
	
	$scope.enlace = {
		'rotulo': ""
	};

	$scope.users = ['Scooby Doo','Shaggy Rodgers','Fred Jones','Daphne Blake','Velma Dinkley'];

	$scope.variable = null;
	$scope.variables = null;
	$scope.loadVariables = function() {
		// Use timeout to simulate a 650ms request.
		return $timeout(function() {
			$scope.variables =  $scope.variables  || [
				{ 'id': 1, 'nombre': 'UF', 'tipo':'Número', 'largo':'32', 'formato':'n/a', 'valorInicial':'25000' }
			];
		}, 650);
	};

	$scope.condiciones = [{'var':"Var1", 'cond':"==", 'exp':"Var3"}];


	$scope.isOpenRight = function(navID){
		return $mdSidenav(navID).isOpen();
	};
	/**
	 * Supplies a function that will continue to operate until the
	 * time is up.
	 */
	function debounce(func, wait, context) {
		var timer;
		return function debounced() {
			var context = $scope,
			args = Array.prototype.slice.call(arguments);
			$timeout.cancel(timer);
			timer = $timeout(function() {
				timer = undefined;
				func.apply(context, args);
			}, wait || 10);
		};
	}
	/**
	 * Build handler to open/close a SideNav; when animation finishes
	 * report completion in console
	 */
	function buildDelayedToggler(navID) {
		return debounce(function() {
		// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				$log.debug("toggle " + navID + " is done");
			});
		}, 200);
	}

	function buildToggler(navID) {
		return function() {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				$log.debug("toggle " + navID + " is done");
			});
		}
	}

	$scope.close = function (navID) {
	  // Component lookup should always be available since we are not using `ng-if`
		$mdSidenav(navID).close()
		.then(function () {
			$log.debug("close navID is done");
		});
	};


	$scope.showPrompt = function(ev) {
	// Appending dialog to document.body to cover sidenav in docs app
		$mdDialog.show({
			controller: DialogController,
			templateUrl: '/view/panel-conditions.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
		  $scope.status = 'You said the information was "' + answer + '".';
		}, function() {
		  $scope.status = 'You cancelled the dialog.';
		});
	};

	$scope.showNewVar = function(ev) {
	// Appending dialog to document.body to cover sidenav in docs app
		$mdDialog.show({
			controller: DialogController,
			templateUrl: '/view/panel-new-var.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
			$scope.status = 'You said the information was "' + answer + '".';
		}, function() {
			$scope.status = 'You cancelled the dialog.';
		});
	};


	function DialogController($scope, $mdDialog) {
		$scope.hide = function() {
			$mdDialog.hide();
		};
		$scope.cancel = function() {
			$mdDialog.cancel();
		};
		$scope.answer = function(answer) {
			$mdDialog.hide(answer);
		};
	}


	var dateCellPointerDown;
	var dateCellPointerUp;

	var cantCiclosConversacionales = 0;
	var tipoEnlace, pointStickOrigen, pointStickDestino, portIdOrigen, portIdDestino;
	var cicloConversacionalOrigen = null;
	var cicloConversacionalDestino = null;
	var esperarCiclosConversacionales = false;

	var graph = new joint.dia.Graph;

	var graphElementView = joint.dia.ElementView.extend({

		pointerdown: function(evt, x, y){
			dateCellPointerDown = new Date();
			$log.debug("dateCellPointerDown: "+dateCellPointerDown);

			//obtener celda y punto donde se ubicará el puerto 
			var thisCell = graph.getCell(this.model.id);
			$log.debug("cell type: "+thisCell.get('type'));			

			if(esperarCiclosConversacionales && thisCell.get('type') =='basic.CicloConversacional'){
				//calcular punto para ubicar el puerto
				//obtenemos la cordenada más cercana al punto presionado con respecto a la elipse
				var ellipse = g.ellipse(thisCell.get('position'), 60, 30);
				//var ellipse = g.ellipse(thisCell.get('position'), thisCell.get('size').width / 2, thisCell.get('size').height / 2);
				var pointStick = ellipse.intersectionWithLineFromCenterToPoint(g.point(x,y));
				pointStick= g.point(pointStick.x - thisCell.get('position').x, pointStick.y - thisCell.get('position').y)
				$log.debug('pointStick: '+pointStick);

				if (!cicloConversacionalOrigen){
					cicloConversacionalOrigen = thisCell;	
					pointStickOrigen = 	pointStick;	
					portIdOrigen = ''+cicloConversacionalOrigen.id+'-'+Math.random();
		
					crearPortInElement(portIdOrigen, 'out', pointStickOrigen, cicloConversacionalOrigen);
							
				}else{
					cicloConversacionalDestino = thisCell;
					pointStickDestino = pointStick;
					portIdDestino = ''+cicloConversacionalDestino.id+'-'+Math.random();
		
					crearPortInElement(portIdDestino, 'in', pointStickDestino, cicloConversacionalDestino);
					
					//ya que estan seteados ambos puertos, se crea el enlace
					crearEnlace();
				}
			}
			joint.dia.ElementView.prototype.pointerdown.apply(this, [evt, x, y]);
		},
		pointerup: function(evt, x, y){
			dateCellPointerUp = new Date();
			$log.debug("dateCellPointerUp: "+dateCellPointerUp);
			joint.dia.ElementView.prototype.pointerup.apply(this, [evt, x, y]);
		},

		// pointermove: function(evt, x, y){ 	
		// 	//$log.debug('cellView.isLink():'+this.model.isLink());
		// 	var links = graph.getConnectedLinks(this.model, {'inbound':true}); //solo aquellos en que la celda es Target
			
			

		// 	if(links.length > 0){ //si la celda tiene enlaces entrantes
		// 		$log.debug("PM mueve celda con enlace entrante");
		// 		var cc = links[links.length-1].getSourceElement(); //pregunta por el origen del enlace para luego limitar el movimiento
		// 		var centerTarget = this.model.getBBox().center(); // toma la posición de este elemento (target del enlace)

		// 		var puntoFinal = g.point(x,y); // punto al que se traslada este elemento

		// 		/* adicionalmente, es necesario mover el target del enlace */
		// 		// var puntoTargetPrevio = links[0].get('targetPoint');
				
		// 		// links[0].transition('target', { x: puntoTargetPrevio.x + x, y: puntoTargetPrevio.y + y }, {
		// 		//     delay: 0,
		// 		//     duration: (dateCellPointerUp.getTime() - dateCellPointerDown.getTime()),
		// 		//     timingFunction: joint.util.timing.bounce,
		// 		//     valueFunction: joint.util.interpolate.object
		// 		// });


		// 		if( cc != null){ //si el origen del enlace es un ciclo conversacional
		// 			//var centroCC = cc.get('position');
		// 			var centroCC = cc.getBBox().center(); //obtenemos el origen de este ciclo conversacional en el origen del enlace para usarlo como referencia en la limitación de movimiento
		// 			var etapaOrigen = links[0].get('attrs').text.etapaOrigen; //obtenemos la etapa de origen 
					
		// 			// $log.debug("etapaOrigen: "+etapaOrigen);
		// 			// $log.debug("BBoxCenterORIGEN ("+centroCC.x+", "+centroCC.y+")");
		// 			// $log.debug("BBoxCenterTARGET("+centerTarget.x+", "+centerTarget.y+")");
		// 			// $log.debug("try ("+puntoFinal.x+", "+puntoFinal.y+")");

		// 			// switch(etapaOrigen){
		// 			// 	case 'PETICION':
		// 			// 		if(x >= centroCC.x ){
		// 			// 			puntoFinal.x = centroCC.x;
		// 			// 		}
		// 			// 		if(y >= centroCC.y){
		// 			// 			puntoFinal.y = centroCC.y;
		// 			// 		}
		// 			// 		break;
		// 			// 	case 'NEGOCIACION':
		// 			// 		if(x <= (centroCC.x) ){
		// 			// 			puntoFinal.x = centroCC.x;
		// 			// 		}
		// 			// 		if(y >= centroCC.y){
		// 			// 			puntoFinal.y = centroCC.y;
		// 			// 		}
		// 			// 		break;
		// 			// 	case 'REALIZACION':
		// 			// 		if(x <= centroCC.x ){
		// 			// 			puntoFinal.x = centroCC.x;
		// 			// 		}
		// 			// 		if(y <= centroCC.y){
		// 			// 			puntoFinal.y = centroCC.y;
		// 			// 		}
		// 			// 		break;
		// 			// 	case 'SATISFACCION':
		// 			// 		if(x >= centroCC.x ){
		// 			// 			puntoFinal.x = centroCC.x;
		// 			// 		}
		// 			// 		if(y <= centroCC.y){
		// 			// 			puntoFinal.y = centroCC.y;
		// 			// 		}
		// 			// 		break;					
		// 			// }

		// 			$log.debug("done ("+puntoFinal.x+", "+puntoFinal.y+")");
					
		// 			joint.dia.ElementView.prototype.pointermove.apply(this, [evt, puntoFinal.x, puntoFinal.y]);

		// 		}else{
		// 			$log.debug("PM LINK NO TIENE SOURCE");
					
		// 			joint.dia.ElementView.prototype.pointermove.apply(this, [evt, x, y]);
		// 		}
		// 	}else{
		// 		$log.debug("PM mueve celda sin enlace entrante");
		// 		var celda = graph.getCell(this.model.id);
		// 		$scope.celda = celda;
		// 		if(celda.isLink()){
		// 			$log.debug("PM mueve enlace");
		// 		}
		// 		joint.dia.ElementView.prototype.pointermove.apply(this, [evt, x, y]);
		// 	}
		// }	

	});

	
	var paper = new joint.dia.Paper({
		el: $('#miDiagrama'),
		width: 800,
		height: 500,
		model: graph,
		gridSize: 1,
		elementView: graphElementView,
    	linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
	});
	
	
    var crearPortInElement = function(id, group, position, element){
    	var port = {
    		markup: '<g><circle r="3" fill="red" stroke="red"/></g>',
	        id: id,
	        group: group,
	        args: {	        	
		        x: position.x,
		        y: position.y,	        	
	    	}    
	        
    	};
    	element.addPort(port);
    }
	

	$scope.agregarEnlace = function(tipo){
		$log.debug("click on newLinkEP");
		tipoEnlace = tipo;	
		cicloConversacionalOrigen = null;
		cicloConversacionalDestino = null;
		esperarCiclosConversacionales = true;	
	}

	var etapaCiclo = function(pointStick){
		if(pointStick.x < 0 && pointStick.y < 0){
			return 'PETICION';
		}
		if(pointStick.x >= 0 && pointStick.y < 0){
			return 'NEGOCIACION';
		}
		if(pointStick.x > 0 && pointStick.y > 0){
			return 'REALIZACION';
		}
		if(pointStick.x <= 0 && pointStick.y > 0){
			return 'SATISFACCION';
		}
	}

	var crearEnlace =  function(){
		$log.debug("creando enlace");
		
		var etapaOrigen = etapaCiclo(pointStickOrigen);
		
		var etapaDestino = etapaCiclo(pointStickDestino);

		var enlace = new joint.dia.Enlace({
			source: { id: cicloConversacionalOrigen.id, port: portIdOrigen },
		    target: { id: cicloConversacionalDestino.id, port: portIdDestino },		    
		    attrs: {
		    	text:{
		    		'etapaOrigen': etapaOrigen,
		    		'etapaDestino': etapaDestino	
		    	}		    	
		    },
		    'connector': { name: 'smooth' }
		})
		if(tipoEnlace == 'excepcion'){
			enlace.set('attrs',{'.connection': {'stroke-dasharray': '5,2'}});
		}
		graph.addCell(enlace);
		
		cicloConversacionalOrigen = null;
		cicloConversacionalDestino = null;
		esperarCiclosConversacionales = false;
	};


	

	$scope.newCC = function(){
		$log.debug("new CC2");
		var nombre = 'ciclo_'+cantCiclosConversacionales;
		
		var idNova = '';
		if(cantCiclosConversacionales == 0){
			idNova = 'Main'
		}

		var nuevoCC2 = new joint.shapes.basic.CicloConversacional({
			position: { x: 120, y: 45 },
			size: { width: 134, height: 74 }, 
			etiquetas : {
				idNova: idNova,
				nombre: nombre
			}, 
			attrs: { 				
				'.idNova': { text : idNova},
				'.nombre': { text : nombre}							
			}  			
		});

		graph.addCell(nuevoCC2);
		cantCiclosConversacionales++;
		//$scope.objeto = nuevoCC2;
	}

	$scope.newAND = function(){
		$log.debug("new CC2");
		var nuevoAND2 = new joint.shapes.basic.And({
			size: { width: 40, height: 40 },  
			etiquetas : {
				idNova: '',
				nombre: ''
			}			
		});
		graph.addCell(nuevoAND2);

	}

	$scope.newOR = function(){
		$log.debug("click on newOR");
		var newRhombus = new joint.shapes.basic.Or({
			position: { x: 110, y: 0 },
			size: { width: 40, height: 40 },
			etiquetas : {
				idNova: '',
				nombre: ''
			}, 
			attrs: { rhombus: {fill:'grease'}, text: { text: 'new OR', fill: 'black' } }
		});
		graph.addCell(newRhombus);
	}


	$scope.setRolCliente = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.set('attrs',{'.cliente': { text : $scope.w1.cliente.name}});
		celda.set('etiquetas',{'cliente': $scope.w1.cliente.name});
	}

	$scope.setRolRealizador = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.set('attrs',{'.realizador': { text : $scope.w1.realizador.name}});
		celda.set('etiquetas',{'realizador': $scope.w1.realizador.name});
	}

	$scope.setRolObservador = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.set('attrs',{'.observador': { text : $scope.w1.observador.name}});
		celda.set('etiquetas',{'observador': $scope.w1.observador.name});
	}

	$scope.setNombreCC = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.set('attrs',{'.nombre': { text : $scope.w1.name}});
		celda.set('etiquetas',{'nombre': $scope.w1.name});
	}

	

	paper.on('cell:pointerdblclick ', function(cellView, evt, x, y) { 
		//$scope.objeto = cellView;

		//$log.debug('cell:pointerdblclick cellView.type-> '+cellView.model.toJSON().type);
		//var type = cellView.className();

		$log.debug('cell:pointerdblclick cellView.className-> '+cellView.className());
		var type = cellView.className();
		
		switch(type){
			case 'cell type-basic type-basic-cicloconversacional element': 
				$scope.cellViewCC = graph.getCell(cellView.model.id);
								
				var etiquetas = $scope.cellViewCC.get('etiquetas');

				$scope.w1 = { 
					idNova : etiquetas.idNova || 'no definido',
					name:  etiquetas.nombre || 'no definido',
					cliente: etiquetas.cliente  || 'no definido',
					realizador: etiquetas.realizador || 'no definido',
					observador: etiquetas.observador || 'no definido'
				};
				$scope.toggleCC();
				break;
		}
	})

	

	graph.on('change:vertices', function(cellView){
		$scope.cellViewLink = cellView;
	})

	graph.on('change:position',function(cellView){
		$scope.objeto = cellView;	
		$scope.objetoPosition = cellView.get('position');
		$scope.objetoCenter = cellView.getBBox().center();
		//$log.debug('change:position cell ->'+cellView.id + " x: " + cellView.get('position').x + " ,y: "+cellView.get('position').y );

	})

	//OJO ! on remove cell o link, es necesario renombrar los idNova de vecinos y sucesores


var vm = this;

	$rootScope.alerta = function(){
		alert("enviada por-> ");
	};
	
	var customMenuCC = angular.element('<div class="md-open-menu-container md-whiteframe-z2">'+
					'<md-menu-content>'+
						'<md-menu-item>'+
							'<button onclick="alerta()" aria-label="delete element" >'+
								'Eliminar CC'+
							'</button>'+
						'</md-menu-item>'+
						'<md-menu-item>'+
							'<md-button aria-label="atributos element" ng-click="toggleCC()">'+
								'Ver atributos CC'+
							'</md-button>'+
						'</md-menu-item>'+
					'</md-menu-content>'+
					'</div>');
	
	var RightClickMenuCtrlCC = {
		open: function(event) {
			$mdMenu.show({
				scope: $rootScope.$new(),
				mdMenuCtrl: RightClickMenuCtrlCC,
				element: customMenuCC,
				target: event.target // used for where the menu animates out of
			});
		}, 
		close: function() { $mdMenu.hide(); },
		positionMode: function(x,y) { return { left: 'target', top: 'target' }; },
		offsets: function() { return { top: 0, left: 0 }; }
	};


	$scope.$on('ctxmnCC', function(event) {
    	console.log('Sadface + '); // outputs Sadface
    	RightClickMenuCtrlCC.open('event');
  	});


	var myCustomMenu = angular.element('<div class="md-open-menu-container md-whiteframe-z2">'+
					'<md-menu-content>'+
						'<md-menu-item>'+
							'<md-button aria-label="delete element">'+
								'Eliminar'+
							'</md-button>'+
						'</md-menu-item>'+
						'<md-menu-item>'+
							'<md-button aria-label="atributos element">'+
								'Ver atributos'+
							'</md-button>'+
						'</md-menu-item>'+
					'</md-menu-content>'+
					'</div>');
	
	var RightClickMenuCtrl = {
		open: function(event) {
			$mdMenu.show({
				scope: $rootScope.$new(),
				mdMenuCtrl: RightClickMenuCtrl,
				element: myCustomMenu,
				target: event.target // used for where the menu animates out of
			});
		}, 
		close: function() { $mdMenu.hide(); },
		positionMode: function() { return { left: 'target', top: 'target' }; },
		offsets: function() { return { top: 0, left: 0 }; }
	};


	paper.on('cell:contextmenu', function(cellView, evt, x, y) { 
		// $(document).on('contextmenu', function (evt) {
		// 	return false;
		// })

		$log.debug('cell:contextmenu cellView.id-> '+cellView.id);	   

		var type = cellView.className();

		$log.debug('cell:contextmenu cellView.type-> '+type);
		
		switch(type){
			case 'element basic Rect': 	     		
				$log.debug("switch contextmenu=Rect");
				//cmcc(cellView, x,y);
				//alert("switch contextmenu=Rect");
				RightClickMenuCtrlCC.open(evt);
				break;
			case 'link':
				$log.debug("switch contextmenu=link");
				RightClickMenuCtrl.open(evt);
				break;
			case 'cell type-basic type-basic-cicloconversacional element': 	     		
				$log.debug("switch contextmenu=CC -> "+evt.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName);
				RightClickMenuCtrlCC.open(evt);
				//$scope.$emit('ctxmnCC', evt);
				//alert("switch contextmenu=Image");
				break;

		}
	})
	

	/*
	$scope.openAsPNG = function() {

            this.paper.toPNG(function(dataURL) {
                new joint.ui.Lightbox({
                    title: '(Right-click, and use "Save As" to save the diagram in PNG format)',
                    image: dataURL
                }).open();
            }, { padding: 10 });
        }
	*/

})


.controller('SelectAsyncRolController', function($timeout, $scope) {
	$scope.user = null;
	$scope.users = null;
	$scope.loadUsers = function() {
	// Use timeout to simulate a 650ms request.
		return $timeout(function() {
		  $scope.users =  $scope.users  || [
			{ id: 1, name: 'Scooby Doo' },
			{ id: 2, name: 'Shaggy Rodgers' },
			{ id: 3, name: 'Fred Jones' },
			{ id: 4, name: 'Daphne Blake' },
			{ id: 5, name: 'Velma Dinkley' }
		  ];
		}, 650);
	};
})

.controller('SelectAsyncPtoEnterController', function($timeout, $scope) {
	$scope.pto = null;
	$scope.ptos = null;
	$scope.loadPuntos = function() {
	// Use timeout to simulate a 650ms request.
		return $timeout(function() {
		  $scope.ptos =  $scope.ptos  || [
			{ id: 1, name: 'Preparación' },
			{ id: 2, name: 'Negociación' },
			{ id: 3, name: 'Realización' },
			{ id: 4, name: 'Satisfacción' }
		  ];
		}, 650);
	};
});