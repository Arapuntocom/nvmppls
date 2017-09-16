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
	var celdaViewPointerClick;

	var cantCiclosConversacionales = 0;
	var tipoEnlace, pointStickOrigen, pointStickDestino, portIdOrigen, portIdDestino;
	var estacionOrigen = null;
	var estacionDestino = null;
	var btnAgregarEnlace = false;
	var btnAgregarCicloConversacional = false;
	var btnAgregarAnd = false;
	var btnAgregarOr = false;

	var graph = new joint.dia.Graph;

	var determinarStickPoint = function(thisCell, x, y){
		var type = thisCell.get('type');
		var pointStick;
		$log.debug("determinarStickPoint de "+type);

		switch(type){
			case 'basic.CicloConversacional':
				//calcular punto para ubicar el puerto
				//obtenemos la cordenada más cercana al punto presionado con respecto a la elipse
				var ellipse = g.ellipse(thisCell.get('position'), 60, 30);

				// joint.util.getElementBBox(el)
				var view = paper.findViewByModel(thisCell);
				var bbox = view.getBBox({'useModelGeometry':false});
				// var viewEllipse = view[2];
				
				
				var ellipse2 = thisCell.get('attrs').ellipse;

				$log.debug("bbox x: "+bbox.x+", y: "+bbox.y+", w: "+bbox.width+", h: "+bbox.height);
				$log.debug("elli x: "+ellipse2.rx+", y: "+ellipse2.ry);
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
				var bboxThisCell = thisCell.getBBox();
				var realBBox = bboxThisCell.bbox(45);
				pointStick = bboxThisCell.pointNearestToPoint(g.point(x,y));
				pointStick = pointStick.rotate(bboxThisCell.center(),45);
				pointStick = g.point(pointStick.x - bboxThisCell.x, pointStick.y - bboxThisCell.y);				
				break;
		}
		$log.debug('line 188: pointStick: '+pointStick.x+", "+pointStick.y);
		return pointStick;
	}

	var graphElementView = joint.dia.ElementView.extend({

		pointerdown: function(evt, x, y){
			dateCellPointerDown = new Date();
			$log.debug("dateCellPointerDown: "+dateCellPointerDown);					
			
			joint.dia.ElementView.prototype.pointerdown.apply(this, [evt, x, y]);
		},
		pointerup: function(evt, x, y){
			dateCellPointerUp = new Date();			
			$log.debug("dateCellPointerUp: "+dateCellPointerUp);

			

			joint.dia.ElementView.prototype.pointerup.apply(this, [evt, x, y]);
		}

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
		width: 2000,
		height: 2000,
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
	

	var setearIdsNova = function(cellOrigen){
		var idNovaDestino, idNovaOrigen, cellDestino;
		var puntoCentroOrigen = g.point(0, 0);
		if(cellOrigen.get('type') == 'basic.Or'){
			puntoCentroOrigen = g.point(cellOrigen.getBBox().bbox(45).width/2, cellOrigen.getBBox().bbox(45).height/2);
		}
		var arrayCeldasSalientesVecindad = graph.getNeighbors(cellOrigen, {'outbound' : true, 'inbound' : false});

		var arrayPuertosCeldaOrigen = cellOrigen.getPorts();
		var puntoPortA, puntoPortB, thetaA, thetaB; 
		arrayPuertosCeldaOrigen.sort(function(a,b){
			puntoPortA = g.point(a.args.x , a.args.y);
			puntoPortB = g.point(b.args.x, b.args.y);
			thetaA = puntoCentroOrigen.theta(puntoPortA);
			thetaB = puntoCentroOrigen.theta(puntoPortB);
			if(cellOrigen.get('type') == 'basic.Or'){
				thetaA = thetaA-45;
				thetaB = thetaB-45;
			}
			thetaA = (thetaA >= 0 && thetaA <= 180) ? (180-thetaA) : (540-thetaA);
			thetaB = (thetaB >= 0 && thetaB <= 180) ? (180-thetaB) : (540-thetaB);

			if(thetaA > thetaB){
				return 1;
			}
			if(thetaA < thetaB){
				return -1;
			}
			return 0;
		})		

		idNovaOrigen = cellOrigen.get('etiquetas').idNova != 'Main' ? cellOrigen.get('etiquetas').idNova : '';

		var enlaceAsociado = [];
		var count = 0;
		for(var i =0; i<arrayPuertosCeldaOrigen.length; i++){
			for(var j = 0; j<arrayCeldasSalientesVecindad.length; j++){
				enlaceAsociado = graph.getConnectedLinks(arrayCeldasSalientesVecindad[j], {'outbound' : false, 'inbound' : true});
				if(enlaceAsociado[0] && enlaceAsociado[0].get('source').port && enlaceAsociado[0].get('source').port == arrayPuertosCeldaOrigen[i].id){
					if(cellOrigen.get('type') == 'basic.CicloConversacional'){
						idNovaDestino = idNovaOrigen+String.fromCharCode(65+count);
					}else{
						idNovaDestino = idNovaOrigen+''+(count+1);
					}
					count++;					
					arrayCeldasSalientesVecindad[j].attr('.idNova/text', idNovaDestino);
					joint.util.setByPath(arrayCeldasSalientesVecindad[j].get('etiquetas'), 'idNova', idNovaDestino);					
					setearIdsNova(arrayCeldasSalientesVecindad[j]);
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

	var validarEnlace = function(enlace){
		var esValido = true;
		var celdaOrigen = enlace.getSourceElement();
		var celdaDestino = enlace.getTargetElement();
		if(celdaOrigen && celdaDestino && enlace.hasLoop()){
			alert("La celda de destino debe ser distinta a la de origen");
			//removerElemento(enlace);
			enlace.remove();
			return false;
		}
		
		if(celdaDestino && celdaDestino.get('type') == 'basic.CicloConversacional' && celdaDestino.get('etiquetas').idNova == 'Main'){
			alert("Ciclo 'Main' no puede ser una celda de destino");
			//removerElemento(enlace);
			enlace.remove();
			return false;
		}
		
		var enlacesEntrantesEnDestino = graph.getConnectedLinks(celdaDestino, {'outbound' : false, 'inbound' : true});
		var count = 0;
		for(var i =0; i<enlacesEntrantesEnDestino.length; i++){
			if(celdaOrigen = enlacesEntrantesEnDestino[i].getSourceElement()){
				count++;
				if(count > 1){
					alert("Enlace ya existe");
					//removerElemento(enlace);
					enlace.remove();
					return false;	
				}				
			}
		}

		return true;
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
		    		'etapaDestino': etapaDestino,
		    		'rotulo': '',
		    		'tipoEnlace': 'pertenencia',
		    		'mostrarRotulo' : true
		    	}		    	
		    },
		    'connector': { name: 'smooth' }
		})
		
		if(tipoEnlace == 'excepcion'){
			enlace.attr('.connection',{'stroke-dasharray': '5,2'});
			enlace.attr('text/tipoEnlace', tipoEnlace);
		}
		graph.addCell(enlace);
		//enlace.toBack();
		if(validarEnlace(enlace)){
			$log.debug("enlace valido");
			setearIdsNova(estacionOrigen);
		}		
		
		estacionOrigen = null;
		estacionDestino = null;
		portIdOrigen = null;
		portIdDestino = null;
		btnAgregarEnlace = false;

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
				if(graph.getCell(enlace.get('source').id).get('type') == 'basic.CicloConversacional'){
					enlace.attr('text/etapaOrigen', etapaCiclo(pointStick),'/');
				}	
				if(validarEnlace(enlace)){
					setearIdsNova(nuevoOrigen);	
				}
				
			}

			if(enlace.get('target').port == null && enlace.get('target').id != null){
				$log.debug('target of the link changed, puerto reconectado');
				var nuevoDestino = graph.getCell(enlace.get('target').id);
				var pointStick = determinarStickPoint(nuevoDestino, enlace.previous('target').x, enlace.previous('target').y);
				var idPortDestino = ''+enlace.get('target').id+'-'+Math.random();
				crearPortInElement(idPortDestino, 'in', pointStick, nuevoDestino);
				enlace.set('target', {'id': nuevoDestino.id,'port': idPortDestino});				
				if(nuevoDestino.get('type') == 'basic.CicloConversacional'){
					enlace.attr('text/etapaDestino',etapaCiclo(pointStick),'/');
				}
				if(validarEnlace()){ //si el enlace es valido
					setearIdsNova(enlace.getSourceElement());
				}
			}
			
		})
	};

	$scope.exportarImagen = function(){
		cancelarAccionEnCurso();
		$log.debug("No implementado");
	}

	$scope.agregarCicloConversacional = function(){
		cancelarAccionEnCurso();
		$log.debug("new CC2");
		btnAgregarCicloConversacional = true;
		if(celdaViewPointerClick != null){
			$log.debug("agregarCicloConversacional, se apaga celda seleccionada");
			//celdaViewPointerClick.unhighlight();
			custumUnhighlight(celdaViewPointerClick);
			celdaViewPointerClick = null;	
		}
	}

	$scope.agregarEstacionAnd = function(){
		cancelarAccionEnCurso();
		$log.debug("btn Estacion AND");
		btnAgregarAnd = true;
		if(celdaViewPointerClick != null){
			$log.debug("agregarEstacionAnd, se apaga celda seleccionada");
			//celdaViewPointerClick.unhighlight();
			custumUnhighlight(celdaViewPointerClick);
			celdaViewPointerClick = null;	
		}
	}
	
	$scope.agregarEstacionOr = function(){
		cancelarAccionEnCurso();
		$log.debug("btn Estacion AND");
		btnAgregarOr = true;
		if(celdaViewPointerClick != null){
			$log.debug("agregarEstacionOr, se apaga celda seleccionada");
			//celdaViewPointerClick.unhighlight();
			custumUnhighlight(celdaViewPointerClick);
			celdaViewPointerClick = null;	
		}
	}

	var crearEstacionAnd = function(x,y){
		$log.debug("Agregando estacion And");
		var nuevoAND2 = new joint.shapes.basic.And({
			position: { x: x, y: y },
			size: { width: 25, height: 25},
			etiquetas : {
				idNova: '',
				nombre: ''
			}			
		});
		graph.addCell(nuevoAND2);
		btnAgregarAnd = false;
	}

	var crearEstacionOr = function(x,y){
		$log.debug("Agregando estacion Or");
		var rombo = new joint.shapes.basic.Or({
			position: { x: x, y: y },
			size: { width: 20, height: 20 },
			etiquetas : {
				idNova: '',
				nombre: ''
			},
			attrs: { rect: { fill: 'white' } ,
				'.idNova': { text : ''}
			}
		})
		rombo.rotate(45,{'absolute':true});
		graph.addCell(rombo);
		btnAgregarOr = false;
	}

	var crearCicloConversacional = function(x,y){	
		$log.debug("Agregando Ciclo Conversacional ");

		var nombre = 'ciclo_'+cantCiclosConversacionales;
		
		var idNova = '';
		if(cantCiclosConversacionales == 0){
			idNova = 'Main'
		}	

		var nuevoCC2 = new joint.shapes.basic.CicloConversacional({
			position: { x: x, y: y },
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
		btnAgregarCicloConversacional = false;
	}

	$scope.agregarEnlace = function(tipo){
		cancelarAccionEnCurso();
		$log.debug("click on newLinkEP");
		tipoEnlace = tipo;	
		estacionOrigen = null;
		estacionDestino = null;
		btnAgregarEnlace = true;
		if(celdaViewPointerClick != null){
			$log.debug("agregarEnlace, se apaga celda seleccionada");
			//celdaViewPointerClick.unhighlight();
			custumUnhighlight(celdaViewPointerClick);
			celdaViewPointerClick = null;	
		}
	}

	var zoom = 1;
	$scope.zoom = function(valor){
		cancelarAccionEnCurso();
		switch (valor){
			case 'acercar':
				zoom = zoom + 0.2;
				$log.debug("zoom Acercar");
				break;
			case 'restablecer':
				zoom = zoom + 1;
				break;
			case 'alejar':
				zoom = zoom - 0.2;
				$log.debug("zoom Alejar");
				break;
		}
		paper.scale(zoom, zoom, 0, 0);
	}

	$scope.setRolCliente = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.attr('.cliente/text', $scope.w1.cliente.name);
		joint.util.setByPath(celda.get('etiquetas'), 'cliente', $scope.w1.cliente.name, '/');
	}

	$scope.setRolRealizador = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.attr('.realizador/text', $scope.w1.realizador.name);
		joint.util.setByPath(celda.get('etiquetas'), 'realizador', $scope.w1.realizador.name, '/');
	}

	$scope.setRolObservador = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.attr('.observador/text', $scope.w1.observador.name);
		joint.util.setByPath(celda.get('etiquetas'), 'observador', $scope.w1.observador.name, '/');
	}

	$scope.setNombreCC = function(){
		var celda = graph.getCell($scope.cellViewCC.id);
		celda.attr('.nombre/text', $scope.w1.name);
		joint.util.setByPath(celda.get('etiquetas'), 'nombre', $scope.w1.name, '/');
	}

	$scope.setRotuloEnlace = function(){
		var enlace = graph.getCell($scope.cellViewLink.id);
		enlace.attr('text/rotulo', $scope.enlace.rotulo);
		if($scope.enlace.mostrarRotulo){
			enlace.label(0, {position: .5, attrs: {text: { text: $scope.enlace.rotulo}}});
		}		
	}

	$scope.setMostrarRotulo = function(){	
		var enlace = graph.getCell($scope.cellViewLink.id);
		if($scope.enlace.mostrarRotulo){
			enlace.attr('text/mostrarRotulo', true);
			enlace.label(0,{ position: .5, attrs: {text: { text: $scope.enlace.rotulo}}});
		}else{
			enlace.attr('text/mostrarRotulo', false);
			enlace.label(0,{ position: .5, attrs: {text: { text: ''}}});
		}
	}

	$scope.cambiarTipoEnlace = function(){
		var enlace = graph.getCell($scope.cellViewLink.id);
		if( $scope.enlace.tipo == 'excepcion'){
			enlace.attr('.connection',{'stroke-dasharray': '5,2'});	
		}
		if( $scope.enlace.tipo == 'pertenencia'){
			enlace.removeAttr('.connection/stroke-dasharray');		
		}		
		enlace.attr('text/tipoEnlace', $scope.enlace.tipo);
	}

	$scope.removerElementoPresionado = function(){
		cancelarAccionEnCurso();
		var celda = graph.getCell(celdaViewPointerClick.model.id);
		if(celda && celda.get('type') == 'basic.CicloConversacional' && celda.get('etiquetas').idNova == 'Main'){
			alert("Ciclo 'Main' no puede ser eliminado del modelo");
		}else{
			celda.remove(); // desencadena graph.on('remove'...	
		}		
		celdaViewPointerClick = null;
	}
	var cancelarAccionEnCurso = function(){
		$log.debug("candelar accion en curso");
		btnAgregarEnlace = false;
		btnAgregarCicloConversacional = false;
		btnAgregarAnd = false;
		btnAgregarOr = false;
		if(estacionOrigen != null){
			estacionOrigen.removePort(portIdOrigen);
		}
		estacionOrigen = null;
		estacionDestino = null;
		portIdOrigen = null;
		portIdDestino = null;
	}

	$(document).keyup(function(tecla) { //si se presiona la {tecla} 
		if(tecla.keyCode == 27){ //al presionar tecla escape
			cancelarAccionEnCurso();
		}
		if(tecla.keyCode == 46){ //al presionar tecla delete (Supr)
			if(celdaViewPointerClick != null){
				$scope.removerElementoPresionado();
			}					
		}
		
	});
	
	graph.on('remove', function(cell) {   

    	if(cell.isLink()){ //si se removió el enlace, entonces removemos los puertos asociados
    		//alert('Link:remove with id ' + cell.id + ' remove to the graph.');
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
    		//alert('Cell:remove with id ' + cell.id + ' remove to the graph.');
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
			case 'cell type-enlace link':
				$scope.cellViewEnlace = graph.getCell(cellView.model.id);
				$scope.enlace = {
					rotulo: $scope.cellViewEnlace.get('attrs').text.rotulo,
					mostrarRotulo : $scope.cellViewEnlace.get('attrs').text.mostrarRotulo,
					tipo: $scope.cellViewEnlace.get('attrs').text.tipoEnlace
				}
				$scope.toggleEnlace();
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

	paper.on('cell:pointerclick', function(cellView, evt, x, y) {
		$log.debug("cell:pointerClick className: "+cellView.className());		
		if(cellView.className() != 'cell type-basic type-basic-ellipse element'){
		if(celdaViewPointerClick != null){
			$log.debug(" apagar celda antes presionada");
			//celdaViewPointerClick.unhighlight();	
			custumUnhighlight(celdaViewPointerClick);
		}
		celdaViewPointerClick = cellView;
		//cellView.highlight();
		custumHighlight(cellView);

		if(btnAgregarEnlace){
			//obtener celda y punto donde se ubicará el puerto (el punto depende de la celda)
			var thisCell = graph.getCell(cellView.model.id);
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
		}	
	});

	paper.on('cell:pointermove',function(cellView, evt, x, y){
		$log.debug("cell:pointermove");
		if(cellView.className() != 'cell type-basic type-basic-ellipse element'){
			if(celdaViewPointerClick != null){
				$log.debug(" apagar celda antes presionada.");
				//celdaViewPointerClick.unhighlight();		
				custumUnhighlight(celdaViewPointerClick);
			}
			celdaViewPointerClick = cellView;

			custumHighlight(cellView);
		}else{
			
			var elipse = graph.getCell(cellView.model.id); //ellipse
			var position = elipse.get('position'); //posicion nueva de la ellipse
			var previous = elipse.previous('position'); //posicion antigua de la ellipse
			var celda = graph.getCell(celdaViewPointerClick.model.id); //elemento a escalar
			var size = celda.get('size'); // tamaño original del elemento
			celda.resize(size.width + position.x- previous.x, size.height + previous.y - position.y);
		}
	})

	paper.on('cell:mouseover', function(cellView, evt){
		if(cellView.className() != 'cell type-basic type-basic-ellipse element'){
		if(btnAgregarEnlace && graph.getCell(cellView.model.id).isElement()){
			$log.debug("mouseOver Agregando Enlace");
			//cellView.highlight();
			custumHighlight(cellView);
		}
	}
	})

	paper.on('cell:mouseout',function(cellView, evt){
		if(cellView.className() != 'cell type-basic type-basic-ellipse element'){
			if(btnAgregarEnlace && graph.getCell(cellView.model.id).isElement()){
				$log.debug("mouseOut Agregando Enlace");
				//cellView.unhighlight();
				custumUnhighlight(cellView);
			}
		}
	})

	paper.on('blank:pointerclick', function(evt, x, y){
		$log.debug("blank:pointerClick");
		if(celdaViewPointerClick != null){
			$log.debug("blank: apagar celda antes presionada");
			//celdaViewPointerClick.unhighlight();
			custumUnhighlight(celdaViewPointerClick);
			celdaViewPointerClick = null;	
		}
		if(btnAgregarCicloConversacional){
			crearCicloConversacional(x, y);
		}
		if(btnAgregarAnd){
			crearEstacionAnd(x,y);
		}
		if(btnAgregarOr){
			crearEstacionOr(x,y);
		}				
	})

	graph.on('add', function(cell) { 
		//$log.debug("celda agregada, activar su highlight");
		var cellView = paper.findViewByModel(cell);
		$log.debug("celda agregada, activar su highlight, cellView-> "+cellView.className());
		if(cellView.className() != 'cell type-basic type-basic-ellipse element'){
			
	    	if(celdaViewPointerClick != null){
				$log.debug("add: apagar celda antes presionada");
				//celdaViewPointerClick.unhighlight();
				custumUnhighlight(celdaViewPointerClick);
			}
			
			
			//cellView.highlight();
		
			custumHighlight(cellView);
			celdaViewPointerClick = cellView;			
		}		
	})

	var addCircleBlue = function(cellView){
		var element = graph.getCell(cellView.model.id);
		var position = g.rect(element.get('position').x-element.get('size').width/2, element.get('position').y-element.get('size').height/2, element.get('size').width, element.get('size').height).topRight();
		$log.debug("position-> "+position);
		var circulo = new joint.shapes.basic.Ellipse({
			position: { x: position.x, y: position.y },
        	size: { width: 5, height: 5 },
        	attrs: { ellipse: { fill: 'blue', stroke: 'blue' }}	
		})
		graph.addCell(circulo);
    	$log.debug("circulo agregado");
    	element.embed(circulo);
    	celdaViewPointerClick = cellView;
    }

    var removeCircleBlue = function(cellView){
		var element = graph.getCell(cellView.model.id);
		var circulo = element.getEmbeddedCells();
		if(circulo[0]){
			element.unembed(circulo[0]);
	    	$log.debug("circulo desembebido");
	    	circulo[0].remove();
	    	$log.debug("circulo removido");	
		}		
    	celdaViewPointerClick = cellView;
    }

	var custumHighlight = function(cellView){
		if(cellView){
			var tipo = cellView.className();
			switch (tipo){
				case 'cell type-basic type-basic-cicloconversacional element':					
					cellView.highlight('ellipse');
					break;
				case 'cell type-basic type-basic-and element':
					cellView.highlight('circle');
					break;
				case 'cell type-basic type-basic-or element':
					cellView.highlight('rect');
					break;
				case 'cell type-enlace link':
					cellView.highlight('path');
					break;
			}
			if(btnAgregarEnlace == false){
				addCircleBlue(cellView);
			}
		}		
	}

	var custumUnhighlight = function(cellView){
		if(cellView){
			var tipo = cellView.className();
			switch (tipo){
				case 'cell type-basic type-basic-cicloconversacional element':
					cellView.unhighlight('ellipse');
					
					break;
				case 'cell type-basic type-basic-and element':
					cellView.unhighlight('circle');
					break;
				case 'cell type-basic type-basic-or element':
					cellView.unhighlight('rect');
					break;
				case 'cell type-enlace link':
					cellView.unhighlight('path');
					break;
			}

				removeCircleBlue(cellView);
			
		}		
	}

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
	
	/* Actualiza el json del modelo*/
	graph.on('all',function(eventName, cell){
		$('#json-renderer').jsonViewer(graph.toJSON());
	})

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