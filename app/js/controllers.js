
// global variables
var pitchControllers = angular.module('pitchControllers', []);
var pitchEventStack = [{count:{strikes: 0, balls: 0}, inning: 1, outs: 0, pitchCount: 0, score:{home:0, away:0}}];

/*
 * Game Recap Controller
 */
pitchControllers.controller('GameRecapController', ['$scope', '$http', function($scope, $http) {

	// Get the current event stack, set Math so we can do math in views
	// Set results filter to -1 for all properties (any)
	$scope.pitchEventStack = pitchEventStack;
	$scope.Math = window.Math;
    $scope.totalPitches = $scope.pitchEventStack[$scope.pitchEventStack.length - 1].pitchCount;
    $scope.resultsFilter = {"balls": -1, "strikes": -1, "outs": -1, "batter": -1};

    // get json data of all pitches and zone values
    $http.get('data/pitches.json').success(function(pitchData) {
    	$http.get('data/placements.json').success(function(placementData) {

    		// save to recap scope
	  		$scope.pitchTypes = pitchData;
			$scope.placements = placementData;

			// count pitch frequencies 
	  		$.each($scope.pitchEventStack, function(k,v){
	  			if(k > 0) { //(skip initial event state)
		  			$scope.placements[v.pitch.placement].frequency.total++;
		  			$scope.pitchTypes[v.pitch.type].frequency.total++;
		  		}
		  	});
	  	});
	});

    // add filter
    $scope.addFilter = function(type, num) {
    	switch(type) {
			case 'strikes':
				$scope.resultsFilter.strikes = num;
				break;
			case 'balls':
				$scope.resultsFilter.balls = num;
				break;
			case 'outs':
				$scope.resultsFilter.outs = num;
				break;
			case 'batter':
				$scope.resultsFilter.batter = num;
				break;
		}

		// apply the filter
    	$scope.applyFilter($scope.resultsFilter.balls, $scope.resultsFilter.strikes, $scope.resultsFilter.outs, $scope.resultsFilter.batter);
    }


	$scope.applyFilter = function(balls, strikes, outs, batter) {

		// clear any previous counts
		$scope.clearTotals();

		// count up totals, filtering appropriately
		// if we have -1, we will just do parseInt(val, 10),
		// to result in true
		$.each($scope.pitchEventStack, function(k,v){
	  			if(k > 0 && 
	  				v.count.balls == (balls == -1 ? parseInt(v.count.balls, 10) : balls) && 
	  				v.count.strikes == (strikes == -1 ? parseInt(v.count.strikes, 10) : strikes) && 
	  				v.batter.handedness == (batter == -1 ? parseInt(v.batter.handedness, 10) : batter) && 
	  				v.outs == (outs == -1 ? parseInt(v.outs, 10) : outs)) {
			  			$scope.placements[v.pitch.placement].frequency.total++;
			  			$scope.pitchTypes[v.pitch.type].frequency.total++;
			  			$scope.totalPitches++;
		  		}
		  	});
	}

	// clear totals
	$scope.clearTotals = function() {
		$.each($scope.placements, function(k,v){
			v.frequency.total = 0;
		});
		$.each($scope.pitchTypes, function(k,v){
			v.frequency.total = 0;
		});
		$scope.totalPitches = 0;
	}

}]);


/*
 * Game Record Controller
 */
