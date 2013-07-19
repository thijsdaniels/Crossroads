#pragma strict

public static var BLOCKS: GameObject[];
public static var TERRAIN_SIZE: Vector3;
public static var TERRAIN_OFFSET: Vector3;
public static var TERRAIN: int[,,];
public static var CHUNKS: GameObject[,,];

public var chunkPrefab: GameObject;

function Start () {
	PrepareTerrain();
	IndexTerrain();
	UnsetTerrain();
	CreateChunks();
}

function Update () {
}

function PrepareTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// initialize block array
	BLOCKS = new GameObject[transform.childCount];
	
	// initialize terrain boundaries
	var minX: int = 0;
	var maxX: int = 0;
	var minY: int = 0;
	var maxY: int = 0;
	var minZ: int = 0;
	var maxZ: int = 0;
	
	// prepare terrain
	for (var i: int = 0; i < BLOCKS.Length; i++) {
    	var block = transform.GetChild(i);
    	
    	// align block
		block.position = Vector3(Mathf.Round(block.position.x), Mathf.Round(block.position.y), Mathf.Round(block.position.z));
		
		// update terrain boundaries
		minX = Mathf.Min(minX, block.transform.position.x);
		maxX = Mathf.Max(maxX, block.transform.position.x);
		minY = Mathf.Min(minY, block.transform.position.y);
		maxY = Mathf.Max(maxY, block.transform.position.y);
		minZ = Mathf.Min(minZ, block.transform.position.z);
		maxZ = Mathf.Max(maxZ, block.transform.position.z);
		
		// store block
		BLOCKS[i] = block.gameObject;
	}
	
	// store terrain boundaries
	TERRAIN_SIZE =  Vector3(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
	TERRAIN_OFFSET = Vector3(minX, minY, minZ);

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Prepared ' + BLOCKS.Length + ' Blocks in ' + startTime.ToString('f0') + ' milliseconds.');

}

function IndexTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// build terrain
	TERRAIN = new int[TERRAIN_SIZE.x, TERRAIN_SIZE.y, TERRAIN_SIZE.z];
	for (var i: int = 0; i < BLOCKS.Length; i++) {
	
		// get block position
		var block = BLOCKS[i];
		var index = Position2Index(block.transform.position);
		if (TERRAIN[index.x, index.y, index.z] != 0) Debug.LogWarning('TERRAIN: Duplicate Block found at ' + block.transform.position);
		
		// get block type from tag
		var type = parseInt(block.tag);
		
		// store block type at block index
		TERRAIN[index.x, index.y, index.z] = type;
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Indexed terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
	
}

function UnsetTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;

	for (var i: int = 0; i < BLOCKS.Length; i++) {
		Destroy(BLOCKS[i]);
	}
	BLOCKS = null;

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Unset terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
}

// converts a worldspace coordinate to a terrain index
public static function Position2Index(position: Vector3): Vector3 {
	return position - TERRAIN_OFFSET;
}

// converts a worldspace coordinate to a terrain index
public static function Index2Position(index: Vector3): Vector3 {
	return index + TERRAIN_OFFSET;
}

// builds chunks using the terrain array
function CreateChunks() {

	var startTime = Time.realtimeSinceStartup * 1000;

	// calculate the number of chunks
	var worldSize = Vector3(Mathf.Ceil(TERRAIN_SIZE.x / ChunkScript.CHUNK_SIZE), Mathf.Ceil(TERRAIN_SIZE.y / ChunkScript.CHUNK_SIZE), Mathf.Ceil(TERRAIN_SIZE.z / ChunkScript.CHUNK_SIZE));

	// initialize chunk array
	CHUNKS = new GameObject[worldSize.x, worldSize.y, worldSize.z];
	for (var x = 0; x < worldSize.x; x++) {
		for (var y = 0; y < worldSize.y; y++) {
			for (var z = 0; z < worldSize.z; z++) {
			
				// instantiate a chunk
				var position = Index2Position(Vector3(x, y, z) * ChunkScript.CHUNK_SIZE);
				var chunk: GameObject = Instantiate(chunkPrefab, position, Quaternion.identity);
				CHUNKS[x, y, z] = chunk;
				
				// initialize the chunk
				var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
				chunkScript.Initialize();
			}
		}
	}

	var numChunks = worldSize.x * worldSize.y * worldSize.z;
	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Built ' + numChunks + ' Chunks in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public static function Slice(axis: int, position: int, direction: int) {

	var startTime = Time.realtimeSinceStartup * 1000;

	for (var chunk: GameObject in CHUNKS) {

		// get the chunk's position relative to the track
		var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
		var chunkPosition = chunkScript.GetSlicePosition(axis, position, direction);

		// if the chunk is intersected by the track, slice it
		if (chunkPosition == ChunkScript.INTERSECT) {
			chunkScript.Slice(axis, position, direction);
		}

		// else, if the chunk is ahead of the track, hide it
		else if (chunkPosition == ChunkScript.AHEAD) {
			chunkScript.Hide();
		}
		
		// else, if the chunk is behind the track, show it
		else if (chunkPosition == ChunkScript.BEHIND) {
			chunkScript.ShowAll();
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Hid terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
}