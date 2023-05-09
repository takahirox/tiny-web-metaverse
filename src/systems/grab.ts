import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Grabbable, Grabbed } from "../components/grab";
import { Raycasted } from "../components/raycast";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";

const query = defineQuery([Grabbable, MouseButtonEvent]);

// TODO: Rename to mouseGrabSystem?
export const grabSystem = (world: IWorld) => {
  // TODO: Optimize
  query(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Left) {
        return;
      }
      if (e.type === MouseButtonEventType.Down &&
        hasComponent(world, Raycasted, eid)) {
        addComponent(world, Grabbed, eid);
      } else if (e.type === MouseButtonEventType.Up) {
        removeComponent(world, Grabbed, eid);
      }
    }
  });
};
