/// <reference path="babylon.2.2.d.ts"/>
/// <reference path="Generator.ts"/>

class GAME {

    //******************************** MEMBERS

    static instance;

    static ASSETS_LIST = [
    ];

    private canvas : HTMLCanvasElement;
    private scene : BABYLON.Scene;
    private light : BABYLON.DirectionalLight;
    private camera : BABYLON.FreeCamera;
    private player : BABYLON.Mesh;
    private level : number;
    private assets : BABYLON.Mesh[];

    private gravity : boolean = true;


    //******************************** GET / SET

    getAsset(index) : BABYLON.Mesh {
        return this.assets[index];
    }
    getCanvas() : HTMLCanvasElement {
        return this.canvas;
    }
    getScene() : BABYLON.Scene {
        return this.scene;
    }

    //******************************** CONSTRUCTOR

    constructor(level) {
        GAME.instance = this;
        this.level = level;
        this.init();
    }

    init() {

        // Get the canvas
        this.canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");

        // Create the Babylon engine
        var engine = new BABYLON.Engine(this.canvas, true);

        // Create the scene
        this.scene = new BABYLON.Scene(engine);
        this.scene.clearColor = BABYLON.Color3.Black();
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogColor = this.scene.clearColor;
        this.scene.setGravity(new BABYLON.Vector3(0,-9.81,0));

        // Debug layer
        this.scene.debugLayer.show();

        this.light = new BABYLON.DirectionalLight(
            "light",
            new BABYLON.Vector3(0,0,1),
            this.scene
        );

        this.camera = new BABYLON.FreeCamera(
            "camera",
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.position.y = 1.5;
        this.camera.keysUp = [90]; // Z
        this.camera.keysLeft = [81]; // Q
        this.camera.keysDown = [83]; // S
        this.camera.keysRight = [68]; // D
        this.camera.attachControl(this.canvas);
        this.light.parent = this.camera;
        this.light.position.x -= 2;
        this.camera.speed = 0.8;
        this.camera.angularSensibility = 2000;
        this.camera.ellipsoid = new BABYLON.Vector3(1.5,1.5,1.5);
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.player = BABYLON.Mesh.CreateBox(
            "player",
            1,
            this.scene
        );
        this.player.parent = this.camera;
        this.player.isVisible = false;
        this.player.position.z = 2;
        this.player.ellipsoid = new BABYLON.Vector3(1,1,1);
        this.player.computeWorldMatrix(true);

        var mazeGenerator = new Generator();
        var exitPoint : BABYLON.Vector3;

        if(this.level == 1) {
            exitPoint = mazeGenerator.generate(10,10,1);
        }
        else if(this.level == 2) {
            exitPoint = mazeGenerator.generate(42,42,2);
        }

        var exitMat = new BABYLON.StandardMaterial("exitMat", this.scene);
        exitMat.diffuseColor = BABYLON.Color3.Red();

        var exit = BABYLON.Mesh.CreateBox(
            "exit", 2,
            this.scene
        );
        exit.material = exitMat;
        exit.position.x = (exitPoint.x * Generator.BLOCK_SIZE);
        //exit.position.y = (exitPoint.z * Generator.BLOCK_SIZE);
        exit.position.y = 1;
        exit.position.z = (exitPoint.y * Generator.BLOCK_SIZE);
        exit.ellipsoid = new BABYLON.Vector3(1,1,1);
        exit.computeWorldMatrix();

        this.scene.registerBeforeRender(() => {

            // If collide with exit
            if(this.level == 1) {
                if(this.player.intersectsMesh(exit, true)) {
                    alert("You win! Ready for level 2 ?");
                    window.location.href = "./level_2.html";
                }
            }

            // Rotate exit
            exit.rotation.x += 0.01;
            exit.rotation.y += 0.02;
            exit.rotation.z += 0.03;
        });

        //this.loadAssets(() => {});

        engine.runRenderLoop(() => {
            this.update();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });

        if(this.level == 2) {
            window.addEventListener("keydown", (evt) => {
                // Press space key to reverse
                if (evt.keyCode === 32) {
                    console.log("Jump");
                    if (this.gravity) {
                        this.scene.setGravity(new BABYLON.Vector3(0, 9.81, 0));
                        this.gravity = false;
                    }
                    else {
                        this.scene.setGravity(new BABYLON.Vector3(0, -9.81, 0));
                        this.gravity = true;
                    }
                }
            });
        }
    }

    update() {
        this.scene.render();
    }

    //******************************** FUNCTIONS

    /**
     * Load all the assets, then call the callback function
     */
    loadAssets(callback) {
        this.assets = [];
        var count = GAME.ASSETS_LIST.length;

        GAME.ASSETS_LIST.forEach((elem) => {

            BABYLON.SceneLoader.ImportMesh(
                "",
                "assets/models/" + elem + "/",
                elem + ".babylon",
                this.scene,
                (newMeshes) => {

                    this.assets[elem] = BABYLON.Mesh.MergeMeshes(<BABYLON.Mesh[]>newMeshes);
                    this.assets[elem].isVisible = false;
                    this.assets[elem].isPickable = false;

                    count--;
                    if(count == 0) {
                        callback();
                    }
                }
            );
        });
    }

    lookAtDirection(direction) {
        console.log("Look at " + direction);

        switch (direction) {
            case 1:
                this.camera.rotation.y -= Math.PI/2;
                break;
            case 2:
                break;
            case 3:
                this.camera.rotation.y += Math.PI/2;
                break;
            case 4:
                this.camera.rotation.y += Math.PI;
                break;
            default:
                break;
        }
    }
}