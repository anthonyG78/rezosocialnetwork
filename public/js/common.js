window.addEventListener('DOMContentLoaded', function (){
	$('#menu-bars').on('click', function (e){
		e.stopPropagation();
		$('#menu').toggleClass('open');
		$('body').toggleClass('menu-opened');
	});

	$('#menu').on('click', function (e){
		e.stopPropagation();
	});

	$(document).on('click', function (e){
		console.log('oups')
		$('#menu').toggleClass('open', false);
		$('body').toggleClass('menu-opened', false);
	});

	// $.ajax({
	//   method: "POST",
	//   dataType: "JSON",
	//   url: "/api/login/",
	//   data: { username: "toto", password: "123" },
	//   success: function(m){
	//   	console.log('success', m);
	//   },
	//   error: function(m){
	//   	console.log('error', m.responseJSON);
	//   }
	// });

});

'use strict';
var app = angular.module('menuSlider', []);

app.controller('menuSlide', [function(){
  this.jesuis = 'Valeur d\'une propriété du contrôleur dont l\'instance est nommée !';
}]);

angular.bootstrap(window.document, ['menuSlider'], {strictDi:false});