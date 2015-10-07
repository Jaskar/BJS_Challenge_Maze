/// <reference path="babylon.2.2.d.ts"/>
/// <reference path="Game.ts"/>

class Generator {

    //******************************** MEMBERS

    private maze : number[][][];
    private width : number;
    private height : number;
    private length : number;
    private path : BABYLON.Vector3[];
    public static BLOCK_SIZE = 4;
    public setDirection : boolean;


    //******************************** CONSTRUCTOR

    constructor() {
        this.setDirection = true;
        this.maze = [];
        this.path = [];
    }


    //******************************** FUNCTIONS

    public generate(width, height, length) : BABYLON.Vector3 {
        this.width = width;
        this.height = height;
        this.length = length;

        var exitPoint = new BABYLON.Vector3(0,0,0);
        var pathMaxLength = 0;

        var point : BABYLON.Vector3 = BABYLON.Vector3.Zero();
        this.path.push(point);

        for(var x = -(this.width/2)-1; x < (this.width/2)+1; x++) {
            this.maze[x] = [];
            for(var y = -(this.height/2)-1; y < (this.height/2)+1; y++) {
                this.maze[x][y] = [];
                for(var z = 0; z < this.length; z++) {
                    this.maze[x][y][z] = 1;
                }
            }
        }

        this.maze[0][0][0] = 0;

        do {
            var direction = this.getRandomDir(point);

            if(direction == 0) {
                if(this.path.length >= pathMaxLength) {
                    pathMaxLength = this.path.length;
                    exitPoint = this.path[this.path.length-1].clone();
                }

                this.path.pop();
                point = this.path[this.path.length-1];
            }
            else {
                this.dig(point, direction);
            }
        } while(this.path.length > 0);

        var wallList = [];
        var mergedWall;
        var templateWall = BABYLON.Mesh.CreateBox(
            "wall", 4,
            GAME.instance.getScene()
        );
        templateWall.isVisible = false;

        for(var x = -(this.width/2); x < (this.width/2)+1; x++) {
            for(var y = -(this.height/2); y < (this.height/2)+1; y++) {
                for(var z = 0; z < this.length; z++) {
                    if (this.maze[x][y][z] == 1) {
                        wallList.push(<BABYLON.Mesh>templateWall.clone("wall"));
                        wallList[wallList.length - 1].isVisible = true;
                        wallList[wallList.length - 1].position.x = x * Generator.BLOCK_SIZE;
                        if(length == 1) {
                            wallList[wallList.length - 1].position.y = 1;
                        }
                        else if(length == 2) {
                            wallList[wallList.length - 1].position.y = z * Generator.BLOCK_SIZE * 2;
                        }
                        wallList[wallList.length - 1].position.z = y * Generator.BLOCK_SIZE;
                    }
                }
            }
        }

        var wallMat = new BABYLON.StandardMaterial("alphaMat", GAME.instance.getScene());
        wallMat.diffuseColor = BABYLON.Color3.Gray();
        wallMat.specularColor = BABYLON.Color3.Gray();

        mergedWall = <BABYLON.Mesh>BABYLON.Mesh.MergeMeshes(wallList, true, true);
        mergedWall.checkCollisions = true;
        mergedWall.material = wallMat;

        var ground = BABYLON.Mesh.CreateGround(
            "ground",
            this.width * Generator.BLOCK_SIZE,
            this.height * Generator.BLOCK_SIZE,
            1,
            GAME.instance.getScene()
        );
        ground.checkCollisions = true;
        if(length == 1) {
            ground.position.y = -1;
        }
        else if(length == 2) {
            ground.position.y = -Generator.BLOCK_SIZE/2;
            var groundTop = ground.clone("groundTop");
            groundTop.position.y = -Generator.BLOCK_SIZE/2 + Generator.BLOCK_SIZE*3;
            groundTop.rotation.x = Math.PI;
        }

        return exitPoint;
    }

    /**
     * Dig the way
     * @param position
     * @param direction
     * @returns {BABYLON.Vector2}
     */
    private dig(position : BABYLON.Vector3, direction : number) {

        switch (direction) {

            case 1:
                position.x --;
                this.maze[position.x][position.y][position.z] = 0;
                position.x --;
                this.maze[position.x][position.y][position.z] = 0;
                break;

            case 2 :
                position.y ++;
                this.maze[position.x][position.y][position.z] = 0;
                position.y ++;
                this.maze[position.x][position.y][position.z] = 0;
                break;

            case 3 :
                position.x ++;
                this.maze[position.x][position.y][position.z] = 0;
                position.x ++;
                this.maze[position.x][position.y][position.z] = 0;
                break;

            case 4 :
                position.y --;
                this.maze[position.x][position.y][position.z] = 0;
                position.y --;
                this.maze[position.x][position.y][position.z] = 0;
                break;

            case 5:
                position.z ++;
                this.maze[position.x][position.y][position.z] = 0;
                break;

            case 6:
                position.z --;
                this.maze[position.x][position.y][position.z] = 0;
                break;
        }

        this.path.push(position.clone());
    }

    /**
     * Get random direction
     * @param position
     * @returns {number}
     */
    private getRandomDir(position : BABYLON.Vector3) : number {

        var possibleDirs;

        if(this.path.length == 1 && this.setDirection) {
            possibleDirs = [1,2,3,4];
        }
        else {
            possibleDirs = [1,2,3,4,5,6];
        }

        var returnDir = 0;

        do {
            var rand = Math.floor(Math.random() * possibleDirs.length);

            switch (possibleDirs[rand]) {

                case 1: // Backward
                    if(position.x -2 >= -(this.width/2)+1 &&
                        this.maze[position.x -2][position.y][position.z] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;

                case 2 : // Right
                    if(position.y +2 <= (this.height/2) &&
                        this.maze[position.x][position.y +2][position.z] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;

                case 3 : // Forward
                    if(position.x +2 <= (this.width/2) &&
                        this.maze[position.x +2][position.y][position.z] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;

                case 4 : // Left
                    if(position.y -2 >= -(this.height/2)+1 &&
                        this.maze[position.x][position.y -2][position.z] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;

                case 5 : // Up
                    if(position.z +1 < this.length &&
                        this.maze[position.x][position.y][position.z +1] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;

                case 6 : // Down
                    if(position.z -1 >= 0 &&
                        this.maze[position.x][position.y][position.z -1] == 1) {
                        returnDir = possibleDirs[rand];
                    }
                    break;
            }

            if(returnDir == 0) {
                possibleDirs.splice(rand, 1);
            }

        } while(returnDir == 0 && possibleDirs.length > 0);

        if(this.path.length == 1 && this.setDirection) {
            this.setDirection = false;
            GAME.instance.lookAtDirection(returnDir);
        }

        return returnDir;
    }
}