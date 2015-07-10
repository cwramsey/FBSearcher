angular
	.module('app')
	.service('searchService', ['$http', '$window', searchService]);
	
function searchService($http, $window) {
	function search(term, token, paging_token) {
		console.log('sending search');
		
		return $http.post('/api/search', { term: term, token: token, paging_token: paging_token })
			.success(function (data, status, headers, config) {
				return data;
			});
	};
	
	function saveResults(res) {
		return $http.post('/api/save', res)
			.then(function (data, status) {
				$window.open('/api/download');
				return data;
			});
	}

	return {
		search: search,
		saveResults: saveResults
	};
}