/* global searchService */

angular
	.module('app', ['facebook'])
	.config(function (FacebookProvider) {
		FacebookProvider.init('866089033445020');
	});

angular
	.module('app')
	.controller('searchController', ['$scope', 'Facebook', 'searchService', SearchController]);

function SearchController($scope, Facebook, searchService) {
	console.log('loading controller');
	var vm = this;

	
	vm.isLoading = false;
	vm.noText = false;
	vm.results = [];
	vm.sortBy = 'likes';
	vm.doStop = false;
	vm.reverseSort = true; 
	vm.loggedIn = false;
	vm.paging = {};

	$scope.$watch('vm.results', function () {
		console.log('changed');
		return vm.results;
	});

	$scope.$watch('vm.isLoading', function () {
		return vm.isLoading;
	});
	
	vm.login = function () {
		Facebook.login(function (res) {
			vm.loggedIn = true;
		});
	};
	
	vm.getLoginStatus = function () {
		Facebook.getLoginStatus(function (res) {
			if (res.status === 'connected') {
				vm.loggedIn = true;
				vm.accessToken = res.authResponse.accessToken;
			} else {
				vm.loggedIn = false;
			}
		});
	};
	
	vm.external = function (url) {
		window.open('http://facebook.com/' + url, '_blank');
	};
	
	vm.sortByName = function () {
		vm.sortBy = 'name';
		vm.reverseSort = vm.reverseSort ? false : true;
	}
	
	vm.sortByLikes = function () {
		vm.sortBy = 'likes';
		vm.reverseSort = vm.reverseSort ? false : true;	
	};
	
	vm.sortByDate = function () {
		vm.sortBy = 'posts.last_post';
		vm.reverseSort = vm.reverseSort ? false : true;	
	};
	
	vm.matchAmount = function (page) {
		if (vm.min_likes && !vm.max_likes) {
			return page.likes >= vm.min_likes;
		}
		
		if (vm.max_likes && !vm.min_likes) {
			return page.likes <= vm.max_likes;
		}
		
		if (!vm.max_likes && !vm.min_likes) {
			return true;
		}

		return page.likes >= vm.min_likes && page.likes <= vm.max_likes;
	}

	vm.search = function (paging_token) {
		vm.doStop = false;
		
		if (vm.term != null) {
			searchService.search(vm.term, vm.accessToken, paging_token)
				.then(function (data) {
					vm.paging = data.data.paging_tokens;
					
					data.data.results.forEach(function (v) {
						vm.results.push(v);
					});
					
					if (vm.results.length < 200 && vm.doStop === false) {
						vm.search(vm.paging.after);
					} else {
						vm.isLoading = false;
					}
				});
			vm.isLoading = true;
		} else {
			vm.noText = true;
		}
	};
	
	vm.save = function () {
		if (vm.results.length > 0) {
			searchService.saveResults(vm.results);
		}
	}
	
	vm.closeError = function () {
		vm.noText = false;
	}

	vm.stop = function () {
		console.error('stopping');
		vm.doStop = true;
		vm.isLoading = false;
	}
}