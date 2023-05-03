import {
  addComponent,
  addEntity
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { App } from "../../src/app";
import { EntityRootObject3DProxy } from "../../src/components/entity_root_object3d";
import { InScene } from "../../src/components/scene";
import { Velocity } from "../components/velocity";
import { velocitySystem } from "../systems/velocity";

const app = new App();
app.registerSystem(velocitySystem);

const world = app.getWorld();
const eid = addEntity(world);

addComponent(world, Velocity, eid);
Velocity.x[eid] = 0.0;
Velocity.y[eid] = 0.01;
Velocity.z[eid] = 0.0;

const proxy = EntityRootObject3DProxy.get(eid);
proxy.addObject3D(world, new Mesh(
  new BoxGeometry(1.0, 1.0, 1.0),
  new MeshBasicMaterial({color: 0x888888})
));

addComponent(world, InScene, eid);

app.start();

export { app };
