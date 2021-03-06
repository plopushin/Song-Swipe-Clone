angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {
  
  //helper functins for loading
  var showLoading = function() {
  	$ionicLoading.show({
  		template: '<i class="ion-loading-c"></i>',
  		noBackdrop: true
  	});
  }

  var hideLoading = function() {
  	$ionicLoading.hide();
  }

  //sets loading to true first time while songs are retrieved
  showLoading();


  //get songs
  Recommendations.init()
  	.then(function(){
  		$scope.currentSong = Recommendations.queue[0];
  		
  		return Recommendations.playCurrentSong();
  		
  	})
  	.then(function(){
  		//turn loading off
  		hideLoading();
  		$scope.currentSong.loaded = true;
  	});

  $scope.sendFeedback = function (bool) {

  	//add to favorites if they favorited the song
  	if (bool) User.addSongToFavorites($scope.currentSong);

  	//set variable for the correct animation sequence
  	$scope.currentSong.rated = bool;
  	$scope.currentSong.hide = true;
  	
  	Recommendations.nextSong();

  	$timeout(function() {
  		//$timeout to allow animation to complete
	  	$scope.currentSong = Recommendations.queue[0];
	  	$scope.currentSong.loaded = false;
  }, 250);

  	Recommendations.playCurrentSong().then(function(){
  		$scope.currentSong.loaded = true;
  	});
}

  $scope.nextAlbumImg = function(){
  	if (Recommendations.queue.length > 1) {
  		return Recommendations.queue[1].image_large;
  	}
  	return '';
  }
})
/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, $window, User) {
	$scope.favorites = User.favorites;
  $scope.username = User.username;
	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	}

	$scope.openSong = function(song) {
		$window.open(song.open_url, "_system");
	}

})

.controller('SplashCtrl', function($scope, $state, User) {
  //attempt to signup/login via User.auth
  $scope.submitForm = function(username, signingUp) {
    User.auth(username, signingUp).then(function(){
      //session set, redirect to discover page
      $state.go('tab.discover');
    }, function() {
      alert('Try another username.');
    });
  }
	
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, Recommendations) {
	//stop the current audio when going to favorites page
	//expose number of new favorites to the scope

	$scope.favCount = User.favoriteCount;

	$scope.enteringFavorites = function() {
		User.newFavorites = 0;
		Recommendations.haltAudio();
	}

	$scope.leavingFavorites = function() {
		Recommendations.init();
	}

  $scope.logout = function() {
    User.destroySession();

    //instead of using $state.go we're going to redirect
    $window.location.href= 'index.html';
  }

});