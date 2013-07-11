#pragma strict

// constants
public static var CHUNK_SIZE: int = 16;
public static var AHEAD: int = -1;
public static var INTERSECT: int = 0;
public static var BEHIND: int = 1;

// members
private var position: Vector3;
private var blocks: Block[,,];
private var mesh: Mesh;
private var meshFilter: MeshFilter;
private var meshCollider: MeshCollider;

function Start () {
}

function Update () {
}

// initializes the chunk
public function Initialize() {
	
	// get mesh components
	meshFilter = GetComponent(MeshFilter);
	meshCollider = GetComponent(MeshCollider);

	// build the chunk
	blocks = new Block[CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE];
	for (var x = 0; x < CHUNK_SIZE; x++) {
		for (var y = 0; y < CHUNK_SIZE; y++) {
			for (var z = 0; z < CHUNK_SIZE; z++) {
				var terrainIndex = TerrainScript.Position2Index(transform.position + Vector3(x, y, z));
				if (InRange(terrainIndex)) {
					var type = TerrainScript.TERRAIN[terrainIndex.x, terrainIndex.y, terrainIndex.z];
					if (type != 0) {
						blocks[x, y, z] = new Block(type);
					}
				}
			}
		}
	}
	
	// render the chunk
	Render();
}

function InRange(position: Vector3): boolean {
	if (position.x < 0 || position.x >= TerrainScript.TERRAIN_SIZE.x) return false;
	if (position.y < 0 || position.y >= TerrainScript.TERRAIN_SIZE.y) return false;
	if (position.z < 0 || position.z >= TerrainScript.TERRAIN_SIZE.z) return false;
	return true;
}

///////////////
// RENDERING //
///////////////

