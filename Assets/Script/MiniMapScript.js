#pragma strict

var target: Transform;
var distance: float = 20;
//var storedShadowDistance: float;

function Start() {

}

function Update() {
	Follow();
}

function Follow() {
	transform.position.x = target.position.x;
	transform.position.y = target.position.y + distance;
	transform.position.z = target.position.z;
	transform.localEulerAngles.y = target.localEulerAngles.y - 90;
}

function OnPreRender() {
    //storedShadowDistance = QualitySettings.shadowDistance;
    //QualitySettings.shadowDistance = 0;
}
 
function OnPostRender() {
    //QualitySettings.shadowDistance = storedShadowDistance;
}