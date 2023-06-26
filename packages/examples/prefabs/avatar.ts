import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { SphereGeometry, Mesh, MeshBasicMaterial } from "three";
import { Avatar } from "@tiny-web-metaverse/client/src/components/avatar";
import { EntityObject3DProxy } from "@tiny-web-metaverse/client/src/components/entity_object3d";
import {
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale
} from "@tiny-web-metaverse/client/src/components/network";
import { InScene } from "@tiny-web-metaverse/client/src/components/scene";

export const AvatarPrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, Avatar, eid);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, InScene, eid);

  const avatarObject = new Mesh(
    new SphereGeometry(0.25),
    new MeshBasicMaterial({ color: 0xaaaacc })    
  );

  const leftEyeObject = new Mesh(
    new SphereGeometry(0.05),
    new MeshBasicMaterial({ color: 0x000000 })    
  );
  leftEyeObject.position.set(-0.07, 0.1, -0.2);

  const rightEyeObject = new Mesh(
    new SphereGeometry(0.05),
    new MeshBasicMaterial({ color: 0x000000 })    
  );
  rightEyeObject.position.set(0.07, 0.1, -0.2);

  avatarObject.add(leftEyeObject);
  avatarObject.add(rightEyeObject);

  EntityObject3DProxy.get(eid).addObject3D(world, avatarObject);

  return eid;
};
