var pitchControllers = angular.module('pitchControllers', []);
var pitchEventStack = [{count:{strikes: 0, balls: 0}, inning: 1, outs: 0, pitchCount: 0, score:{home:0, away:0}}];

pitchControllers.controller('GameStartController', ['$scope', function($scope) {
	$scope.name = "Stuart"
}]);

pitchControllers.controller('GameRecordController', ['$scope', function($scope) {

	$scope.count = {strikes: 0, balls: 0};
	$scope.inning = 1;
	$scope.outs = 0;
	$scope.pitchCount = 0;
	$scope.score = {home: 0, away: 0};

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
			placement: 0, // UA = 0, LI = 9
			outcome: 0 //1 = 1b, 2 = 2b, 3 = 3b, 4 = hr, s = strike, b = ball, k = K, kl = >|, 5 = in-play out, 10 = walk, 11 foul ball
		},
	};
	

	$scope.commitPitchEvent = function() {

		// bump pitch count
		pitchEvent.pitchCount++;

		// generate counts
		switch(pitchEvent.pitch.outcome) {
			case 's':
				$scope.addStrike();
				break;
			case 'fb':
				$scope.addStrike();
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
				speed: pitchEvent.pitch.speed, 
				placement: pitchEvent.pitch.placement, 
				outcome: pitchEvent.pitch.outcome
			}
		});

		// bump which pitch event we are on
		currentPitchEvent++;
		// apply the current event to view
		$scope.applyPitchEvent(currentPitchEvent);
		console.log(pitchEventStack[currentPitchEvent]);
	}

	$scope.applyPitchEvent = function(eventNum) {
		$scope.lastevent = pitchEventStack[eventNum];
		$scope.count =  pitchEventStack[eventNum].count;
		$scope.inning = pitchEventStack[eventNum].inning;
		$scope.outs =pitchEventStack[eventNum].outs;
		$scope.pitchCount = pitchEventStack[eventNum].pitchCount;
		$scope.score = pitchEventStack[eventNum].score;
	}

	$scope.addStrike = function() {
		pitchEvent.count.strikes++;
		if(pitchEvent.count.strikes == 3) {
			pitchEvent.count.strikes = 0;
			pitchEvent.count.balls = 0;
			$scope.addOut();
		}
	}
	
	$scope.addBall = function() {
		pitchEvent.count.balls++;
		if(pitchEvent.count.balls == 4) {
			pitchEvent.count.strikes = 0;
			pitchEvent.count.balls = 0;
		}
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

	$scope.addBatterHandedness = function(hand) {
		pitchEvent.batter.handedness = hand;
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

	$scope.undo = function() {
		$scope.applyPitchEvent(currentPitchEvent - 1);
	}

}]);