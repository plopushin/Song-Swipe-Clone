angular.module('songhop.services', [])
	.factory('User', function() {
		var o = {
			favorites: []
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

	.factory('Recommendations', function($http, SERVER) {
		var o = {
			queue: []
		};

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

			//if queue is low, fill it up
			if (o.queue.length <= 3) {
				o.getNextSongs();
			}
		}

		return o;
	})
