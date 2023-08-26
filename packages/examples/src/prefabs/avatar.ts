import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import {
  addObject3D,
  Avatar,
  InScene,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale  
} from "@tiny-web-metaverse/client/src";

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

  addObject3D(world, avatarObject, eid);

  return eid;
};
