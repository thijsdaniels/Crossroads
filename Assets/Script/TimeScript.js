#pragma strict

static var day: float = 360;
static var hour: float = day / 24;
static var minute: float = hour / 60;
static var second: float = minute / 60;
static var onset: float = 6 * hour;

function Start () {
	
}

function Update () {
	
}

static function GetContinuousTime(): float {
	var normalizedTime: float = ((Time.time + onset) % day) / day;
	return normalizedTime;
}

static function GetDiscreteTime(): Vector4 {
	
	// get time in seconds
	var time: float = Time.time;
	time += onset;
	
	// calculate number of days
	var days: int = Mathf.FloorToInt(time / day);
	time -= days * day;
	
	// calculate number of hours
	var hours: int = Mathf.FloorToInt(time / hour);
	time -= hours * hour;
	
	// calculate number of minutes
	var minutes: int = Mathf.FloorToInt(time / minute);
	time -= minutes * minute;
	
	// calculate number of seconds
	var seconds: int = Mathf.FloorToInt((time / minute) * 60);
	
	// return result
	return Vector4(days, hours, minutes, seconds);
}