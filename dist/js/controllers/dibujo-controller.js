'use strict';

angular.module('dibujo', ['ngRoute', 'ui.router','ngMaterial', 'ngMessages', 'md.data.table', 'ngContextMenu', 'ShapesNova'])

.controller('DibujoController', function($scope, $timeout, $mdSidenav, $log, $mdDialog, $document, contextMenu, $mdMenu, $rootScope, $compile, ShapesNova) {
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


	var celdaViewPointerClick = null;

	var cantCiclosConversacionales = 0;
	var tipoEnlace, pointStickOrigen, pointStickDestino, portIdOrigen, portIdDestino;
	var estacionOrigen = null;
	var estacionDestino = null;
	var puertoOrigen = null;
	var puertoDestino = null;
	var btnAgregarEnlace = false;
	var btnAgregarCicloConversacional = false;
	var btnAgregarAnd = false;
	var btnAgregarOr = false;

	var graph = new joint.dia.Graph;
	$scope.graph = graph;

	var puntoInterseccionFun = function(celdaRestrictiva, punto){
		if(celdaRestrictiva === undefined || punto === undefined){
			$log.debug('210 ERROR, celda o punto indefinido');
		}else {
			var puntoInterseccion;
			var formaRestriccion;
			var vista = paper.findViewByModel(celdaRestrictiva);// encontrar la vista del elemento
			var scalable = vista.$('.scalable')[0]; 						// determinar el subelemento que tiene el valor del escalamiento
			var transform = scalable.transform.baseVal;					// elemento que tiene el valor del escalamiento
			$log.debug('fun 271 type: '+celdaRestrictiva.get('type'));
			switch (celdaRestrictiva.get('type')) {
				case 'cicloConversacional':
					formaRestriccion = g.ellipse(celdaRestrictiva.get('position'),
					scalable.firstChild.rx.baseVal.valueAsString*transform.getItem(0).matrix.a,
					scalable.firstChild.ry.baseVal.valueAsString*transform.getItem(0).matrix.d);
					puntoInterseccion = formaRestriccion.intersectionWithLineFromCenterToPoint(punto);
					break;
				case 'estacionAnd':
					formaRestriccion = g.ellipse(celdaRestrictiva.get('position'),
					scalable.firstChild.r.baseVal.valueAsString*transform.getItem(0).matrix.a,
					scalable.firstChild.r.baseVal.valueAsString*transform.getItem(0).matrix.d);
					puntoInterseccion = formaRestriccion.intersectionWithLineFromCenterToPoint(punto);
					break;
				case 'estacionOr':

					var centro = g.point(celdaRestrictiva.get('position').x + celdaRestrictiva.get('size').width/2, celdaRestrictiva.get('position').y + celdaRestrictiva.get('size').height/2 );
					$log.debug('192: centro: '+centro);
					var click = g.point(punto.x-5, punto.y-5);
					$log.debug('193: click = punto: '+click);

					var puntaN, puntaE, puntaS, puntaO; // posición de las puntas del rombo
					puntaN = g.point(celdaRestrictiva.get('position').x + celdaRestrictiva.get('size').width/2, celdaRestrictiva.get('position').y);
					puntaO = g.point(celdaRestrictiva.get('position').x, celdaRestrictiva.get('position').y + celdaRestrictiva.get('size').height/2);
					puntaS = g.point(celdaRestrictiva.get('position').x + celdaRestrictiva.get('size').width/2, celdaRestrictiva.get('position').y+celdaRestrictiva.get('size').height);
					puntaE = g.point(celdaRestrictiva.get('position').x + celdaRestrictiva.get('size').width, celdaRestrictiva.get('position').y + celdaRestrictiva.get('size').height/2);
					var path;
					var lineaCentroClick;
					var puntoInterseccion;
					var cuadrante;
					if(punto.x >= centro.x && punto.y <= centro.y){ //cuadrante NE
						$log.debug('cuadrante NE');
						path = g.line(puntaN, puntaE);
						click = click.offset(celdaRestrictiva.get('size').width, -celdaRestrictiva.get('size').height);
						$log.debug('208: new click NE: '+click);
						cuadrante =  'NE';
					}
					if(punto.x >= centro.x && punto.y >= centro.y){ //cuadrante SE
						path = g.line(puntaS, puntaE);
						$log.debug('cuadrante SE');
						click = click.offset(celdaRestrictiva.get('size').width, celdaRestrictiva.get('size').height);
						$log.debug('214: new click SE: '+click);
						cuadrante =  'SE';
					}
					if(punto.x <= centro.x && punto.y >= centro.y){ //cuadrante SO
						path = g.line(puntaS, puntaO);
						$log.debug('cuadrante SO');
						click = click.offset(-celdaRestrictiva.get('size').width, celdaRestrictiva.get('size').height);
						$log.debug('220: new click SO: '+click);
						cuadrante =  'SO';
					}
					if(punto.x <= centro.x && punto.y <= centro.y){ //cuadrante NO
						path = g.line(puntaN, puntaO);
						$log.debug('cuadrante NO');
						click = click.offset(-celdaRestrictiva.get('size').width, -celdaRestrictiva.get('size').height);
						$log.debug('226: new click NO: '+click);
						cuadrante =  'NO';
					}
					lineaCentroClick = g.line(centro, click);
					puntoInterseccion = path.intersect(lineaCentroClick);
					$log.debug('230: linea centro click: '+lineaCentroClick);
					$log.debug('231: path: '+path);
					if (puntoInterseccion == null || puntoInterseccion == 'undefined'){
							$log.debug('233: no se encontró punto de intersección');
					}
					break;
				default:
					puntoInterseccion = punto;
			}
			return puntoInterseccion;
		}
		return null;
	}

	var graphElementView = joint.dia.ElementView.extend({

		pointerdown: function(evt, x, y) {
			if(this.model.get('type') == 'basic.Ellipse'){ //si es puerto azul
				var parentCell = graph.getCell(this.model.get('parent'));
				var intersectionPoint = puntoInterseccionFun(parentCell, g.point(x, y));
				joint.dia.ElementView.prototype.pointerdown.apply(this, [evt, intersectionPoint.x, intersectionPoint.y]);
			}else{
				joint.dia.ElementView.prototype.pointerdown.apply(this,[evt,x,y]);
			}
		},
		pointermove: function(evt, x, y) {
			if(this.model.get('type') == 'basic.Ellipse'){ //si es puerto azul
				var parentCell = graph.getCell(this.model.get('parent'));
				var intersectionPoint = puntoInterseccionFun(parentCell, g.point(x, y));
				joint.dia.ElementView.prototype.pointermove.apply(this, [evt, intersectionPoint.x, intersectionPoint.y]);
			}else{
				joint.dia.ElementView.prototype.pointermove.apply(this, [evt,x,y]);
			}
		}
	});

	var paper = new joint.dia.Paper({
		el: $('#miDiagrama'),
		width: 2000,
		height: 2000,
		model: graph,
		gridSize: 1,
		elementView: graphElementView
	})

	var agregarPuertoAzul = function(celdaPadre, x, y){

		var position = puntoInterseccionFun(celdaPadre, g.point(x, y));

		var puertoAzul = new joint.shapes.basic.Ellipse({
			position: position.offset(-4,-4),
			size: { width: 7, height: 7 },
			attrs: { ellipse: { fill: 'blue', stroke: 'blue' }}
		})
		graph.addCell(puertoAzul);
		celdaPadre.embed(puertoAzul);
		//TO DO setear id Nova celdaPadre
		return puertoAzul;
	}

	var angulo = function(puerto){
		var celdaPadre = graph.getCell(puerto.get('parent'));
		var centroPadre = g.point(celdaPadre.get('position').x, celdaPadre.get('position').y);
		$log.debug('272: celdaPadre type: '+celdaPadre.get('type'));
		if(celdaPadre.get('type') == 'estacionOr'){
			centroPadre = g.point(celdaPadre.get('position').x + celdaPadre.get('size').width/2, celdaPadre.get('position').y + celdaPadre.get('size').height/2);
		}
		var angulo = centroPadre.angleBetween(g.point(centroPadre.x-20, centroPadre.y),g.point(puerto.get('position').x, puerto.get('position').y));
		return angulo;
	}

	var setearIdsNova = function(celdaOrigen){ //debe ser la celda de origen para determinar el orden de los puertos salientes
		$log.debug('ID-NOVA- cellOrigen: '+celdaOrigen.id);

		// determinar puertos que son salida
		var puertos = celdaOrigen.getEmbeddedCells();
		var puertosSalientes = [];
		var grupo;
		for(var i =0; i<puertos.length; i++){
			if(puertos[i].get('attrs').grupo[0] == 'salida'){
				puertosSalientes.push(puertos[i]);
			}
		}

		//ordenar puertosSalientes
		var anguloA, anguloB;
		puertosSalientes.sort(function(a,b){
			anguloA = angulo(a);
			anguloB = angulo(b);
			if(anguloA > anguloB)
				return -1;
			if(anguloA < anguloB)
				return 1;
			return 0;
		})

		//setear id Nova
		var idNovaOrigen = celdaOrigen.get('etiquetas').idNova == 'Main' ? '' : celdaOrigen.get('etiquetas').idNova;
		var idNovaDestino;
		var enlaces, targetPuerto, targetCelda;
		for(var i =0; i<puertosSalientes.length; i++){
			$log.debug('j: '+i+' id: '+puertosSalientes[i].id+' angle: '+angulo(puertosSalientes[i]));
			enlaces = graph.getConnectedLinks(puertosSalientes[i] ,{'inbound': false, 'outbound': true});
			targetPuerto = graph.getCell(enlaces[0].get('target').id);
			targetCelda = graph.getCell(targetPuerto.get('parent'));
			if(celdaOrigen.get('type') == 'cicloConversacional'){
				idNovaDestino = idNovaOrigen+String.fromCharCode(65+i);
			}else{
				idNovaDestino = idNovaOrigen+''+(1+i);
			}
			targetCelda.attr('.idNova/text', idNovaDestino);
			joint.util.setByPath(targetCelda.get('etiquetas'), 'idNova', idNovaDestino);
			setearIdsNova(targetCelda);
		}
	}

	var centroNova = function(celda){
		var type = celda.get('type');
		var vista = paper.findViewByModel(celdaRestrictiva);// encontrar la vista del elemento
		var scalable = vista.$('.scalable')[0]; 						// determinar el subelemento que tiene el valor del escalamiento
		var transform = scalable.transform.baseVal;					// elemento que tiene el valor del escalamiento
		switch (type) {
			case 'cicloConversacional':
				centro = g.point(position.x)
				break;
			case 'estacionAnd':

				break;
			case 'estacionOr':

				break;
			default:

		}

	}

	var etapaCiclo = function(padre, hijo){
		// TO DO formatear point tisck restando el centro de la celdaPadre
		var posicionHijo = g.point(hijo.get('position').x, hijo.get('position').y);
		var centro = g.point(padre.get('position').x, padre.get('position').y);
		if(padre.get('type') == 'estacionOr'){
			centro = centro.offset(padre.get('size').width/2, padre.get('size').height/2);
		}

		if(posicionHijo.x < centro.x && posicionHijo.y <= centro.y){
			return 'PETICION';
		}
		if(posicionHijo.x >= centro.x && posicionHijo.y < centro.y){
			return 'NEGOCIACION';
		}
		if(posicionHijo.x > centro.x && posicionHijo.y >= centro.y){
			return 'REALIZACION';
		}
		if(posicionHijo.x <= centro.x && posicionHijo.y > centro.y){
			return 'SATISFACCION';
		}
	}

	var validarEnlace = function(enlace){
		var esValido = true;
		var puertoSource = enlace.getSourceElement();
		var celdaSource = graph.getCell(puertoSource.get('parent'));
		var puertoTarget = enlace.getTargetElement();
		var celdaTarget = graph.getCell(puertoTarget.get('parent'));

		if(celdaSource && celdaTarget && celdaSource == celdaTarget){
			alert("La celda de destino debe ser distinta a la de origen");
			remover(enlace);
			return false;
		}

		if(celdaTarget && celdaTarget.get('type') == 'cicloConversacional' && celdaTarget.get('etiquetas').idNova == 'Main'){
			alert("Ciclo 'Main' no puede ser una celda de destino");
			remover(enlace);
			return false;
		}

		var enlacesEntrantesEnDestino = graph.getConnectedLinks(celdaTarget, {'outbound' : false, 'inbound' : true, 'deep': true});
		$log.debug('363: enlacesEntrantesEnDestino: '+enlacesEntrantesEnDestino.length);
		var count = 0;
		for(var i =0; i<enlacesEntrantesEnDestino.length; i++){
			if(celdaSource = enlacesEntrantesEnDestino[i].getSourceElement()){
				count++;
				if(count > 1){
					alert("Enlace ya existe");
					enlace.remove();
					return false;
				}
			}
		}

		return true;
	}

	var crearEnlace =  function(){
		$log.debug("creando enlace");

		var etapaOrigen = etapaCiclo(estacionOrigen, puertoOrigen);
		var etapaDestino = etapaCiclo(estacionDestino, puertoDestino);

		var enlace = new ShapesNova.enlace({
			source: { id: puertoOrigen.id},
	    target: { id: puertoDestino.id},
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
			enlace.attr('.connection', {'stroke-dasharray': '5,2'});
			enlace.attr('text/tipoEnlace', tipoEnlace);
		}

		graph.addCell(enlace);
		enlace.toBack();

		if(validarEnlace(enlace)){
			$log.debug("409: enlace valido");
			setearIdsNova(graph.getCell(estacionOrigen));
		}

		estacionOrigen = null;
		estacionDestino = null;
		puertoOrigen = null;
		puertoDestino = null;
		btnAgregarEnlace = false;

		enlace.on('change:source change:target',function(){
			$log.debug('change source');
			if(enlace.get('source').id == null && enlace.get('source').x != null){
				$log.debug('source of the link changed, puerto desconectado');
				var celdaSource = graph.getCell(enlace.previous('source').id);
				if(celdaSource && celdaSource.hasPort(enlace.previous('source').port)){
					celdaSource.removePort(enlace.previous('source').port);
					//renombrar vecinos y sucesores de ellos
					setearIdsNova(celdaSource);
				}
			}

			if(enlace.get('target').id == null && enlace.get('target').x != null){
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

			if(enlace.get('source').id != null){
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

			if(enlace.get('target').id != null){
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
		$log.debug("btn Estacion OR");
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
		var nuevoAND2 = new ShapesNova.estacionAnd({
			position: { x: x, y: y },
			size: { width: 25, height: 25},
			etiquetas : {
				idNova: ''
			}
		});
		graph.addCell(nuevoAND2);
		btnAgregarAnd = false;
	}

	var crearEstacionOr = function(x,y){
		$log.debug("Agregando estacion Or");
		var rombo = new ShapesNova.estacionOr({
			position: { x: x, y: y },
			size: { width: 25, height: 25 },
			etiquetas : {
				idNova: '',
				condiciones: ''
			},
			attrs: {
				'.idNova': { text : ''}
			}
		})

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
		var nuevoCC2 = new ShapesNova.cicloConversacional({
			position: { x: x, y: y },
			size: { width: 134, height: 74 },
			etiquetas : {
				idNova: idNova,
				nombre: nombre
			},
			attrs: {
				'.idNova': { text : joint.util.breakText(idNova, { width: 180 })},
				'.nombre': { text: joint.util.breakText(nombre, { width: 180 })}
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
		puertoOrigen = null;
		puertoDestino = null;
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
		var celda = graph.getCell(celdaViewPointerClick.model.id);
		remover(celda); // desencadena graph.on('remove'...
	}

	var cancelarAccionEnCurso = function(){
		$log.debug("candelar accion en curso");
		if(celdaViewPointerClick != null){
			custumUnhighlight(celdaViewPointerClick);
		}
		btnAgregarEnlace = false;
		btnAgregarCicloConversacional = false;
		btnAgregarAnd = false;
		btnAgregarOr = false;
		if(estacionOrigen != null && puertoOrigen != null){
			puertoOrigen.remove();
		}
		if(estacionDestino != null && puertoDestino != null){
			puertoDestino.remove();
		}
		estacionOrigen = null;
		estacionDestino = null;
		puertoOrigen = null;
		puertoDestino = null;

		celdaViewPointerClick = null;
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

	var remover = function(celda){
		cancelarAccionEnCurso();
		var type = celda.get('type');
		var puertos = celda.getEmbeddedCells();
		for(var p =0; p < puertos.length; p++){
			var enlaces = graph.getConnectedLinks(puertos[p]);
			for(var i =0; i<enlaces.length; i++){
				remover(enlaces[i]);
			}
		}
		switch (type) {
			case 'cicloConversacional':
				if(celda.get('etiquetas').idNova == 'Main'){
					alert("Ciclo 'Main' no puede ser eliminado del modelo");
				}else{
					celda.remove();
				}
				break;
			case 'estacionAnd':
				celda.remove();
				break;
			case 'estacionOr':
				celda.remove();
				break;
			case 'enlace':
				var puertoSource = graph.getCell(celda.get('source').id);
				var puertoTarget = graph.getCell(celda.get('target').id);
				if(puertoSource){
					$log.debug('742: remueve source del enlace');

					puertoSource.remove();
					puertoOrigen = null;
				}
				if(puertoTarget){
					$log.debug('747: remueve Target del enlace');
					puertoTarget.remove();
					puertoDestino = null;
				}
				celda.remove();
				break;
			case  'basic.Ellipse':
				celda.remove();
				break;
			default:
				$log.debug('nada que remover');
		}
	}

	graph.on('remove', function(cell) {

	})

	paper.on('cell:pointerdblclick ', function(cellView, evt, x, y) {
		//$scope.objeto = cellView;
		custumHighlight(cellView);
		$log.debug('cell:pointerdblclick cellView.className-> '+cellView.className());
		var type = cellView.className();

		switch(type){
			case 'cell type-cicloconversacional element':
				cargarNav(cellView);
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

	})

	paper.on('cell:pointerclick', function(cellView, evt, x, y) {
		//$log.debug("cell:pointerClick className: "+cellView.className());
		var thisCell = graph.getCell(cellView.model.id);
		if(celdaViewPointerClick != null){
			custumUnhighlight(celdaViewPointerClick);
		}
		celdaViewPointerClick = cellView;
		custumHighlight(cellView);
		if(btnAgregarEnlace){

			if (estacionOrigen == null && puertoOrigen == null){
				estacionOrigen = thisCell;
				$log.debug('791 point: '+g.point(x,y));
				puertoOrigen = agregarPuertoAzul(estacionOrigen, x, y);
				if(puertoOrigen == 'undefined' || puertoOrigen == null){
					$log.debug('puertoOrigen es Null');
				}
				puertoOrigen.attr('grupo', ['salida']);
				pointStickOrigen = puertoOrigen.get('position');
				$log.debug('795 pointStickOrigen '+pointStickOrigen.x);
				estacionDestino = null;
				puertoDestino = null;
			}else if (estacionDestino == null && puertoDestino == null) {
				$log.debug('816: point en destino');
				estacionDestino = thisCell;
				$log.debug('798 point: '+g.point(x,y));
				$log.debug('818: estacionDestino: '+estacionDestino.id);
				puertoDestino = agregarPuertoAzul(estacionDestino, x, y);
				if(puertoDestino == 'undefined' || puertoDestino == null){
					$log.debug('puertoDestino es Null');
				}
				puertoDestino.attr('grupo', ['entrada']);
				pointStickDestino = puertoDestino.get('position');
				$log.debug('801 pointStickDestino '+pointStickDestino.x);
				//ya que estan seteados ambos puertos, se crea el enlace
				crearEnlace();
			}
		}

	});

	paper.on('cell:pointerdown', function(cellView, evt){
		//$log.debug("cell:pointerDOWN className: "+cellView.className());
		var thisCell = graph.getCell(cellView.model.id);
		if(celdaViewPointerClick != null){
			custumUnhighlight(celdaViewPointerClick);
		}
		celdaViewPointerClick = cellView;
		custumHighlight(cellView);
	})

	paper.on('cell:pointerup', function(cellView, evt){
		//$log.debug('cell:pointerUP: '+cellView.className());
		var celda = graph.getCell(cellView.model.id);
		var celdaPadre = graph.getCell(celda.get('parent'));
		var nuevaEtapa = null;
		if(celdaPadre != null && celdaPadre != undefined){
			var enlaceAsociado = graph.getConnectedLinks(celda);
			nuevaEtapa = etapaCiclo(celdaPadre, celda);
			for(var i = 0; i<enlaceAsociado.length; i++){
				if(enlaceAsociado[i].get('source').id == celda.id){
					enlaceAsociado[i].attr('text/etapaOrigen', nuevaEtapa);
				}
				if(enlaceAsociado[i].get('target').id == celda.id){
					enlaceAsociado[i].attr('text/etapaDestino', nuevaEtapa);
				}
			}
		}
	})

	paper.on('cell:pointermove',function(cellView, evt, x, y){
		$log.debug("cell:pointermove");
		var thisCell = graph.getCell(cellView.model.id);
		var type = thisCell.get('type');
		custumHighlight(cellView);
	})

	paper.on('cell:mouseover', function(cellView, evt){
		if(btnAgregarEnlace && graph.getCell(cellView.model.id).isElement()){
			$log.debug("mouseOver Agregando Enlace");
			//cellView.highlight();
			custumHighlight(cellView);
		}
	})

	paper.on('cell:mouseout',function(cellView, evt){
		if(btnAgregarEnlace && graph.getCell(cellView.model.id).isElement()){
			$log.debug("mouseOut Agregando Enlace");
			//cellView.unhighlight();
			custumUnhighlight(cellView);
		}
	})

	paper.on('blank:pointerclick', function(evt, x, y){
		$log.debug("blank:pointerClick: "+g.point(x,y));
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
		var cellView = paper.findViewByModel(cell);
		$log.debug("celda agregada, activar su highlight, cellView-> "+cellView.className());

	    if(celdaViewPointerClick != null){
				$log.debug("add: apagar celda antes presionada");
				//celdaViewPointerClick.unhighlight();
				custumUnhighlight(celdaViewPointerClick);
			}
			custumHighlight(cellView);
			celdaViewPointerClick = cellView;
	})

	var custumHighlight = function(cellView){
		if(cellView){
			var tipo = cellView.className();
			switch (tipo){
				case 'cell type-cicloconversacional element':
					cellView.highlight('ellipse', {type: 'elementAvailability'});
					break;
				case 'cell type-estacionand element':
					cellView.highlight('circle');
					break;
				case 'cell type-estacionor element':
					cellView.highlight('path');
					break;
				case 'cell type-enlace link':
					//cellView.highlight('path');
					break;
			}
			if(btnAgregarEnlace == false){ // celda iluminada debe mostrar marca para escalar.
				// mostrar marca para escalar
			}
		}
	}

	var custumUnhighlight = function(cellView){
		if(cellView){
			var tipo = cellView.className();
			switch (tipo){
				case 'cell type-cicloconversacional element':
					cellView.unhighlight('ellipse');
					break;
				case 'cell type-estacionand element':
					cellView.unhighlight('circle');
					break;
				case 'cell type-estacionor element':
					cellView.unhighlight('path');
					break;
				case 'cell type-enlace link':
					cellView.unhighlight('path');
					break;
			}
			// remover marca de escalamiento
		}
	}

	$rootScope.alerta = function(){
		alert("enviada por-> ");
	};

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
			case 'cell type-cicloconversacional element':
				RightClickMenuCtrl.open(evt);
				break;
			case 'cell type-estacionor element':
				RightClickMenuCtrl.open(evt);
				break;
			case 'cell type-estacionand element':
				RightClickMenuCtrl.open(evt);
				break;
			case 'link':
				$log.debug("switch contextmenu=link");
				RightClickMenuCtrl.open(evt);
				break;
		}
	})

	/* Actualiza el json del modelo*/
	graph.on('all',function(eventName, cell){
		$('#json-renderer').jsonViewer(graph.toJSON());
	})

	var cicloConvNav = null;
	var cargarNav = function(viewElemento){
		$log.debug('cargarNav: viewElemento.id: '+viewElemento.model.id);
		var celda = graph.getCell(viewElemento.model.id);
		var etiquetas = celda.get('etiquetas');
		var type = celda.get('type');
		switch (type) {
			case 'cicloConversacional':
				cicloConvNav = celda;

				$scope.rolCliente = etiquetas.cliente != undefined ? [{name: etiquetas.cliente}] : [];
				$scope.rolClienteSeleccionado = null;
				$scope.rolClienteBuscado = null;

				$scope.rolRealizador = etiquetas.realizador != undefined ? [{name: etiquetas.realizador}] : [];
				$scope.rolRealizadorSeleccionado = null;
				$scope.rolRealizadorBuscado = null;

				$scope.rolObservador = etiquetas.observador != undefined ? [{name: etiquetas.observador}] : [];
				$scope.rolObservadorSeleccionado = null;
				$scope.rolObservadorBuscado = null;

				$scope.descripcionCC = etiquetas.descripcion != (undefined || '') ? etiquetas.descripcion : undefined;
				$scope.nombreCC = etiquetas.nombre;
				$scope.idNovaCC = etiquetas.idNova;
				break;
			case 'estacionOr':
				$scope.estOr = {
					idNova: etiquetas.idNova || ''
				}
				break;
			case 'estacionAnd':
				$scope.estAnd = {
					idNova: etiquetas.idNova || ''
				}
				break;
			default:
		}
	}

	var mapaConversacional = { roles: []};

	$scope.transformarChipRol = function(chip){
		$log.debug('trans: '+chip);
		if (angular.isObject(chip)) {
			return chip;
		}
		return { name: chip, cant: 0 }
	}

	$scope.filterRoles = function(query){
		var resultado = mapaConversacional.roles.filter(function(rol){
			return (rol.name.toLowerCase().indexOf(query.toLowerCase()) === 0);
		});
		return resultado;
	}


	$scope.agregarRolCicloConv = function(tipo){
		switch (tipo) {
			case 'cliente':
				cicloConvNav.attr('.cliente/text', $scope.rolCliente[0].name);
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'cliente', $scope.rolCliente[0].name, '/');
				agregarRolMapaConv(cicloConvNav.get('etiquetas').cliente);
				$scope.rolClienteSeleccionado = null;
				$scope.rolClienteBuscado = null;
				break;
			case 'realizador':
				cicloConvNav.attr('.realizador/text', $scope.rolRealizador[0].name);
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'realizador', $scope.rolRealizador[0].name, '/');
				agregarRolMapaConv(cicloConvNav.get('etiquetas').realizador);
				$scope.rolRealizadorSeleccionado = null;
				$scope.rolRealizadorBuscado = null;
				break;
			case 'observador':
				cicloConvNav.attr('.observador/text', $scope.rolObservador[0].name);
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'observador', $scope.rolObservador[0].name, '/');
				agregarRolMapaConv(cicloConvNav.get('etiquetas').observador);
				$scope.rolObservadorSeleccionado = null;
				$scope.rolObservadorBuscado = null;
				break;
			default:

		}
	}

	$scope.eliminarRolCicloConv = function(tipo){
		switch (tipo) {
			case 'cliente':
				eliminarRolMapaConv(cicloConvNav.get('etiquetas').cliente);
				cicloConvNav.attr('.cliente/text', '');
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'cliente', undefined, '/');
				break;
			case 'realizador':
				eliminarRolMapaConv(cicloConvNav.get('etiquetas').realizador);
				cicloConvNav.attr('.realizador/text', '');
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'realizador', undefined, '/');
				break;
			case 'observador':
				eliminarRolMapaConv(cicloConvNav.get('etiquetas').observador);
				cicloConvNav.attr('.observador/text', '');
				joint.util.setByPath(cicloConvNav.get('etiquetas'), 'observador', undefined, '/');
				break;
			default:
		}
	}

	var eliminarRolMapaConv = function(rolName){
		$log.debug('REM ants -> '+mapaConversacional.roles.length);
		for(var i =0; i < mapaConversacional.roles.length; i++){
			if(mapaConversacional.roles[i].name.toLowerCase() == rolName.toLowerCase()){
				mapaConversacional.roles[i].cant = mapaConversacional.roles[i].cant - 1;
				if(mapaConversacional.roles[i].cant == 0){
					delete mapaConversacional.roles[i];
				}
				break;
			}
		}
		$log.debug('REM desp -> '+mapaConversacional.roles.length);
	}


	var agregarRolMapaConv = function(rolName){
		var isNuevoRol = true;
		$log.debug('ADD ants, cant roles mapa: '+mapaConversacional.roles.length);
		for(var i =0; i< mapaConversacional.roles.length; i++){
			if(mapaConversacional.roles[i].name.toLowerCase() == rolName.toLowerCase()){
				isNuevoRol = false;
				mapaConversacional.roles[i].cant = mapaConversacional.roles[i].cant+1;
				break;
			}
		}
		if(isNuevoRol){
			mapaConversacional.roles.push({name: rolName, cant: 1});
			$log.debug('ADD desp, cant roles mapa: '+mapaConversacional.roles.length);
		}
	}

	$scope.setNombreCC = function(){
		cicloConvNav.attr('.nombre/text', $scope.nombreCC);
		joint.util.setByPath(cicloConvNav.get('etiquetas'), 'nombre', $scope.nombreCC, '/');
	}

	$scope.agregarDescripcionCC = function(){
		joint.util.setByPath(cicloConvNav.get('etiquetas'), 'descripcion', $scope.descripcionCC, '/');
	}

})



.controller('SelectAsyncRolController', function($timeout, $scope, $log) {

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
