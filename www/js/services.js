angular.module('songhop.services', [])
	.factory('User', function($http, SERVER) {
		var o = {
			username: false,
			session_id: false,
			favorites: [],
			newFavorites: 0
		};

		//attempt login or signup

		o.auth = function(username, signingUp) {

			var authRoute;

			if (signingUp) {
				authRoute = 'signup';
			} else {
				authRoute = 'login'
			}

			return $http.post(SERVER.url + '/' + authRoute, {username: username});
			}
		

		o.addSongToFavorites = function(song) {
			//ensure there is a song to add
			if(!song) return false;

			//otherwise, add to favorites array
			//unshift adds to beginning of the array
			o.favorites.unshift(song);
			o.newFavorites++;

			//persist this to the server

			return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id:song.song_id});
		}

		//return total number of favorites 

		o.favoriteCount = function() {
			return o.newFavorites;
		}

		o.removeSongFromFavorites = function (song, index) {
			//ensure there is a song to remove
			if (!song) return false;

			//remove the song
			o.favorites.splice(index, 1);

			//persist this to the server

			return $http({
				method: 'DELETE',
				url: SERVER.url + '/favorites',
				params: {session_id: o.session_id, song_id:song.song_id}
			});
		}

		//get list of users's favs from server

		o.populateFavorites = function () {
			return $http ({
				method: 'GET',
				url: SERVER.url + '/favorites',
				params: {session_id: o.session_id}
			}).success(function(data){
				//merge data into the queue
				o.favorites = data;
			});
		}

		return o;
	})

	.factory('Recommendations', function($http, $q, SERVER) {

		var media;

		var o = {
			queue: []
		};

		//either gets the next songs or play the current song

		o.init = function() {
			if (o.queue.length === 0) {
				//fill queue if empty
				return o.getNextSongs();
			} else {
				//play the current song
				return o.playCurrentSong();
			}
		}

		o.playCurrentSong = function() {
			var defer = $q.defer(); //huh?

			//play the current song preview

			media = new Audio(o.queue[0].preview_url);

			//when song is loaded, let the contoller know
			media.addEventListener('loadeddata', function() {
				defer.resolve();
			});

			media.play();

			return defer.promise;
		}
		//used when switching to favorites tab
		o.haltAudio = function() {
			if (media) media.pause();
		}

		o.getNextSongs = function() {
			return $http({
				method: 'GET',
				url: SERVER.url + '/recommendations'
			}).success(function(data){
				//merge data into the queue
				o.queue = o.queue.concat(data);
			});
		}

		o.nextSong = function() {
			//pop the index 0 off
			o.queue.shift();

			//end the song
			o.haltAudio();

			//if queue is low, fill it up
			if (o.queue.length <= 3) {
				o.getNextSongs();
			}
		}

		return o;
});
