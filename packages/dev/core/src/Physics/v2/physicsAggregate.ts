import { PhysicsBody } from "./physicsBody";
import { PhysicsMaterial } from "./physicsMaterial";
import { PhysicsShape } from "./physicsShape";
import { Logger } from "../../Misc/logger";
import type { Scene } from "../../scene";
import type { TransformNode } from "../../Meshes/transformNode";

/**
 * The interface for the physics aggregate parameters
 */
export interface PhysicsAggregateParameters {
    /**
     * The mass of the physics aggregate
     */
    mass: number;
    /**
     * The friction of the physics aggregate
     */
    friction?: number;
    /**
     * The coefficient of restitution of the physics aggregate
     */
    restitution?: number;
    /**
     * The native options of the physics aggregate
     */
    nativeOptions?: any;
    /**
     * Specifies if the parent should be ignored
     */
    ignoreParent?: boolean;
    /**
     * Specifies if bi-directional transformations should be disabled
     */
    disableBidirectionalTransformation?: boolean;
    /**
     * The pressure inside the physics aggregate, soft object only
     */
    pressure?: number;
    /**
     * The stiffness the physics aggregate, soft object only
     */
    stiffness?: number;
    /**
     * The number of iterations used in maintaining consistent vertex velocities, soft object only
     */
    velocityIterations?: number;
    /**
     * The number of iterations used in maintaining consistent vertex positions, soft object only
     */
    positionIterations?: number;
    /**
     * The number used to fix points on a cloth (0, 1, 2, 4, 8) or rope (0, 1, 2) only
     * 0 None, 1, back left or top, 2, back right or bottom, 4, front left, 8, front right
     * Add to fix multiple points
     */
    fixedPoints?: number;
    /**
     * The collision margin around a soft object
     */
    margin?: number;
    /**
     * The collision margin around a soft object
     */
    damping?: number;
    /**
     * The path for a rope based on an extrusion
     */
    path?: any;
    /**
     * The shape of an extrusion used for a rope based on an extrusion
     */
    shape?: any;
}
/**
 * Helper class to create and interact with a PhysicsAggregate.
 * This is a transition object that works like Physics Plugin V1 Impostors.
 * This helper instanciate all mandatory physics objects to get a body/shape and material.
 * It's less efficient that handling body and shapes independently but for prototyping or
 * a small numbers of physics objects, it's good enough.
 */
export class PhysicsAggregate {
    /**
     * The body that is associated with this aggregate
     */
    public body: PhysicsBody;

    /**
     * The shape that is associated with this aggregate
     */
    public shape: PhysicsShape;

    /**
     * The material that is associated with this aggregate
     */
    public material: PhysicsMaterial;

    constructor(
        /**
         * The physics-enabled object used as the physics aggregate
         */
        public transformNode: TransformNode,
        /**
         * The type of the physics aggregate
         */
        public type: number,
        private _options: PhysicsAggregateParameters = { mass: 0 },
        private _scene?: Scene
    ) {
        //sanity check!
        if (!this.transformNode) {
            Logger.Error("No object was provided. A physics object is obligatory");
            return;
        }
        if (this.transformNode.parent && this._options.mass !== 0) {
            Logger.Warn("A physics impostor has been created for an object which has a parent. Babylon physics currently works in local space so unexpected issues may occur.");
        }

        // Legacy support for old syntax.
        if (!this._scene && transformNode.getScene) {
            this._scene = transformNode.getScene();
        }

        if (!this._scene) {
            return;
        }

        //default options params
        this._options.mass = _options.mass === void 0 ? 0 : _options.mass;
        this._options.friction = _options.friction === void 0 ? 0.2 : _options.friction;
        this._options.restitution = _options.restitution === void 0 ? 0.2 : _options.restitution;
        this.shape = new PhysicsShape(type, this._options as any, this._scene);
        this.body = new PhysicsBody(transformNode, this._scene);
        this.material = new PhysicsMaterial(this._options.friction ? this._options.friction : 0, this._options.restitution ? this._options.restitution : 0, this._scene);
        this.body.setShape(this.shape);
        this.shape.setMaterial(this.material);
    }

    /**
     * Releases the body, shape and material
     */
    public dispose(): void {
        this.body.dispose();
        this.material.dispose();
        this.shape.dispose();
    }
}
