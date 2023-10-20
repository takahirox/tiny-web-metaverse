import {
  defineQuery,
  entityExists,
  enterQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Avatar,
  EntityObject3D,
  EntityObject3DProxy,
  getMyUserId,
  getPeersProxy,
  InScene,
  Local,
  Networked,
  NetworkedProxy,
  Remote
} from "@tiny-web-metaverse/client/src";
import { TextComponent, TextProxy } from "../components/text";
import { Nametag } from "../components/nametag";

const nametagQuery = defineQuery([EntityObject3D, Nametag, TextComponent]);
const enterNametagQuery = enterQuery(nametagQuery);

// TODO: Simplify if possible

export const nametagSystem = (world: IWorld): void => {
  enterNametagQuery(world).forEach(eid => {
    // Nametag for local avatar is not needed in general but
    // it can be used in some cased for example selfie feature.
    // So make it invisible for now. Make it visible when needed.
    // Not sure if this is a good approach tho.
    // TODO: Move this to nametag initialization?
    const objectEid = Nametag.objectEid[eid];

    if (entityExists(world, objectEid) &&
      hasComponent(world, Avatar, objectEid) &&
      hasComponent(world, Local, objectEid)) {
      EntityObject3DProxy.get(eid).root.visible = false; 
    }
  });

  nametagQuery(world).forEach(eid => {
    const objectEid = Nametag.objectEid[eid];

    // TODO: Can we somehow remove the dependency with another entity?
    // TODO: It's good if we have a mechanism to efficiently detect
    //       the dependent entity removal

    if (!entityExists(world, objectEid)) {
      // TODO: Remove resources properly
      removeComponent(world, Nametag, eid);
      removeComponent(world, TextComponent, eid);

      if (hasComponent(world, InScene, eid)) {
        removeComponent(world, InScene, eid);
      }

      return;
    }

    // TODO: Maybe inefficient here. Should be username change event driven?
    // TODO: Simplify

    if (hasComponent(world, Avatar, objectEid)) {
      let userId: string | null = null;

      if (hasComponent(world, Local, objectEid)) {
        userId = getMyUserId(world);
      } else if (
        hasComponent(world, Remote, objectEid) &&
        hasComponent(world, Networked, objectEid)
      ) {
        userId = NetworkedProxy.get(objectEid).creator;
      }

      if (userId !== null) {
        const peers = getPeersProxy(world).peers;
        if (peers.has(userId)) {
          const username = peers.get(userId)!;
          const text = TextProxy.get(eid).text;
          if (text.text !== username) {
            text.text = username;
          }
        }
      }
    }

    if (!hasComponent(world, EntityObject3D, objectEid)) {
      return;
    }

    const obj = EntityObject3DProxy.get(objectEid).root;
    const root = EntityObject3DProxy.get(eid).root;

    root.position.copy(obj.position);
    root.position.y += 0.5;
  });
};
