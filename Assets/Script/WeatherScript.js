#pragma strict

var ambientLightingDay: Color = Color.white;
var ambientLightingNight: Color = Color.black;
var cameraBackgroundDay: Color = Color.white;
var cameraBackgroundNight: Color = Color.black;

function Start () {
	
}

function Update () {
	AdjustAmbientLighting();
}

function AdjustAmbientLighting() {
	var dayProgress: float = TimeScript.GetContinuousTime();
	var atmosphere = Mathf.Pow(Mathf.Sin(dayProgress * Mathf.PI), 2);
	
	var ambientLighting: Color = Color.Lerp(ambientLightingNight, ambientLightingDay, atmosphere);
	RenderSettings.ambientLight = ambientLighting;
	
	var cameraBackground: Color = Color.Lerp(cameraBackgroundNight, cameraBackgroundDay, atmosphere);
	Camera.main.backgroundColor = cameraBackground;
}