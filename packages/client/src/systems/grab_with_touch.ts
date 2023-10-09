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
  TouchEvent,
  TouchEventProxy,
  TouchEventType
} from "../components/touch";

const grabbableQuery = defineQuery([Grabbable, TouchEvent]);

export const grabWithTouchSystem = (world: IWorld) => {
  // TODO: Optimize
  grabbableQuery(world).forEach(grabbableEid => {
    for (const e of TouchEventProxy.get(grabbableEid).events) {
      if (e.type === TouchEventType.Start &&
        hasComponent(world, Raycasted, grabbableEid)) {
        addComponent(world, Grabbed, grabbableEid);
        Grabbed.distance[grabbableEid] = Raycasted.distance[grabbableEid];
      } else if (e.type === TouchEventType.End) {
        removeComponent(world, Grabbed, grabbableEid);
      }
    }
  });
};
