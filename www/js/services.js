angular.module('songhop.services', [])
	.factory('User', function() {
		var o = {
			favorites: []
		}

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
	});
