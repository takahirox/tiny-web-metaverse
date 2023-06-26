import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src/common";
import { Selected } from "@tiny-web-metaverse/client/src/components/select"
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
