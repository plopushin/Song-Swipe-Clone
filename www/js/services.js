angular.module('songhop.services', [])
	.factory('User', function() {
		var o = {
			favorites: []
			newFavorites: 0
		};

		o.addSongToFavorites = function(song) {
			//ensure there is a song to add
			if(!song) return false;

			//otherwise, add to favorites array
			//unshift adds to beginning of the array
			o.favorites.unshift(song);
		}

		o.removeSongFromFavorites = function (song, index) {
			//ensure there is a song to remove
			if (!song) return false;

			//remove the song
			o.favorites.splice(index, 1);
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
	})
