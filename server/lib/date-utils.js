DateUtils = {

	getFormattedDate : function(_date) {

		/*
		 * Formats a Date object as <month> <day>, <year>. Used in server-generated notifications
		 *
		 * @author Mark Leusink
		 */

		var monthNames = [
		  "January", "February", "March",
		  "April", "May", "June", "July",
		  "August", "September", "October",
		  "November", "December"
		]; 

		var day = _date.getDate();
		var monthIndex = _date.getMonth();
		var year = _date.getFullYear();

		return monthNames[monthIndex] + ' ' + day + ', ' + year;
	},

	getDaysUntil : function( _dateUntil ) {

		//calculate the difference in days between now and the specified date
		var dayMs = 24*60*60*1000; 
		var today = new Date();
		
		return Math.round(Math.abs((_dateUntil.getTime() - today.getTime())/ (dayMs) ));

	}

};