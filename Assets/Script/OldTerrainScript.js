#pragma strict

// globals
public static var blocks: GameObject[];
public static var blockCount: int;
public static var terrain: GameObject[,,];
public static var terrainSize: Vector3;
public static var terrainOffset: Vector3;

// materials
var ground_top: Material;
var ground_side_top: Material;
var ground_side: Material;
var ground_bottom: Material;

function Start() {
	GetBlocks();
	AlignBlocks();
	IndexBlocks();
	GenerateBlocks();
	CombineBlocks();
}

function Update() {
}

function GetBlocks() {
	var i: int = 0;
	blocks = new GameObject[transform.childCount];
	for (var child: Transform in transform) {
		blocks[i] = child.gameObject;
		i++;
	}
	blockCount = blocks.Length;
	Debug.Log('CHUNK NOTICE: Found ' + blockCount + ' blocks.');
}

function AlignBlocks() {
	for (var i = 0; i < blocks.Length; i++) {
		blocks[i].transform.position.x = Mathf.Round(blocks[i].transform.position.x);
		blocks[i].transform.position.y = Mathf.Round(blocks[i].transform.position.y);
		blocks[i].transform.position.z = Mathf.Round(blocks[i].transform.position.z);
	}
}

function IndexBlocks() {
	GetTerrainSize();
	terrain = new GameObject[terrainSize.x, terrainSize.y, terrainSize.z];
	for (var i = 0; i < blocks.Length; i++) {
		AddBlock(blocks[i]);
	}
	DoubleCheck();
}

