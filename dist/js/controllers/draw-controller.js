'use strict';

angular.module('draw', ['ngRoute', 'ui.router','ngMaterial', 'md.data.table', 'ngContextMenu', 'ShapesNova'])

.controller('testDibujoController', function($scope, $timeout, $mdSidenav, $log, $mdDialog, ShapesNova) {
	$log.debug("testDibujoController is here!!!");
	$scope.toggleTree = buildDelayedToggler('tree');
	$scope.toggleModelo = buildToggler('propertiesNav');
	$scope.toggleCC = buildToggler('CCNav');
	$scope.toggleEnlace = buildToggler('enlaceNav');
	$scope.toggleCondicional = buildToggler('condNav');

	$scope.message = "msj";

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



})

.controller('TreeCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	  	$mdSidenav('tree').close()
		.then(function () {
	  		$log.debug("close LEFT is done");
		});
	};
})

.controller('PropertiesNavCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	  	$mdSidenav('propertiesNav').close()
		.then(function () {
			$log.debug("close propertiesNav is done");
		});
	};

	$scope.users = ['Scooby Doo','Shaggy Rodgers','Fred Jones','Daphne Blake','Velma Dinkley'];

	$scope.variable = null;
	$scope.variables = null;
	$scope.loadVariables = function() {
		// Use timeout to simulate a 650ms request.
		return $timeout(function() {
			$scope.variables =  $scope.variables  || [
				{ 'id': 1, 'nombre': 'UF', 'tipo':'Número', 'largo':'32', 'formato':'', 'valorInicial':'25000' }
		  	];
		}, 650);
	};
})

.controller('CCNavCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	$mdSidenav('CCNav').close()
		.then(function () {
			$log.debug("close CCNav is done");
		});
	};
})

.controller('EnlaceNavCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	$mdSidenav('enlaceNav').close()
		.then(function () {
			$log.debug("close enlaceNav is done");
		});
	};
})

.controller('CondNavCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	$mdSidenav('condNav').close()
		.then(function () {
			$log.debug("close condNav is done");
		});
	};

	$scope.condiciones = [{'var':"Var1", 'cond':"==", 'exp':"Var3"}];
})

.controller('TreeCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	  // Component lookup should always be available since we are not using `ng-if`
	$mdSidenav('tree').close()
		.then(function () {
			$log.debug("close LEFT is done");
		});
	};
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
})



