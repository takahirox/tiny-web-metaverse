import { defineQuery, IWorld, removeComponent } from "bitecs";
import { 
  VirtualJoystickEvent,
  VirtualJoystickEventProxy
} from "../components/virtual_joystick";

const eventQuery = defineQuery([VirtualJoystickEvent]);

export const clearVirtualJoystickEventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    VirtualJoystickEventProxy.get(eid).free();
    removeComponent(world, VirtualJoystickEvent, eid);
  });
};
