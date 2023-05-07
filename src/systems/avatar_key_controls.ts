import { defineQuery, IWorld } from "bitecs";
import { Avatar } from "../components/avatar";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { KeyEvent, KeyEventProxy, KeyEventType } from "../components/keyboard";
import { Owned } from "../components/network";

const eventQuery = defineQuery([
  Avatar,
  EntityObject3D,
  KeyEvent,
  Owned
]);
export const avatarKeyControlsSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const obj = EntityObject3DProxy.get(eid).root;
    const events = KeyEventProxy.get(eid).events;
    for (const e of events) {
      if (e.type === KeyEventType.Down) {
        obj.position.z += 0.01;
      }
    }
  });
};
