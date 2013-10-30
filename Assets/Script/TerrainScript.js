#pragma strict

public static var BLOCKS: ArrayList;
public static var TERRAIN_SIZE: Vector3;
public static var TERRAIN_OFFSET: Vector3;
public static var TERRAIN: int[,,];
public static var CHUNKS: GameObject[,,];

private static var MIN_X: float = Mathf.Infinity;
private static var MIN_Y: float = Mathf.Infinity;
private static var MIN_Z: float = Mathf.Infinity;
private static var MAX_X: float = Mathf.NegativeInfinity;
private static var MAX_Y: float = Mathf.NegativeInfinity;
private static var MAX_Z: float = Mathf.NegativeInfinity;

public var generate: boolean = false;
public var heightmap: Texture2D;
public var chunkPrefab: GameObject;

function Start () {
	
	if (generate) {
		GenerateTerrain();
	}
	
	else {
		PrepareTerrain();
		IndexTerrain();
		UnsetTerrain();
	}
	
	CreateChunks();
}

function Update () {
}

// generates terrain using perlin noise (mostly for fun, but useful for tweaking performance)
function GenerateTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	TERRAIN_SIZE =  Vector3(heightmap.width, 64, heightmap.height);
	TERRAIN_OFFSET = Vector3(0, 0, 0);

	var heightOffset = 0;
	
	TERRAIN = new int[TERRAIN_SIZE.x, TERRAIN_SIZE.y, TERRAIN_SIZE.z];
	
	for (var x: int = 0; x < TERRAIN_SIZE.x; x++) {
		for (var z: int = 0; z < TERRAIN_SIZE.z; z++) {

			var height = heightOffset + Mathf.Ceil(heightmap.GetPixel(x, z).grayscale * (TERRAIN_SIZE.y - heightOffset));

			for (var y: int = 0; y < TERRAIN_SIZE.y; y++) {
				
				var type = 2;
				if (y == height - 1) type = 1;
				if (y < height - 10) type = 3;

				if (y >= height) continue;
				
				TERRAIN[x, y, z] = type;
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Generated a ' + heightmap.width + ' by ' + heightmap.height + ' World in ' + startTime.ToString('f0') + ' milliseconds.');
	
}

function PrepareTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// traverse the terrain tree
	BLOCKS = new ArrayList();
	TraverseTerrain(this.gameObject);
	
	// store terrain boundaries
	TERRAIN_SIZE =  Vector3(MAX_X - MIN_X + 1, MAX_Y - MIN_Y + 1, MAX_Z - MIN_Z + 1) / Block.BLOCK_SPAN;
	TERRAIN_OFFSET = Vector3(MIN_X, MIN_Y, MIN_Z);

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Prepared ' + BLOCKS.Count + ' Blocks in ' + startTime.ToString('f0') + ' milliseconds.');

}

function TraverseTerrain(node: GameObject) {

	if (node.transform.childCount == 0) Visit(node);
	else {
		for (var i: int = 0; i < node.transform.childCount; i++) {
			TraverseTerrain(node.transform.GetChild(i).gameObject);
		}
	}
}

function Visit(block: GameObject) {

	// align block
	//block.transform.position = Vector3(Mathf.Round(block.transform.position.x), Mathf.Round(block.transform.position.y), Mathf.Round(block.transform.position.z));
	
	// calculate block span
	var minX = block.transform.position.x - (block.transform.localScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxX = block.transform.position.x + (block.transform.localScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var minY = block.transform.position.y - (block.transform.localScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxY = block.transform.position.y + (block.transform.localScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var minZ = block.transform.position.z - (block.transform.localScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
	var maxZ = block.transform.position.z + (block.transform.localScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;

	// update terrain boundaries
	MIN_X = Mathf.Min(MIN_X, minX);
	MAX_X = Mathf.Max(MAX_X, maxX);
	MIN_Y = Mathf.Min(MIN_Y, minY);
	MAX_Y = Mathf.Max(MAX_Y, maxY);
	MIN_Z = Mathf.Min(MIN_Z, minZ);
	MAX_Z = Mathf.Max(MAX_Z, maxZ);
	
	// store block
	BLOCKS.Add(block);
}

function IndexTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;
	
	// build terrain
	TERRAIN = new int[TERRAIN_SIZE.x, TERRAIN_SIZE.y, TERRAIN_SIZE.z];
	for (var i: int = 0; i < BLOCKS.Count; i++) {
	
		// get block position
		var block: GameObject = BLOCKS[i];
		
		// get block type from tag
		var type = parseInt(block.tag);

		// calculate block span
		var minX = block.transform.position.x - (block.transform.localScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxX = block.transform.position.x + (block.transform.localScale.x / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var minY = block.transform.position.y - (block.transform.localScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxY = block.transform.position.y + (block.transform.localScale.y / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var minZ = block.transform.position.z - (block.transform.localScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;
		var maxZ = block.transform.position.z + (block.transform.localScale.z / Block.BLOCK_SPAN - 1) * Block.BLOCK_SIZE;

		for (var x: float = minX; x <= maxX; x += Block.BLOCK_SPAN) {
			for (var y: float = minY; y <= maxY; y += Block.BLOCK_SPAN) {
				for (var z: float = minZ; z <= maxZ; z += Block.BLOCK_SPAN) {

					var index = Position2Index(Vector3(x, y, z));

					// store block type at block index
					if (TERRAIN[index.x, index.y, index.z] != 0) Debug.LogWarning('TERRAIN: Duplicate Block found at ' + block.transform.position);
					TERRAIN[index.x, index.y, index.z] = type;
				}
			}
		}
	}

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Indexed terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
	
}

function UnsetTerrain() {

	var startTime = Time.realtimeSinceStartup * 1000;

	for (var i: int = 0; i < BLOCKS.Count; i++) {
		Destroy(BLOCKS[i]);
	}
	BLOCKS = null;

	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Unset terrain in ' + processingTime.ToString('f0') + ' milliseconds.');
}

// converts a worldspace coordinate to a terrain index
public static function Position2Index(position: Vector3): Vector3 {
	return (position - TERRAIN_OFFSET) / Block.BLOCK_SPAN;
}

// converts an index to a worldspace coordinate
public static function Index2Position(index: Vector3): Vector3 {
	return index * Block.BLOCK_SPAN + TERRAIN_OFFSET;
}

// builds chunks using the terrain array
function CreateChunks() {

	var startTime = Time.realtimeSinceStartup * 1000;

	// calculate the number of chunks
	var worldSize = Vector3(Mathf.Ceil(TERRAIN_SIZE.x / ChunkScript.CHUNK_SIZE.x), Mathf.Ceil(TERRAIN_SIZE.y / ChunkScript.CHUNK_SIZE.y), Mathf.Ceil(TERRAIN_SIZE.z / ChunkScript.CHUNK_SIZE.x));

	// initialize chunks
	CHUNKS = new GameObject[worldSize.x, worldSize.y, worldSize.z];
	for (var x = 0; x < worldSize.x; x++) {
		for (var y = 0; y < worldSize.y; y++) {
			for (var z = 0; z < worldSize.z; z++) {
			
				// instantiate a chunk
				var position = Vector3(x * ChunkScript.CHUNK_SIZE.x * Block.BLOCK_SPAN, y * ChunkScript.CHUNK_SIZE.y * Block.BLOCK_SPAN, z * ChunkScript.CHUNK_SIZE.x * Block.BLOCK_SPAN);
				var chunk: GameObject = Instantiate(chunkPrefab, position, Quaternion.identity);
				CHUNKS[x, y, z] = chunk;
				
				// initialize the chunk
				var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
				chunkScript.Initialize(x, y, z);
			}
		}
	}

	// this is called here because all chunks must be initialized before rendering, so that occupation in adjacent chunks can be checked
	RenderChunks();

	var numChunks = worldSize.x * worldSize.y * worldSize.z;
	var processingTime = Time.realtimeSinceStartup * 1000 - startTime;
	Debug.Log('TERRAIN: Built ' + numChunks + ' Chunks in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public static function Slice(axis: int, position: float, direction: int) {

	var chunksSliced = 0;
	var startTime = Time.realtimeSinceStartup * 1000;

	for (var chunk: GameObject in CHUNKS) {

		// get the chunk's position relative to the track
		var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
		var chunkPosition = chunkScript.GetSlicePosition(axis, position, direction);

		// if the chunk is intersected by the track, slice it
		if (chunkPosition == ChunkScript.INTERSECT) {
			chunkScript.Slice(axis, position, direction);
			chunksSliced++;
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
	Debug.Log('TERRAIN: Sliced ' + chunksSliced + ' chunks in ' + processingTime.ToString('f0') + ' milliseconds.');
}

public static function RenderChunks() {
	for (var chunk: GameObject in CHUNKS) {
		var chunkScript: ChunkScript = chunk.GetComponent(ChunkScript);
		chunkScript.Render();
	}
}