// renders the chunk
public function Render() {

	if (meshFilter.mesh) meshFilter.mesh.Clear();
	if (meshCollider.mesh) meshCollider.mesh.Clear();

	// generate vertices and triangles
	var vertices = new Array();
	var triangles = new Array();

	for (var x = 0; x < CHUNK_SIZE; x++) {
		for (var y = 0; y < CHUNK_SIZE; y++) {
			for (var z = 0; z < CHUNK_SIZE; z++) {
			
				var position = Vector3(x, y, z);
				var block: Block = this.blocks[x, y, z];
				
				if (block != null && block.IsActive()) {
					
					var vertexIndex: int = 0;

                    if (!IsOccupied(position + Vector3.up, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
                    
                    if (!IsOccupied(position + Vector3.back, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
                    
                    if (!IsOccupied(position + Vector3.left, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
                    
                    if (!IsOccupied(position + Vector3.forward, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
                    
                    if (!IsOccupied(position + Vector3.right, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y + Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
                    
                    if (!IsOccupied(position + Vector3.down, true)) {
                    
                        vertexIndex = vertices.length;
                        
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x - Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z - Block.BLOCKSIZE));
                        vertices.Add(Vector3(position.x + Block.BLOCKSIZE, position.y - Block.BLOCKSIZE, position.z + Block.BLOCKSIZE));
 
                        triangles.Add(vertexIndex);
                        triangles.Add(vertexIndex + 1);
                        triangles.Add(vertexIndex + 2);
                         
                        triangles.Add(vertexIndex + 2);
                        triangles.Add(vertexIndex + 3);
                        triangles.Add(vertexIndex);
                    }
				}
			}
		}
	}
	
	// generate uvs
	var uv: Vector2[] = new Vector2[vertices.length];
    for (var i = 0; i < uv.length; i++) {
    	var vertice: Vector3 = vertices[i];
    	uv[i] = Vector2(vertice.x, vertice.z);
    }
	
	// build mesh
	mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.triangles = triangles;
    mesh.uv = uv;
    mesh.RecalculateNormals();
    
    // set mesh to filter and collider
	meshFilter.mesh = mesh;
	meshCollider.mesh = mesh;
}

// checks whether a space is occupied
public function IsOccupied(position: Vector3, ignoreTranslucent: boolean): boolean {
	
	// if the position is not in range, assume that the position is not occupied
	//TODO better than this assumption would be a check in the adjacent chunk
	if (position.x < 0 || position.y < 0 || position.z < 0 || position.x >= CHUNK_SIZE || position.y >= CHUNK_SIZE || position.z >= CHUNK_SIZE) {
		return false;
	}
	
	// check the position for a block
	var block = blocks[position.x, position.y, position.z];
	if (block == null || !block.IsActive() || (ignoreTranslucent && block.IsTranslucent())) {
		return false;
	} else {
		return true;
	}
	
}

/////////////
// SLICING //
/////////////

public function GetSlicePosition(axis: int, position: int, direction: int): int {

	// determine which coordinate of the chunk's position to evaluate
	var chunkPosition: float;
	var reverseDirection = false;
	if (axis == EnvironmentScript.X_AXIS) {
		chunkPosition = transform.position.z;
		if (direction == EnvironmentScript.SOUTH) {
			reverseDirection = true;
		}
	} else {
		chunkPosition = transform.position.x;
		if (direction == EnvironmentScript.WEST) {
			reverseDirection = true;
		}
	}

	if (position >= chunkPosition) {
		if (position <= chunkPosition + CHUNK_SIZE) {
			return INTERSECT;
		}
		return (reverseDirection) ? BEHIND : AHEAD;
	}
	return (reverseDirection) ? AHEAD : BEHIND;
}

public function Slice(axis: int, position: int, direction: int) {
	var different = false;
	for (var x = 0; x < CHUNK_SIZE; x++) {
		for (var y = 0; y < CHUNK_SIZE; y++) {
			for (var z = 0; z < CHUNK_SIZE; z++) {
				var block: Block = blocks[x, y, z];
				if (block != null) {
					if (axis == EnvironmentScript.X_AXIS) {
						if (direction == EnvironmentScript.NORTH) {
							if (transform.position.z + z < position - EnvironmentScript.TRACK_MARGIN) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}
							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						} else if (direction == EnvironmentScript.SOUTH) {
							if (transform.position.z + z > position + EnvironmentScript.TRACK_MARGIN) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}
							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						}
					} else {
						if (direction == EnvironmentScript.EAST) {
							if (transform.position.x + x < position - EnvironmentScript.TRACK_MARGIN) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}
							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						} else if (direction == EnvironmentScript.WEST) {
							if (transform.position.x + x > position + EnvironmentScript.TRACK_MARGIN) {
								if (block.IsActive()) {
									block.SetActive(false);
									different = true;
								}
							} else {
								if (!block.IsActive()) {
									block.SetActive(true);
									different = true;
								}
							}
						}
					}
				}
			}
		}
	}
	if (different) {
		Render();
	}
	Show();
}

public function Hide() {
	if (renderer.enabled) {
		renderer.enabled = false;
	}
}

public function Show() {
	if (!renderer.enabled) {
		renderer.enabled = true;
	}
}

public function ShowAll() {
	for (var x = 0; x < CHUNK_SIZE; x++) {
		for (var y = 0; y < CHUNK_SIZE; y++) {
			for (var z = 0; z < CHUNK_SIZE; z++) {
				var block: Block = blocks[x, y, z];
				if (block != null) {
					block.SetActive(true);
				}
			}
		}
	}
	Render();
	Show();
}

////////////
// BLOCKS //
////////////

class Block {

	// constants
	final public static var BLOCKSIZE: float = 0.5;
	public static class BLOCKTYPE {
		public var GRASS: int = 1;
		public var DIRT: int = 2;
		public var STONE: int = 3;
		public var WOOD: int = 4;
		public var SAND: int = 5;
		public var LAVA: int = 6;
	}

	// members
	private var type: int;
	private var translucent: boolean = false;
	private var active: boolean = true;
	
	// constructors
	public function Block(_type: int) {
		type = _type;
	}
	public function Block(_type: int, _translucent: boolean) {
		type = _type;
		translucent = _translucent;
	}
	
	// getters
	public function IsTranslucent(): boolean {
		return translucent;
	}
	public function IsActive(): boolean {
		return active;
	}
	
	// setters
	public function SetType(_type: int) {
		type = _type;
	}
	public function SetActive(_active: boolean) {
		active = _active;
	}
}