.controller('testDiagramaController', function($scope, $log, ShapesNova){

	var constraint = function(parentCell){
		var retorno;
		var viewCell = paper.findViewByModel(parentCell);
		var scalable = viewCell.$('.scalable')[0];
		var aux = paper.findView(scalable.firstChild).getBBox();

		var lista = scalable.transform.baseVal;

		$log.debug('bbox center '+aux.center());
		$log.debug('w h '+aux.width+', '+aux.height);
		$log.debug('escale: '+lista.getItem(0).matrix.a+', '+lista.getItem(0).matrix.d);
		$log.debug('parent position-> '+parentCell.get('position').x+', '+parentCell.get('position').y);

		switch (parentCell.get('type')) {
			case ('cicloConversacional' || 'estacionAnd'):

				retorno = g.ellipse(parentCell.get('position'), scalable.firstChild.rx.baseVal.valueAsString*lista.getItem(0).matrix.a ,scalable.firstChild.ry.baseVal.valueAsString*lista.getItem(0).matrix.d
			 );

				break;
			case 'estacionOr':
				cellView = paper.findViewByModel(thisCell);
				break;

			default:
				retorno = g.rect(viewCell.getBBox({'useModelGeometry':false}));
		}
		return retorno;
	}
		var myElementView = joint.dia.ElementView.extend({

        pointerdown: function(evt, x, y) {

					if(this.model.get('type') == 'basic.Ellipse'){ //si es puerto
						$log.debug('IF Down');
						var parentId = this.model.get('parent');

						var intersection = constraint(graph.getCell(parentId)).intersectionWithLineFromCenterToPoint(g.point(x,y));
						joint.dia.ElementView.prototype.pointerdown.apply(this, [evt, intersection.x, intersection.y]);
					}else{
						$log.debug('ELSE: Down');
						joint.dia.ElementView.prototype.pointerdown.apply(this,[evt,x,y]);
					}
        },
        pointermove: function(evt, x, y) {

					if(this.model.get('type') == 'basic.Ellipse'){ //si es puerto
						$log.debug('IF Move');
						var parentId = this.model.get('parent');

						var intersection = constraint(graph.getCell(parentId)).intersectionWithLineFromCenterToPoint(g.point(x,y));
						joint.dia.ElementView.prototype.pointermove.apply(this, [evt, intersection.x, intersection.y]);
					}else{
						$log.debug('ELSE move');
						joint.dia.ElementView.prototype.pointermove.apply(this, [evt,x,y]);
					}


        }
    });

		var cantCiclosConversacionales = 0;
		var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#miDiagramaTest'),
        width: 800,
        height: 700,
        model: graph,
        gridSize: 1,
				elementView: myElementView
    });

		var myConnectionPoint = function(thisCell, x, y){
			var type = thisCell.get('type');
			var viewCell = paper.findViewByModel(thisCell);
			var scalable,aux, rectBBox;
			var pointStick = viewCell.getBBox({'useModelGeometry':false}).center();
			if(type == 'cicloConversacional' || type == 'estacionAnd'){
				scalable = viewCell.$('.scalable')[0];
				if (scalable && scalable.firstChild){
					$log.debug('hay hijo en escalable -> '+scalable.firstChild.id);

					aux = paper.findView(scalable.firstChild).getBBox();
					rectBBox = g.rect(aux.x, aux.y, aux.width, aux.height);
					var transform = scalable.firstChild.rx.baseVal.valueAsString;
					var lista = scalable.transform.baseVal;
					$log.debug('position: '+thisCell.get('position').x+', '+thisCell.get('position').y);
					$log.debug('*center: '+thisCell.getBBox().center());
					$log.debug('centerBBox: '+thisCell.get('size').width*lista.getItem(0).matrix.a/2);
					$log.debug('w h :'+aux.width+', '+aux.height);
					$log.debug('aux :'+aux);
					$log.debug('transform0 : '+transform);
					$log.debug('transform1 : '+scalable.getAttribute('transform'));
					$log.debug('transform2 : '+lista);
					$log.debug('transform2.x : '+lista.getItem(0).matrix.a);
					$log.debug('transform2.y : '+lista.getItem(0).matrix.d);
					$log.debug('transform2.cx : '+aux.width*lista.getItem(0).matrix.a/2);
					$log.debug('transform2.cy : '+aux.height*lista.getItem(0).matrix.d/2);
					var rx = scalable.firstChild.rx.baseVal.valueAsString;
					var ry = scalable.firstChild.ry.baseVal.valueAsString;
					pointStick = g.ellipse(thisCell.get('position'), scalable.firstChild.rx.baseVal.valueAsString*lista.getItem(0).matrix.a ,scalable.firstChild.ry.baseVal.valueAsString*lista.getItem(0).matrix.d
				 ).intersectionWithLineFromCenterToPoint(g.point(x,y));

					$log.debug('myConnectionPoint -> '+pointStick.x);
				}
			}
			if(type == 'estacionOr'){

			}
			return pointStick;
		}

		var estacionAnd = new ShapesNova.estacionAnd({
			position: { x: 100, y: 200 },
			size: { width: 25, height: 25},
			etiquetas : {
				idNova: ''
			}
		});

		var estacionOr = new ShapesNova.estacionOr({
			position: { x: 10, y: 10 },
			size: { width: 25, height: 25 },
			etiquetas : {
				idNova: '',
				condiciones: ''
			},
			attrs: {
				'.idNova': { text : ''}
			}
		})

		var agregarCiclo = function(){
			var nombre = 'ciclo_'+cantCiclosConversacionales;
			var idNova = '';
			if(cantCiclosConversacionales == 0){
				idNova = 'Main'
			}
			var cicloC = new ShapesNova.cicloConversacional({
				position: { x: 200, y: 400 },
				size: { width: 200, height: 80 },
				etiquetas : {
					idNova: idNova,
					nombre: nombre
				},
				attrs: {
					'.idNova': { text : joint.util.breakText(idNova, { width: 180 })},
					'.nombre': { text: joint.util.breakText(nombre, { width: 180 })},
					'.realizador': { text: joint.util.breakText('perersdfasdfa sdfasdfas adasfasdfasdfd', { width: 180 })}
				}
			});
			graph.addCell(cicloC);
			cantCiclosConversacionales++;
			return cicloC;
		}

		var addCircleBlue = function(){
			var element = ciclo;

			var position = myConnectionPoint(ciclo, 200, 310);
			$log.debug("position-> "+position);
			var circulo = new joint.shapes.basic.Ellipse({
				position: { x: position.x, y: position.y },
				size: { width: 5, height: 5 },
				attrs: { ellipse: { fill: 'blue', stroke: 'blue' }}
			})
			graph.addCell(circulo);
			element.embed(circulo);
		}

		var ciclo = agregarCiclo();
		ciclo.resize(150,100);
		addCircleBlue();
		graph.addCells([estacionAnd, estacionOr]);
		//ciclo.resize(150,100);
//100. 58
// 200. 124
/* Actualiza el json del modelo*/
	graph.on('all',function(eventName, cell){
		$('#json-renderer').jsonViewer(graph.toJSON());
	})

});
