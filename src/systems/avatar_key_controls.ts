import { addComponent, defineQuery, IWorld, removeComponent } from "bitecs";
import { Avatar } from "../components/avatar";
import { KeyEvent, KeyEventProxy, KeyEventType } from "../components/keyboard";
import {
  LinearMoveBackward,
  LinearMoveForward,
  LinearMoveLeft,
  LinearMoveRight
} from "../components/linear_move";
import { Owned } from "../components/network";

const eventQuery = defineQuery([
  Avatar,
  KeyEvent,
  Owned
]);

export const avatarKeyControlsSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const events = KeyEventProxy.get(eid).events;
    // TODO: Configurable speed
    const speed = 1.0;
    // TODO: Configurable key map
    for (const e of events) {
      if (e.code === 37) { // Left
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveLeft, eid);
          LinearMoveLeft.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveLeft, eid);
        }
      } else if (e.code === 38) { // Up
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveForward, eid);
          LinearMoveForward.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveForward, eid);
        }
      } else if (e.code === 39) { // Right
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveRight, eid);
          LinearMoveRight.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveRight, eid);
        }
      } else if (e.code === 40) { // Down
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveBackward, eid);
          LinearMoveBackward.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveBackward, eid);
        }
      }
    }
  });
};