function GetTerrainSize() {
	
	// initialize boundaries using the first block
	var minX: int = blocks[0].transform.position.x;
	var maxX: int = blocks[0].transform.position.x;
	var minY: int = blocks[0].transform.position.y;
	var maxY: int = blocks[0].transform.position.y;
	var minZ: int = blocks[0].transform.position.z;
	var maxZ: int = blocks[0].transform.position.z;
	
	// update boundaries
	for (var i = 1; i < blocks.Length; i++) {
		minX = Mathf.Min(minX, blocks[i].transform.position.x);
		maxX = Mathf.Max(maxX, blocks[i].transform.position.x);
		minY = Mathf.Min(minY, blocks[i].transform.position.y);
		maxY = Mathf.Max(maxY, blocks[i].transform.position.y);
		minZ = Mathf.Min(minZ, blocks[i].transform.position.z);
		maxZ = Mathf.Max(maxZ, blocks[i].transform.position.z);
	}
	
	// set global variables
	terrainSize =  Vector3(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
	terrainOffset = Vector3(minX, minY, minZ);
	
}

function AddBlock(block: GameObject) {
	var position = Normalize(block.transform.position);
	if (terrain[position.x, position.y, position.z] != null) Debug.Log('CHUNK WARNING: Duplicate Block found at [' + block.transform.position.x + ',' + block.transform.position.y + ',' + block.transform.position.z + ']');
	terrain[position.x, position.y, position.z] = block;
}

function RemoveBlock(block: GameObject) {
	var position = Normalize(block.transform.position);
	if (terrain[position.x, position.y, position.z] == null) Debug.Log('CHUNK WARNING: Attempt to remove non-existing Block at [' + block.transform.position.x + ',' + block.transform.position.y + ',' + block.transform.position.z + ']');
	terrain[position.x, position.y, position.z] = null;
}

function GetBlock(position: Vector3): GameObject {
	position = Normalize(position);
	if (!OutOfBounds(position)) {
		return terrain[position.x, position.y, position.z];
	} else {
		return null;
	}
}

function Normalize(position: Vector3): Vector3 {
	var normalized: Vector3;
	normalized.x = position.x - terrainOffset.x;
	normalized.y = position.y - terrainOffset.y;
	normalized.z = position.z - terrainOffset.z;
	return normalized;
}

function OutOfBounds(position: Vector3): boolean {
	
	if (position.x < 0 || position.x >= terrainSize.x) {
		return true;
	}
	if (position.y < 0 || position.y >= terrainSize.y) {
		return true;
	}
	if (position.z < 0 || position.z >= terrainSize.z) {
		return true;
	}
	return false;
	
}

function DoubleCheck() {
	var blocks = 0;
	for (var x = 0; x < terrainSize.x; x++) {
		for (var y = 0; y < terrainSize.y; y++) {
			for (var z = 0; z < terrainSize.z; z++) {
				if (terrain[x, y, z] != null) {
					blocks++;
				}
			}
		}
	}
	if (blocks == blockCount) {
		Debug.Log('CHUNK NOTICE: Indexing completed succesfully.');
	} else {
		var mismatch: int = blockCount - blocks;
		Debug.Log('CHUNK WARNING: ' + mismatch + ' out of ' + blockCount + ' blocks were not added!');
	}
}

function GenerateBlocks() {
	var hullBlocks = 0;
	for (var x = 0; x < terrainSize.x; x++) {
		for (var y = 0; y < terrainSize.y; y++) {
			for (var z = 0; z < terrainSize.z; z++) {
				var block: GameObject = terrain[x, y, z];
				if (block != null) {
					if (IsHull(block, Vector3(x, y, z))) {
						DisableBlock(block);
						hullBlocks++;
					} else {
						GenerateMesh(block, Vector3(x, y, z));
					}
				}
			}
		}
	}
	Debug.Log('CHUNK NOTICE: ' + hullBlocks + ' Hull Blocks were disabled.');
}

function IsHull(block: GameObject, position: Vector3): boolean {
	return
		CheckBlock(position + Vector3.up) == true &&
		CheckBlock(position + Vector3.down) == true &&
		CheckBlock(position + Vector3.left) == true &&
		CheckBlock(position + Vector3.right) == true &&
		CheckBlock(position + Vector3.forward) == true &&
		CheckBlock(position + Vector3.back) == true
	;
}

function CheckBlock(position: Vector3): boolean {
	if (!OutOfBounds(position) && terrain[position.x, position.y, position.z] != null) {
		return true;
	} else {
		return false;
	}
}

function DisableBlock(block: GameObject) {
	block.renderer.enabled = false;
}

function GenerateMesh(block: GameObject, position: Vector3) {
	
	// clear old mesh
	var meshFilter: MeshFilter = block.GetComponent(MeshFilter);
	meshFilter.mesh.Clear();
	
	// make vertices
	var size = 0.5;
    var vertices = [
        Vector3(-size, -size, -size),
        Vector3(-size,  size, -size),
        Vector3( size,  size, -size),
        Vector3( size, -size, -size),
        Vector3( size, -size,  size),
        Vector3( size,  size,  size),
        Vector3(-size,  size,  size),
        Vector3(-size, -size,  size)
    ]; 
    
    // make triangles
    var top_triangles = [
		5, 2, 1,
		5, 1, 6
    ];
    var back_triangles = [
		0, 1, 3,
		1, 2, 3
	];
	var left_triangles = [
		0, 7, 6,
		0, 6, 1
	];
	var front_triangles = [
		4, 5, 6,
		4, 6, 7
	];
	var right_triangles = [
		3, 2, 5,
		3, 5, 4
	];
	var bottom_triangles = [
		3, 4, 7,
		3, 7, 0
    ];
	
	// generate uvs
	var uv: Vector2[] = new Vector2[vertices.Length];
    for (var j = 0; j < uv.Length; j++) {
    	uv[j] = Vector2(vertices[j].x * 0.5, vertices[j].z * 0.5);
    }

	// set materials
	var side_material = (CheckBlock(position + Vector3.up)) ? ground_side : ground_side_top;
	block.renderer.materials = [
		 ground_top,
		 side_material,
		 side_material,
		 side_material,
		 side_material,
		 ground_bottom
	];

	// build new mesh
	var mesh = new Mesh();
    mesh.subMeshCount = 6;
    mesh.vertices = vertices;
	if (!CheckBlock(position + Vector3.up)) mesh.SetTriangles(top_triangles, 0);
	if (!CheckBlock(position + Vector3.back)) mesh.SetTriangles(back_triangles, 1);
	if (!CheckBlock(position + Vector3.left)) mesh.SetTriangles(left_triangles, 2);
	if (!CheckBlock(position + Vector3.forward)) mesh.SetTriangles(front_triangles, 3);
	if (!CheckBlock(position + Vector3.right)) mesh.SetTriangles(right_triangles, 4);
	if (!CheckBlock(position + Vector3.down)) mesh.SetTriangles(bottom_triangles, 5);
    mesh.uv = uv;
	mesh.RecalculateNormals();
    
    // set mesh
    meshFilter.mesh = mesh;
	
}

function CombineBlocks() {
	
}