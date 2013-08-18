# Crossroads

### A 2.75D platformer adventure game, inspired by Zelda, FEZ and Mario.

## Task List <code>Demo Alpha Version</code>

### Voxel-Engine
- The collision mesh should not be reset during chunk rendering. Right now, all blocks that are sliced away are physically gone. They should only be invisible.

### Controls
- Make Y the context sensitive button and allow items to be equipped to X, A and B. This means there is no jumping button; instead, there will be a jumping item.
- I don't know whether the item reserves (D-Pad) are necessary.
- How should the player run? Is it a standard ability, or should it be an item too? If it is a standard ability, which button should it be?

### Enemies

### NPCs

### Diving, Digging and Flying
Since the game is viewed entirely from the side, there is inherently an emphasis on vertical movement. Because of that, going underground, under water and into the air are big opportunities. The awesome thing is that the player can see underground and under water before he has a way to dig and swim, as the terrain slicing makes everything visible.
- Make diving gear.
- Make a shovel. It can dig away blocks below the player (but only designated blocks, otherwise the player could get himself stuck too easily) to reach underground caverns.
- Make a way to fly ssb style, or at least double jump.
- Maybe even make a place higher than the sky land that is in space with low gravity? Maybe fun to make gravity so low that jumping would launch you too high and kill you, so you need the iron boots to jump lower.

### Fix Player Movement
- What is the correct way to move a rigidbody? Should it be translated, or should a force be applied? The latter seems to work better, but is still not very smooth. Or do all terrain blocks need to have a rigidbody component as well? Or a terrain-collider perhaps?
- The player should be bound to the path. What is the best way of doing this? Probably to set a fixed height for the world (say 256 voxels) and make invisible wall colliders of 256 voxels high at the dead end of every path. The main problem that arises from this approach is that if there is a path right above a dead end, that path will be blocked by the invisible wall. This may be solved by setting the height of these invisible walls by hand, but his must be done carefully to avoid gamebreakers.
- The player does not collide well with terrain objects, presumably this will be fixed together with the movement issue.
- The player's jumping method is not as good as I would like it to be. He should jump higher, but also be heavier.
- The IsGrounded() function currently uses a raycast. It might be necessary to switch to a capsulecast.

### Climbables
- Climbables, such as ladders, may be on a track as well as next to a track.
- If a climbable is on a track, the camera will turn to face the ladder when the player starts climbing and will return to be perpendicular to the player when the player stops climbing.
- If a climbable is next to the track, instead the player will turn to face the ladder when the player starts climbing. the camera will then switch to be perpendicular to the player when the player stops climbing.
- Should ladders that are next to the track on the camera-side be visible and climbable?

### Buttons and Levers
- What is the best way to implement different types of buttons? Can I set a function name as a variable, or do I have to make different scripts for each button type?
- Make buttons / levers that, instead of activating once, like a button, can be toggled between active and non-active states.
- Make pushable and grabable crates that, like in zelda, can be dropped on top of buttons.

### Treasure Chests
- What is the best way to implement different content for treasure chests? Can I set a function name as a variable, or should I use a GameObject?
- POSSIBLE ANSWER TO ABOVE POINT: USE SUBCLASSES FOR OBJECT INHERITANCE AND INHERIT THE open() METHOD
- Make the treasure chest script.

### Time and Weather
- Make a moon.
- Make a script for the weather controller that spawns clouds and makes it rain, snow and thunder.