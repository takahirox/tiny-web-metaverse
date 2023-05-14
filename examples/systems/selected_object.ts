import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { NULL_EID } from "../../src/common";
import { Selected } from "../../src/components/select"
import { update, updateEid } from "../ui/side_bar";

const selectedQuery = defineQuery([Selected]);
const selectedEnterQuery = enterQuery(selectedQuery);
const selectedExitQuery = exitQuery(selectedQuery);

export const selectedObjectSystem = (world: IWorld) => {
  selectedExitQuery(world).forEach(() => {
    updateEid(NULL_EID);
  });

  selectedEnterQuery(world).forEach(eid => {
    updateEid(eid);
  });

  update(world);
};
