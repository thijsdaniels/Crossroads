#pragma strict

var ambientLightingDay: Color = Color.white;
var ambientLightingNight: Color = Color.black;
var cameraBackgroundDay: Color = Color.white;
var cameraBackgroundNight: Color = Color.black;

function Start() {

	// set the sun's orbit to one cycle per day
	var orbitScript: OrbitScript = GetComponent(OrbitScript);
	orbitScript.cycle = TimeScript.day;
	
	// get a reference to the sun's light
	var light: Light = GetComponent(Light);
	
}

function Update() {
	AdjustSunLighting();
	AdjustAmbientLighting();
}

function AdjustSunLighting() {
	light.intensity = Mathf.Min(150, Mathf.Max(0, transform.position.y)) / 100;
}

function AdjustAmbientLighting() {
	var dayProgress: float = TimeScript.GetContinuousTime();
	var atmosphere = Mathf.Pow(Mathf.Sin(dayProgress * Mathf.PI), 2);
	
	var ambientLighting: Color = Color.Lerp(ambientLightingNight, ambientLightingDay, atmosphere);
	RenderSettings.ambientLight = ambientLighting;
	
	var cameraBackground: Color = Color.Lerp(cameraBackgroundNight, cameraBackgroundDay, atmosphere);
	Camera.main.backgroundColor = cameraBackground;
}