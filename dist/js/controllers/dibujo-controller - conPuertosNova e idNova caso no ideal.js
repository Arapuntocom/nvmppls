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
	var celdaPresionada;

	var cantCiclosConversacionales = 0;
	var tipoEnlace, pointStickOrigen, pointStickDestino, portIdOrigen, portIdDestino;
	var estacionOrigen = null;
	var estacionDestino = null;
	var esperarEstaciones = false;

	var graph = new joint.dia.Graph;

	var determinarStickPoint = function(thisCell, x, y){
		var type = thisCell.get('type');
		var pointStick;

		switch(type){
			case 'basic.CicloConversacional':
				//calcular punto para ubicar el puerto
				//obtenemos la cordenada más cercana al punto presionado con respecto a la elipse
				var ellipse = g.ellipse(thisCell.get('position'), 60, 30);
				//var ellipse = g.ellipse(thisCell.get('position'), thisCell.get('size').width / 2, thisCell.get('size').height / 2);
				pointStick = ellipse.intersectionWithLineFromCenterToPoint(g.point(x,y));
				pointStick= g.point(pointStick.x - thisCell.get('position').x, pointStick.y - thisCell.get('position').y);
				break;
			case 'basic.And':
				var circle = g.ellipse(thisCell.get('position'), thisCell.get('size').width / 2, thisCell.get('size').height / 2);
				pointStick = circle.intersectionWithLineFromCenterToPoint(g.point(x,y));
				pointStick = g.point(pointStick.x - thisCell.get('position').x, pointStick.y - thisCell.get('position').y);
				break;
			case 'basic.Or':
				var rect = g.rect(thisCell.get('position').x, thisCell.get('position').y, thisCell.get('size').width / 2, thisCell.get('size').height / 2);
				pointStick = rect.intersectionWithLineFromCenterToPoint(g.point(x,y));
				$log.debug('pointStick prev Or: '+pointStick);
				pointStick = g.point(pointStick.x - thisCell.get('position').x, pointStick.y - thisCell.get('position').y);
				break;
		}
		$log.debug('pointStick: '+pointStick);
		return pointStick;
	}

	var graphElementView = joint.dia.ElementView.extend({

		pointerdown: function(evt, x, y){
			dateCellPointerDown = new Date();
			$log.debug("dateCellPointerDown: "+dateCellPointerDown);
			celdaPresionada = graph.getCell(this.model.id);
			$scope.celdaPressDown = celdaPresionada;
			
			
			if(esperarEstaciones){
				//obtener celda y punto donde se ubicará el puerto (el punto depende de la celda)
				var thisCell = graph.getCell(this.model.id);
				var type = thisCell.get('type');
				var pointStick = determinarStickPoint(thisCell, x, y);			
				

				if (!estacionOrigen){
					estacionOrigen = thisCell;	
					pointStickOrigen = 	pointStick;	
					portIdOrigen = ''+estacionOrigen.id+'-'+Math.random();
		
					crearPortInElement(portIdOrigen, 'out', pointStickOrigen, estacionOrigen);
							
				}else{
					estacionDestino = thisCell;
					pointStickDestino = pointStick;
					portIdDestino = ''+estacionDestino.id+'-'+Math.random();
		
					crearPortInElement(portIdDestino, 'in', pointStickDestino, estacionDestino);
					
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
		estacionOrigen = null;
		estacionDestino = null;
		esperarEstaciones = true;	
	}

	var setearIdsNova = function(cellOrigen){
		var idNovaDestino, idNovaOrigen, cellDestino;

		var arrayPuertosOrigen = cellOrigen.getPorts();
		var arrayPuertosOrigenOut = [];

		for(var i =0; i<arrayPuertosOrigen.length; i++){
			if(arrayPuertosOrigen[i].group == 'out'){
				//cantEnlacesSalientesConectados++;
				arrayPuertosOrigenOut.push(arrayPuertosOrigen[i]);
			}
		}

		$log.debug("cantArrayPuertosOrigenOut -> "+arrayPuertosOrigenOut.length);

		var puntoCentroOrigen = g.point(cellOrigen.get('position').x, cellOrigen.get('position').y);
		arrayPuertosOrigenOut.sort(function(a,b){
			var puntoPortA = g.point(a.args.x, a.args.y);
			var puntoPortB = g.point(b.args.x, b.args.y);
			var thetaA = puntoCentroOrigen.theta(puntoPortA)-180;
			var thetaB = puntoCentroOrigen.theta(puntoPortB)-180;
			if(thetaA > thetaB){
				return -1;
			}
			if(thetaA < thetaB){
				return 1;
			}
			return 0;
		});

		//var arraySucesores = graph.getSuccessors(cellOrigen);
		var arraySucesores = graph.getNeighbors(cellOrigen, {'outbound' : true});
		$log.debug("arraySucesores.length: "+arraySucesores.length);

		idNovaOrigen = cellOrigen.get('etiquetas').idNova != 'Main' ? cellOrigen.get('etiquetas').idNova : '';
		$log.debug("idNovaOrigen: "+idNovaOrigen);
		

		for(var i =0; i<arrayPuertosOrigenOut.length; i++){
			for(var j = 0; j<arraySucesores.length; j++){
				var source = [];
				source = graph.getPredecessors(arraySucesores[j]); 
				if(source.length>0 && source[0].get('ports').id == arrayPuertosOrigenOut.id){
				//if(arraySucesores[j].get().hasPort(arrayPuertosOrigenOut[i].id)){
					if(cellOrigen.get('type') == 'basic.CicloConversacional'){
						idNovaDestino = idNovaOrigen+String.fromCharCode(64+j+1);
					}else{
						idNovaDestino = idNovaOrigen+''+(j+1);
					}
					$log.debug("idNovaDestino: "+idNovaDestino);
					arraySucesores[j].set('attrs',{'.idNova':{text: idNovaDestino}});
					arraySucesores[j].set('etiquetas',{idNova: idNovaDestino});
					setearIdsNova(arraySucesores[j]);
				}
			}
			
		}
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
			source: { id: estacionOrigen.id, port: portIdOrigen },
		    target: { id: estacionDestino.id, port: portIdDestino },		    
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

		setearIdsNova(estacionOrigen);		
		
		estacionOrigen = null;
		estacionDestino = null;
		portIdOrigen = null;
		portIdDestino = null;
		esperarEstaciones = false;

		enlace.on('change:source change:target',function(){
			
			if(enlace.get('source').port == null && enlace.get('source').x != null){
				$log.debug('source of the link changed, puerto desconectado');	
				var celdaSource = graph.getCell(enlace.previous('source').id);
				if(celdaSource && celdaSource.hasPort(enlace.previous('source').port)){
					celdaSource.removePort(enlace.previous('source').port);
					//renombrar vecinos y sucesores de ellos
					setearIdsNova(celdaSource);
				}					
			}
			if(enlace.get('target').port == null && enlace.get('target').x != null){
				$log.debug('target of the link changed, puerto desconectado');	
				var celdaTarget = graph.getCell(enlace.previous('target').id);
				if(celdaTarget && celdaTarget.hasPort(enlace.previous('target').port)){
					celdaTarget.removePort(enlace.previous('target').port);
					//renombrar vecinos y sucesores
					if(enlace.get('source').id != null){
						setearIdsNova(graph.getCell(enlace.get('source').id));
					}					
				}				
			}

			if(enlace.get('source').port == null && enlace.get('source').id != null){
				$log.debug('source of the link changed, puerto reconectado');	
				//volver a calcular punto más cercano al elemento, poner allí el puerto y setearlo al enlace,
				//no olvidar setear etapa
				//adicionalmente es necesario renombrar todos los idNova sucesores al origen y vecinos
				var nuevoOrigen = graph.getCell(enlace.get('source').id);
				var pointStick = determinarStickPoint(nuevoOrigen, enlace.previous('source').x, enlace.previous('source').y);
				var id = ''+nuevoOrigen.id+'-'+Math.random();
				crearPortInElement(id, 'out', pointStick, nuevoOrigen);
				enlace.set('source', {'id': nuevoOrigen.id, 'port': id});				
				if(graph.getCell(enlace.get('target').id).get('type') == 'basic.CicloConversacional'){
					enlace.set('etiquetas',{text:{'etapaOrigen': etapaCiclo(pointStick)}});
				}				
				setearIdsNova(nuevoOrigen);
				

			}
			if(enlace.get('target').port == null && enlace.get('target').id != null){
				$log.debug('target of the link changed, puerto reconectado');
				var nuevoDestino = graph.getCell(enlace.get('target').id);
				var pointStick = determinarStickPoint(nuevoDestino, enlace.previous('target').x, enlace.previous('target').y);
				var idPortDestino = ''+enlace.get('target').id+'-'+Math.random();
				crearPortInElement(idPortDestino, 'in', pointStick, nuevoDestino);
				enlace.set('target', {'id': nuevoDestino.id,'port': idPortDestino});				
				if(nuevoDestino.get('type') == 'basic.CicloConversacional'){
					enlace.set('etiquetas',{text:{'etapaDestino': etapaCiclo(pointStick)}});
				}
				if(enlace.get('source').port){ //si el enlace tiene un origen
					setearIdsNova(graph.getCell(enlace.get('source').id));
				}
				
				//volver a calcular punto más cercano al elemento, poner allí el puerto y setearlo al enlace,
				//no olvidar setear etapa
				//adicionalmente es necesario renombrar todos los idNova sucesores al origen
			}
			
		})
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
			position: { x: 100, y: 0 },
			size: { width: 20, height: 20},  
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
			size: { width: 20, height: 20 },
			etiquetas : {
				idNova: '',
				nombre: ''
			}, 
			attrs: { 				
				'.idNova': { text : ''}						
			}
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

	var removerElemento = function(elemento){
		elemento.remove(); // desencadena graph.on('remove'...
	}

	$(document).keyup(function(tecla) { //si se presiona la {tecla} 
		if(tecla.keyCode == 27){ //al presionar tecla escape
			esperarEstaciones = false;
			if(estacionOrigen != null){
				estacionOrigen.removePort(portIdOrigen);
			}
			estacionOrigen = null;
			estacionDestino = null;
			portIdOrigen = null;
			portIdDestino = null;
		}
		if(tecla.keyCode == 46){ //al presionar tecla delete (Supr)
			removerElemento(celdaPresionada); // funcion q desencadena graph.on('remove'...
		}
		
	});
	
	graph.on('remove', function(cell) {     	
    	if(cell.isLink()){ //si se removió el enlace, entonces removemos los puertos asociados
    		alert('Link:remove with id ' + cell.id + ' remove to the graph.');
    		var celdaOrigen = graph.getCell(cell.get('source').id);
    		var celdaDestino = graph.getCell(cell.get('target').id);
    		if(celdaOrigen.hasPort(cell.get('source').port)){
    			celdaOrigen.removePort(cell.get('source').port);
    			setearIdsNova(celdaOrigen);
    		}
    		if(celdaDestino.hasPort(cell.get('target').port)){
    			celdaDestino.removePort(cell.get('target').port);
    			setearIdsNova(celdaOrigen);
    		} 	    		
    	}else{
    		alert('Cell:remove with id ' + cell.id + ' remove to the graph.');
    		//por defecto, si se remueve un elemento sus enlaces son automaticamente removidos
    	}
	})

	
	paper.on('cell:pointerdblclick ', function(cellView, evt, x, y) { 
		//$scope.objeto = cellView;

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