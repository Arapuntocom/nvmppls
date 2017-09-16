'use strict';

angular.module('draw', ['ngRoute', 'ui.router','ngMaterial', 'md.data.table', 'ngContextMenu'])

.controller('DrawController', function($scope, $timeout, $mdSidenav, $log, $mdDialog) {
	$log.debug("DrawController is here!!!");
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

.controller('DiagramaController', function($scope, $log){

	var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#miDiagrama'),
        width: 800,
        height: 700,
        model: graph,
        gridSize: 1
    });

    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    var rect2 = new joint.shapes.basic.Rect({
        position: { x: 300, y: 60 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'green' }, text: { text: 'rect 2', fill: 'white' } }
    });

    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });

    graph.addCells([rect2, rect, link]);

    $scope.rect1json = rect.toJSON();
    $scope.rect2json = rect2.toJSON();
});