pitchControllers.controller('GameRecordController', ['$scope', '$http', function($scope, $http) {

	// Set initial values
	$scope.count = {strikes: 0, balls: 0};
	$scope.inning = 1;
	$scope.outs = 0;
	$scope.pitchCount = 0;
	$scope.pitchSpeed = 85;
	$scope.score = {home: 0, away: 0};
	$scope.avgSpeed = 0;

	// get available pitches
	$http.get('data/pitches.json').success(function(pitchData) {
		$scope.pitchTypes = pitchData;
	});

	// get available zones
	$http.get('data/placements.json').success(function(placementData) {
		$scope.placements = placementData;
	});

	// initialize pitchEvent to defaults
	var currentPitchEvent = 0;
	var pitchEvent = {
		count: {strikes: 0, balls: 0}, 
		inning: 1, 
		outs: 0, 
		pitchCount: 0, 
		score: {home: 0, away: 0},
		batter: {handedness: 'l', order: 0},
		pitch: {
			type: 0, 
			speed: 0,
			placement: 0, // UA = 0, LI = 8
			outcome: 0 //1 = 1b, 2 = 2b, 3 = 3b, 4 = hr, s = strike, b = ball, k = K, kl = >|, 5 = in-play out
		},
	};
	

	$scope.commitPitchEvent = function() {

		// bump pitch count
		pitchEvent.pitchCount++;
		$scope.pitchTypes[pitchEvent.pitch.type].frequency.total++;

		// generate counts
		switch(pitchEvent.pitch.outcome) {
			case 's':
				$scope.addStrike();
				break;
			case 'fb':
				$scope.addFb();
				break;
			case 'b':
				$scope.addBall();
				break;
			case 5:
				$scope.addOut();
				break;
		}

		// push a new (non-referencing) object to the event stack
		pitchEventStack.push(
			{
				count: {
					strikes: pitchEvent.count.strikes, 
					balls: pitchEvent.count.balls
				}, 
			inning: pitchEvent.inning, 
			outs: pitchEvent.outs, 
			pitchCount: pitchEvent.pitchCount, 
			score: pitchEvent.score,
			batter: {
				handedness: pitchEvent.batter.handedness, 
				order: pitchEvent.batter.order
			},
			pitch: {
				type: pitchEvent.pitch.type, 
				speed: $scope.pitchSpeed, 
				placement: pitchEvent.pitch.placement, 
				outcome: pitchEvent.pitch.outcome
			}
		});

		// bump which pitch event we are on
		currentPitchEvent++;

		//calculate current summary
		$scope.calculateSummary();

		// apply the current event to view
		$scope.applyPitchEvent(currentPitchEvent);
	}

	// apply specified pitch event to the view
	$scope.applyPitchEvent = function(eventNum) {
		$scope.lastevent = pitchEventStack[eventNum];
		$scope.count =  pitchEventStack[eventNum].count;
		$scope.inning = pitchEventStack[eventNum].inning;
		$scope.outs =pitchEventStack[eventNum].outs;
		$scope.pitchCount = pitchEventStack[eventNum].pitchCount;
		$scope.score = pitchEventStack[eventNum].score;
	}

	// calculate short summary
	$scope.calculateSummary = function() {

		var totalSpeed = 0;
		$.each(pitchEventStack, function(k,v) {
			if(k > 0) {  // skip initial state event
			 totalSpeed += parseInt(v.pitch.speed);
			}
		});
		$scope.avgSpeed = Math.round(totalSpeed / (pitchEventStack.length - 1));
	}


	/*
	 *  Game Event Helpers
	 */
	$scope.addStrike = function() {
		pitchEvent.count.strikes++;
		if(pitchEvent.count.strikes == 3) {
			pitchEvent.count.strikes = 0;
			pitchEvent.count.balls = 0;
			$scope.addOut();
		}
	}
	$scope.addFb = function() {
		if(pitchEvent.count.strikes != 2) {
			$scope.addStrike();
		}
	}
	$scope.addBall = function() {
		pitchEvent.count.balls++;
		if(pitchEvent.count.balls == 4) {
			pitchEvent.count.strikes = 0;
			pitchEvent.count.balls = 0;
		}
	}
	$scope.addOut = function() {
		pitchEvent.outs++;
		if(pitchEvent.outs == 3) {
			pitchEvent.outs = 0;
			$scope.addInning();
		}
	}
	$scope.addInning = function() {
		pitchEvent.inning ++;
	}
	$scope.addPitchType = function(type) {
		$scope.pitchType = type;
		pitchEvent.pitch.type = type;
	}
	$scope.addPitchOutcome = function(outcome, resetCount) {
		pitchEvent.pitch.outcome = outcome;
		if(resetCount) {
			pitchEvent.count.strikes = 0;
			pitchEvent.count.balls = 0;
		}
	}
	$scope.addPitchPlacement = function(loc) {
		pitchEvent.pitch.placement = loc;
	}
	$scope.undo = function() {
		$scope.applyPitchEvent(currentPitchEvent - 1);
	}
	$scope.addBatterHandedness = function(hand) {
		pitchEvent.batter.handedness = hand;
	}
	$scope.bumpBatter = function() {
		pitchEvent.batter.order++;
		if(pitchEvent.batter.order == 9) {
			pitchEvent.batter.order = 0;
		}
	}
}]);




// helper controller - randomize data for testing
pitchControllers.controller('RandomController', ['$scope', function($scope) {
	for(i = 0; i < 150; i++) {
		var outcome = random(1,8);

		switch(outcome) {
			case 6:
				outcome = 's'
				break;
			case 7:
				outcome = 'fb'
				break;
			case 8:
				outcome = 'b'
				break;
		}

		pitchEventStack.push(
			{
				count: {
					strikes: random(0,2),
					balls: random(0,3)
				}, 
			inning: random(1,9),
			outs: random(0,2),
			pitchCount: i,
			score: {home: 0, away: 0},
			batter: {
				handedness: random(0,1),
				order: random(1,9)
			},
			pitch: {
				type: random(0,4),
				speed: random(50,105),
				placement: random(0,8),
				outcome: random(0,2)
			}
		});
	}

	$scope.pitchEventStack = pitchEventStack;

	function random(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;;
	}
}]);



