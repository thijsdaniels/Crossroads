#pragma strict

function Start () {
	
}

function Update () {
	var time: Vector4 = TimeScript.GetDiscreteTime();
	var display: GUIText = GetComponent(GUIText);
	display.text = String.Format ('{0:00}:{1:00}', time[1], time[2]);
}