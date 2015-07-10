module.exports = function () {
	var obj = {
		array: [],
		header: [],
		wrapInQuotes: false,

		/*
		 * Checks to see if param is an array or object and then adds it to the 'class' values
		 * return 'this'
		*/
		fromArray: function (arr) {
			if (arr instanceof Object) {
				this.fromObject(arr);
			} else if (arr instanceof Array) {
				this.array = arr;
			} else {
				throw "The parameter you passed was not an array.";
				return false;
			}
			
			return this;
		},
		
		/*
		 * Checks to see if param is an array or object and then adds it to the 'class' values
		 * return 'this'
		*/
		fromObject: function (obj) {
			if (obj instanceof Object) {
				var arr_holder = [];

				for (var row in obj) {
					for (var item in obj[row]) {
						arr_holder.push(obj[row][item]);
					}
					this.array.push(arr_holder);
					arr_holder = [];
				}
			} else if (obj instanceof Array) {
				this.fromArray(obj);
			} else {
				throw "The parameter you passed was not an object."
				return false;
			}
			
			return this;
		},
		
		/*
		 * Let's you add a header array to the top of your CSV string
		 * return 'this'
		*/
		addHeader: function (header) {
			if (header instanceof Array) {
				this.header = header;
				
			} else {
				throw "The header parameter you passed was not an array.";
				return false;
			}
			
			return this;
		},
		
		/*
		 * Loops through the array (and header) and turns them into CSV strings
		 * return String
		*/
		toCsv: function (wrapInQuotes) {
			if (!wrapInQuotes) { wrapInQuotes = false; }
			this.wrapInQuotes = wrapInQuotes;
			
			var csv_string = "";
			var t = this;
			
			if (this.header.length > 0) {
				csv_string += t.rowToString(this.header);
			}
			
			this.array.forEach(function (row) {
				csv_string += t.rowToString(row);
			});
			
			return csv_string;
		},
		
		/*
		 * "Private" function but can be used elsewhere if you really want to
		 * Takes an array and joins it into a CSV string
		 * return String
		*/
		rowToString: function (row) {
			if (this.wrapInQuotes) {
				return '"' + row.join('","') + '"\n';
			}
			
			return row.join(',') + '\n';
		}
	};
	
	return obj;
}