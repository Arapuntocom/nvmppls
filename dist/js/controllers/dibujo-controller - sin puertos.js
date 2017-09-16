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

	var graph = new joint.dia.Graph;

	var limitarMovimiento = joint.dia.ElementView.extend({

		pointermove: function(evt, x, y){ 	
			//$log.debug('cellView.isLink():'+this.model.isLink());
			var links = graph.getConnectedLinks(this.model, {'inbound':true}); //solo aquellos en que la celda es Target
			$log.debug("this: "+this.model.id);
			//$log.debug("links.length: "+links[0].id);

			if(links.length > 0){
				
				var cc = links[links.length-1].getSourceElement();
				var centerTarget = this.model.getBBox().center();

				if( cc != null){
					//var centroCC = cc.get('position');
					var centroCC = cc.getBBox().center();
					var etapaOrigen = links[0].get('attrs').text.etapaOrigen;
					var puntoFinal = g.point(x,y);
					// $log.debug("etapaOrigen: "+etapaOrigen);
					// $log.debug("BBoxCenterORIGEN ("+centroCC.x+", "+centroCC.y+")");
					// $log.debug("BBoxCenterTARGET("+centerTarget.x+", "+centerTarget.y+")");
					// $log.debug("try ("+puntoFinal.x+", "+puntoFinal.y+")");

					switch(etapaOrigen){
						case 'PETICION':
							if(x >= centroCC.x ){
								puntoFinal.x = centroCC.x;
							}
							if(y >= centroCC.y){
								puntoFinal.y = centroCC.y;
							}
							break;
						case 'NEGOCIACION':
							if(x <= (centroCC.x) ){
								puntoFinal.x = centroCC.x;
							}
							if(y >= centroCC.y){
								puntoFinal.y = centroCC.y;
							}
							break;
						case 'REALIZACION':
							if(x <= centroCC.x ){
								puntoFinal.x = centroCC.x;
							}
							if(y <= centroCC.y){
								puntoFinal.y = centroCC.y;
							}
							break;
						case 'SATISFACCION':
							if(x >= centroCC.x ){
								puntoFinal.x = centroCC.x;
							}
							if(y <= centroCC.y){
								puntoFinal.y = centroCC.y;
							}
							break;					
					}
					$log.debug("done ("+puntoFinal.x+", "+puntoFinal.y+")");
					joint.dia.ElementView.prototype.pointermove.apply(this, [evt, puntoFinal.x, puntoFinal.y]);

				}else{
					//$log.debug("LINK NO TIENE SOURCE");
					joint.dia.ElementView.prototype.pointermove.apply(this, [evt, x, y]);
				}
			}else{
				//$log.debug("NO TIENE LINKS");
				joint.dia.ElementView.prototype.pointermove.apply(this, [evt, x, y]);
			}
		}

	})

	var paper = new joint.dia.Paper({
		el: $('#miDiagrama'),
		width: 800,
		height: 500,
		model: graph,
		gridSize: 1,
		elementView: limitarMovimiento
	});

	var rect1 = new joint.shapes.basic.Rect({
		position: { x: 100, y: 100 },
		size: { width: 100, height: 30 },
		attrs: { rect: { fill: 'blue' }, text: { text: 'rect 1', fill: 'white' } }
	});

	var rect2 = new joint.shapes.basic.Rect({
		position: { x: 300, y: 60 },
		size: { width: 100, height: 30 },
		attrs: { rect: { fill: 'green' }, text: { text: 'rect 2', fill: 'white' } }
	});

	var rect3 = new joint.shapes.basic.Rect({
		position: { x: 600, y: 45 },
		size: { width: 100, height: 30 },
		attrs: { rect: { fill: 'purple' }, text: { text: 'rect 3', fill: 'white' } }
	});

	var link = new joint.dia.Enlace({
		source: { id: rect1.id },
		target: { id: rect2.id }
	});

	//graph.addCells([rect1, rect2, rect3, link]);

	$scope.rect1json = rect1.toJSON();
	$scope.rect2json = rect2.toJSON();
	$scope.linkjson = link.toJSON();

	// graph.on('all', function(eventName, cell) {
	// 	console.log(arguments);
	// })

	// rect1.on('change:position', function(element) {
	// 	console.log(element.id, ':', element.get('position'));
	// })



	$scope.newLink = function(){
		$log.debug("click on newLinkEP");		
		var linkEP = new joint.dia.Enlace({		
			source: { x: 10, y: 20 },
		    target: { x: 350, y: 20 },
		    'connector': { name: 'smooth' }
		});
		
		graph.addCell(linkEP);
		$scope.objeto = linkEP;
	}

	$scope.newLinkEx = function(){
		$log.debug("click on newLinkEE");
		var linkEE = new joint.dia.Enlace({
			source: { x: 10, y: 20 },
		    target: { x: 350, y: 20 },		    
		    attrs: {
		    	'.connection': {'stroke-dasharray': '5,2'},
		    	text:{
		    		'etapaOrigen': ''	
		    	}		    	
		    },
		    'connector': { name: 'smooth' }		   
		});
		
		/*
		linkEE.set('attrs', {
			'.connection': {'stroke-dasharray': '5,0'}
		});*/
		
		graph.addCell(linkEE);
		$scope.objeto = linkEE;

	}

	var cantCiclosConversacionales = 0;

	$scope.newCC = function(){
		$log.debug("new CC2");
		var nombre = 'ciclo_'+cantCiclosConversacionales;
		
		var idNova = '';
		if(cantCiclosConversacionales == 0){
			idNova = 'Main'
		}

		var nuevoCC2 = new joint.shapes.basic.CicloConversacional({
			//markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>', 
			position: { x: 120, y: 45 },
			size: { width: 134, height: 74 }, 
			etiquetas : {
				idNova: idNova,
				nombre: nombre
			}, 
			attrs: { 				
				// '.cliente': { text : "Cliente 1"},
				// '.realizador': { text : "Realiz 1"},
				// '.observador': { text : "Observador 1"},
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
			//markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>', 
			size: { width: 40, height: 40 },    
			
		});

		graph.addCell(nuevoAND2);

	}


/*
	$scope.newAND1 = function(){
		$log.debug("click on newAND");
		var newRect = new joint.shapes.basic.Image({
			markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>', 
			size: { width: 30, height: 30 },
			attrs: { 
				text: { text: 'AND', fill: 'black' },
				image: {
					'xlink:href': 'img/icons/novaplus-icons/agregacion1.svg',
					width: 80, 
					height: 80 
				}
			}
		});
		graph.addCell(newRect);
	}
*/

	//joint.mvc.View.setTheme('angular-material','../../bower_components/angular/angular-material/angular-material.css');
	
	$scope.newOR = function(){
		$log.debug("click on newOR");
		var newRhombus = new joint.shapes.basic.Or({
			position: { x: 110, y: 0 },
			size: { width: 40, height: 40 },
			attrs: { rhombus: {fill:'grease'}, text: { text: 'new OR', fill: 'black' } }
		});
		graph.addCell(newRhombus);
	}

	// $scope.paperPoint = paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });

	//element: $templateCache.get('js/view/context-menu/context-cc.html'),	

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
			case 'element basic CicloConversacional': 	     		
				$log.debug("switch contextmenu=CC -> "+evt.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName);
				RightClickMenuCtrlCC.open(evt);
				//$scope.$emit('ctxmnCC', evt);
				//alert("switch contextmenu=Image");
				break;

		}
	})

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
			case 'element basic CicloConversacional': 
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



	//link.on('change:source', function() { $log.debug('source of the link changed') })	
	//link.on('change:target', function() { $log.debug('target of the link changed') })	


	/*graph.on('change', function(cellView, evt, x, y){
		$scope.objeto = cellView;
		if(cellView.isLink()) $log.debug('graph-Link-change link.type-> ');	
		else $log.debug('graph-change cellView.type-> ');		
		
	})	*/


	graph.on('change:source', function(cellView){ //link
		$scope.cellViewLink = cellView;
		$scope.etapa = cellView.get('attrs').text.etapaOrigen;

		//$log.debug('graph-Link-change:SOURCE ');		
		if(cellView.get('source').id != null && cellView.previous('source').x != null){
			$log.debug('NUEVA SOURCE ->'+cellView.get('source').id);
			$log.debug('previous->'+cellView.previous('source').x+" , "+cellView.previous('source').y);

			//var puntoOrigen = cellView.getSourceElement().getBBox().center();
			var puntoOrigen = cellView.getSourceElement().get('position');

			//si este link ya tiene un target, se debe setear el idNova del target
			
			$log.debug("centerSource: "+puntoOrigen.x+" , "+puntoOrigen.y);

			if(cellView.previous('source').x < puntoOrigen.x && cellView.previous('source').y <= puntoOrigen.y){				
				cellView.set('attrs',{text : {'etapaOrigen':'PETICION'}});
				$log.debug("Set PETICION");
			}
			if(cellView.previous('source').x >= puntoOrigen.x && cellView.previous('source').y < puntoOrigen.y){				
				cellView.set('attrs',{text : {'etapaOrigen':'NEGOCIACION'}});
				$log.debug("Set NEGOCIACION");
			}
			if(cellView.previous('source').x > puntoOrigen.x && cellView.previous('source').y >= puntoOrigen.y){				
				cellView.set('attrs',{text : {'etapaOrigen':'REALIZACION'}});
				$log.debug("Set REALIZACION");
			}
			if(cellView.previous('source').x <= puntoOrigen.x && cellView.previous('source').y > puntoOrigen.y){
				cellView.set('attrs',{text : {'etapaOrigen':'SATISFACCION'}});
				$log.debug("Set SATISFACCION");
			}

		}	
		if(cellView.get('source').x != null && cellView.previous('source').id != null){
			$log.debug('DESCONECTAR SOURCE ->'+cellView.get('source').x);
			cellView.set('attrs',{text : {'etapaOrigen':''}});
		}			
	})	

	graph.on('change:target', function(cellView){
		$scope.cellViewLink = cellView;		
		

		//$log.debug('graph-Link-change:TARGET ');		
		if(cellView.get('target').id != null && cellView.previous('target').x != null){
			$log.debug('NUEVO TARGET ->'+cellView.get('target').id);

			var elementoOrigen = cellView.getSourceElement();
			if(elementoOrigen){ //tiene origen
				var letraDestino;
				var letraOrigen = elementoOrigen.get('etiquetas').idNova;
				$log.debug("source -> "+elementoOrigen.get('etiquetas').nombre+" idNova: "+letraOrigen);
				
				var cantEnlacesSalientesConectados = graph.getNeighbors(cellView.getSourceElement()).length;

				$log.debug("Origen tiene -> "+cantEnlacesSalientesConectados+" enlaces salientes Conectados");
				$log.debug("elementoOrigen.type -> "+elementoOrigen.get('type'));

				if(elementoOrigen.get('type') == 'basic.CicloConversacional'){ //si origen es ciclo conversacional, entonces agrega Letra
					letraDestino = String.fromCharCode(64+cantEnlacesSalientesConectados);						
				}else{ //origen es estacion de control, entonces agrega Numero
					letraDestino = cantEnlacesSalientesConectados;
				}		
				
				if(letraOrigen == 'Main'){
					letraDestino = ''+letraDestino;
				}else{
					letraDestino = ''+letraOrigen+letraDestino;
				}
				var cellTarget = graph.getCell(cellView.get('target').id);
				cellTarget.set('attrs',{'.idNova':{text: letraDestino}});
				cellTarget.set('etiquetas',{idNova: letraDestino});
			}

			//$scope.bbox = paper.findViewByModel(cellView.get('target').id).getBBox();
			$scope.bbox = paper.getModelById(cellView.get('target').id).getBBox();
			//$scope.bbox = paper.findView(cellView.get('target').id).getBBox();			
		}	
		if(cellView.get('target').id == null){
			//$log.debug('DESCONECTAR TARGET ->'+cellView.get('target').x);
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

	//on remove cell o link, es necesario renombrar los idNova de vecinos y sucesores

	graph.on('change:embeds',function(cellView){

		$log.debug('change:embeds cell ->'+cellView.id);
		// if(){ //si acaso es target de algún enlace
			
		// }
	})


	


	
	/* deshabilita el menu por defecto.
	$(document).on('contextmenu', function (e) {
	  return false;
	});*/

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