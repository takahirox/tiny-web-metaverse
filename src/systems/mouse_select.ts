import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";
import { Raycasted } from "../components/raycast";
import { Selectable, Selected } from "../components/select";

const eventQuery = defineQuery([MouseButtonEvent, Selectable]);

export const mouseSelectSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Right) {
        continue;
      }
      if (e.type === MouseButtonEventType.Down) {
        if (hasComponent(world, Selected, eid)) {
          removeComponent(world, Selected, eid);
        } else if (hasComponent(world, Raycasted, eid)) {
          addComponent(world, Selected, eid);
        }
      }
    }
  });
};
