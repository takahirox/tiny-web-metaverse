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

const grabbableQuery = defineQuery([Grabbable, MouseButtonEvent]);

// TODO: Rename to mouseGrabSystem?
export const grabSystem = (world: IWorld) => {
  // TODO: Optimize
  grabbableQuery(world).forEach(grabbableEid => {
    for (const e of MouseButtonEventProxy.get(grabbableEid).events) {
      if (e.button !== MouseButtonType.Left) {
        return;
      }
      if (e.type === MouseButtonEventType.Down &&
        hasComponent(world, Raycasted, grabbableEid)) {
        addComponent(world, Grabbed, grabbableEid);
        Grabbed.distance[grabbableEid] = Raycasted.distance[grabbableEid];
      } else if (e.type === MouseButtonEventType.Up) {
        removeComponent(world, Grabbed, grabbableEid);
      }
    }
  });
};
