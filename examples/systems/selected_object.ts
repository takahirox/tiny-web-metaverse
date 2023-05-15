import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { NULL_EID } from "../../src/common";
import { Selected } from "../../src/components/select"
import { notifyEid } from "../ui/side_bar";

const selectedQuery = defineQuery([Selected]);
const selectedEnterQuery = enterQuery(selectedQuery);
const selectedExitQuery = exitQuery(selectedQuery);

export const selectedObjectSystem = (world: IWorld) => {
  selectedExitQuery(world).forEach(() => {
    notifyEid(NULL_EID);
  });

  selectedEnterQuery(world).forEach(eid => {
    notifyEid(eid);
  });
};
