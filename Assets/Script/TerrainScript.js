#pragma strict

// globals
public static var terrain: GameObject[,,];
public static var numBlocks: int;
public static var terrainSize: Vector3;
public static var terrainOffset: Vector3;

function Start() {
	
	AlignBlocks();
	PopulateTerrainArray();
	GenerateTerrainGeometry();
	
}

function Update() {
	
}

function AlignBlocks() {
	var blocks: GameObject[] = GameObject.FindGameObjectsWithTag('Voxel');
	for (var i = 0; i < blocks.Length; i++) {
		blocks[i].transform.position.x = Mathf.Round(blocks[i].transform.position.x);
		blocks[i].transform.position.y = Mathf.Round(blocks[i].transform.position.y);
		blocks[i].transform.position.z = Mathf.Round(blocks[i].transform.position.z);
	}
}

function PopulateTerrainArray() {
	var blocks: GameObject[] = GameObject.FindGameObjectsWithTag('Voxel');
	GetTerrainSize(blocks);
	terrain = new GameObject[terrainSize.x, terrainSize.y, terrainSize.z];
	for (var i = 0; i < blocks.Length; i++) {
		AddBlock(blocks[i]);
	}
	DoubleCheck();
}

function GetTerrainSize(blocks: GameObject[]) {
	
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
	numBlocks = blocks.Length;
	terrainSize =  Vector3(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
	terrainOffset = Vector3(minX, minY, minZ);
	
}

function AddBlock(block: GameObject) {
	var position = Normalize(block.transform.position);
	if (terrain[position.x, position.y, position.z] != null) Debug.Log('TERRAIN WARNING: Duplicate Block found at [' + block.transform.position.x + ',' + block.transform.position.y + ',' + block.transform.position.z + ']');
	terrain[position.x, position.y, position.z] = block;
}

function RemoveBlock(block: GameObject) {
	var position = Normalize(block.transform.position);
	if (terrain[position.x, position.y, position.z] == null) Debug.Log('TERRAIN WARNING: Attempt to remove non-existing Block at [' + block.transform.position.x + ',' + block.transform.position.y + ',' + block.transform.position.z + ']');
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
	if (blocks == numBlocks) {
		Debug.Log('Terrain conversion completed succesfully (' + blocks + ' blocks).');
	} else {
		var mismatch: int = numBlocks - blocks;
		Debug.Log('Terrain mismatch! ' + mismatch + ' out of ' + numBlocks + ' blocks were not added.');
	}
}

function GenerateTerrainGeometry() {
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
						//GenerateMesh(block, Vector3(x, y, z));
					}
				}
			}
		}
	}
	Debug.Log(hullBlocks + ' Hull Blocks were disabled.');
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
	
	var meshFilter: MeshFilter = block.GetComponent(MeshFilter);
	meshFilter.mesh.Clear();
	
	var mesh: Mesh = new Mesh();
	
	if (!CheckBlock(position + Vector3.up)) {
		
		var top_vertices: Vector3[] = new Vector3[4];
		top_vertices[0] = new Vector3(-0.5, 0.5, -0.5);
		top_vertices[1] = new Vector3(0.5, 0.5, -0.5);
		top_vertices[2] = new Vector3(-0.5, 0.5, 0.5);
		top_vertices[3] = new Vector3(0.5, 0.5, 0.5);
		mesh.vertices += top_vertices;
		
		var top_triangles: int[] = new int[6];
		top_triangles[0] = 0;
		top_triangles[1] = 2;
		top_triangles[2] = 1;
		top_triangles[3] = 2;
		top_triangles[4] = 3;
		top_triangles[5] = 1;
		mesh.triangles += top_triangles;
		
		var top_normals: Vector3[] = new Vector3[4];
		top_normals[0] = Vector3.down;
		top_normals[1] = Vector3.down;
		top_normals[2] = Vector3.down;
		top_normals[3] = Vector3.down;
		mesh.normals += top_normals;
		
		var top_uv: Vector2[] = new Vector2[4];
		top_uv[0] = new Vector2(0, 0);
		top_uv[1] = new Vector2(1, 0);
		top_uv[2] = new Vector2(0, 1);
		top_uv[3] = new Vector2(1, 1);
		mesh.uv += top_uv;

	}
	
	if (!CheckBlock(position + Vector3.back)) {
		
		var front_vertices: Vector3[] = new Vector3[4];
		front_vertices[0] = new Vector3(-0.5, 0.5, -0.5);
		front_vertices[1] = new Vector3(0.5, 0.5, -0.5);
		front_vertices[2] = new Vector3(-0.5, -0.5, -0.5);
		front_vertices[3] = new Vector3(0.5, -0.5, -0.5);
		mesh.vertices += front_vertices;
		
		var front_triangles: int[] = new int[6];
		front_triangles[0] = 0;
		front_triangles[1] = 2;
		front_triangles[2] = 1;
		front_triangles[3] = 2;
		front_triangles[4] = 3;
		front_triangles[5] = 1;
		mesh.triangles += front_triangles;
		
		var front_normals: Vector3[] = new Vector3[4];
		front_normals[0] = Vector3.down;
		front_normals[1] = Vector3.down;
		front_normals[2] = Vector3.down;
		front_normals[3] = Vector3.down;
		mesh.normals += front_normals;
		
		var front_uv: Vector2[] = new Vector2[4];
		front_uv[0] = new Vector2(0, 0);
		front_uv[1] = new Vector2(1, 0);
		front_uv[2] = new Vector2(0, 1);
		front_uv[3] = new Vector2(1, 1);
		mesh.uv += front_uv;

	}
	
	meshFilter.mesh = mesh;
	
}