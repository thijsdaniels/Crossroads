#pragma strict

// environment constants
public static var NORTH: int = 0;
public static var EAST: int = 1;
public static var SOUTH: int = 2;
public static var WEST: int = 3;
public static var X_AXIS: int = 0;
public static var Z_AXIS: int = 1;
public static var CLOCKWISE: int = -1;
public static var COUNTERCLOCKWISE: int = 1;

// track constants
private static var TRACK_MARGIN: float = 1.5;

// layer constants
private static var LAYER_ENVIRONMENT = 11;
private static var LAYER_ENVIRONMENT_HIDDEN = 12;

function Start () {

}

function Update () {

}

private static function Hide(object: GameObject) {
	if (object.layer == LAYER_ENVIRONMENT) {
		object.layer = LAYER_ENVIRONMENT_HIDDEN;
	}
}

private static function Show(object: GameObject) {
	if (object.layer == LAYER_ENVIRONMENT_HIDDEN) {
		object.layer = LAYER_ENVIRONMENT;
	}
}

public static function HideEnvironment(axis: int, position: int, direction: int) {
	var visible_environment: GameObject[] = FindGameObjectsInLayer(LAYER_ENVIRONMENT);
	for (var object: GameObject in visible_environment) {
		if (axis == X_AXIS) {
			if (direction == NORTH) {
				if (object.transform.position.z < position - TRACK_MARGIN) {
					Hide(object);
				}
			} else if (direction == SOUTH) {
				if (object.transform.position.z > position + TRACK_MARGIN) {
					Hide(object);
				}
			}
		} else {
			if (direction == EAST) {
				if (object.transform.position.x < position - TRACK_MARGIN) {
					Hide(object);
				}
			} else if (direction == WEST) {
				if (object.transform.position.x > position + TRACK_MARGIN) {
					Hide(object);
				}
			}
		}
	}
}

public static function ShowEnvironment(axis: int, position: int, direction: int) {
	var hidden_environment: GameObject[] = FindGameObjectsInLayer(LAYER_ENVIRONMENT_HIDDEN);
	for (var object: GameObject in hidden_environment) {
		if (axis == X_AXIS) {
			if (direction == NORTH) {
				if (object.transform.position.z < position - TRACK_MARGIN) {
					Show(object);
				}
			} else if (direction == SOUTH) {
				if (object.transform.position.z > position + TRACK_MARGIN) {
					Show(object);
				}
			}
		} else {
			if (direction == EAST) {
				if (object.transform.position.x < position - TRACK_MARGIN) {
					Show(object);
				}
			} else if (direction == WEST) {
				if (object.transform.position.x > position + TRACK_MARGIN) {
					Show(object);
				}
			}
		}
	}
}

private static function FindGameObjectsInLayer(layer: int): GameObject[] {
    var goArray = FindObjectsOfType(GameObject);
    var goList = new System.Collections.Generic.List.<GameObject>();
    for (var i = 0; i < goArray.Length; i++) {
       if (goArray[i].layer == layer) {
         goList.Add(goArray[i]);
       }
    }
    if (goList.Count == 0) {
       return null;
    }
    return goList.ToArray();
}