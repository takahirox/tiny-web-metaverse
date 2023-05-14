import { defineQuery, enterQuery, IWorld } from "bitecs";
import { Selected } from "../../../src/components/select"

const selectedEnterQuery = enterQuery(defineQuery([Selected]));

export const selectedObjectSystem = (world: IWorld) => {
  selectedEnterQuery(world).forEach(_eid => {
    //window.alert(eid);
  });
};
