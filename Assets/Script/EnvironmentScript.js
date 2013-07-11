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
public static var TRACK_MARGIN: float = 1.5;

// layer constants
private static var LAYER_ENVIRONMENT = 11;
private static var LAYER_ENVIRONMENT_HIDDEN = 12;

function Start () {

}

function Update () {

}

private static function Hide(object: GameObject) {

	if (object.GetComponent(Renderer) != null) {
		if (object.renderer.enabled) {
			object.renderer.enabled = false;
		}
	}

	for (var child: Transform in object.transform) {
		Hide(child.gameObject);
	}

	//if (object.layer == LAYER_ENVIRONMENT) {
		//object.layer = LAYER_ENVIRONMENT_HIDDEN;
	//}
}

private static function Show(object: GameObject) {

	if (object.GetComponent(Renderer) != null) {
		if (!object.renderer.enabled) {
			object.renderer.enabled = true;
		}
	}

	for (var child: Transform in object.transform) {
		Show(child.gameObject);
	}

	//if (object.layer == LAYER_ENVIRONMENT_HIDDEN) {
		//object.layer = LAYER_ENVIRONMENT;
	//}
}

public static function Slice(axis: int, position: int, direction: int) {

	// first slice the terrain
	TerrainScript.Slice(axis, position, direction);

	// then slice the environment
	var environment: GameObject[] = FindGameObjectsInLayer(LAYER_ENVIRONMENT);
	for (var object: GameObject in environment) {
		if (axis == X_AXIS) {
			if (direction == NORTH) {
				if (object.transform.position.z < position - TRACK_MARGIN) {
					Hide(object);
				} else {
					Show(object);
				}
			} else if (direction == SOUTH) {
				if (object.transform.position.z > position + TRACK_MARGIN) {
					Hide(object);
				} else {
					Show(object);
				}
			}
		} else {
			if (direction == EAST) {
				if (object.transform.position.x < position - TRACK_MARGIN) {
					Hide(object);
				} else {
					Show(object);
				}
			} else if (direction == WEST) {
				if (object.transform.position.x > position + TRACK_MARGIN) {
					Hide(object);
				} else {
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