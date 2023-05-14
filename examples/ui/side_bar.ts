import { hasComponent, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../../src/components/entity_object3d";
import { NULL_EID } from "../../src/common";

let eid = NULL_EID;

/*
<div>
  <div>eid: ${eid}</div>
  <div>position: ${position}</div>
  <div>rotation: ${rotation}</div>
  <div>scale: ${scale}</div>
</div>
*/

const div = document.createElement('div');
div.style.width = 'calc(220px - 1.0em)';
div.style.height = 'calc(100% - 1.0em)';
div.style.display = 'none';
div.style.position = 'absolute';
div.style.background = 'rgba(255.0, 255.0, 255.0, 0.5)';
div.style.color = 'rgba(0.0, 0.0, 0.0, 1.0)';
div.style.zIndex = '1';
div.style.top = '0px';
div.style.right = '0px';
div.style.opacity = '1.0';
div.style.borderLeft = 'solid 1px #000000';
div.style.padding = '0.5em';
div.style.margin = '0';
document.body.appendChild(div);

const eidDiv = document.createElement('div');
div.appendChild(eidDiv);

const positionDiv = document.createElement('div');
positionDiv.style.display = 'none';
div.appendChild(positionDiv);

const rotationDiv = document.createElement('div');
rotationDiv.style.display = 'none';
div.appendChild(rotationDiv);

const scaleDiv = document.createElement('div');
scaleDiv.style.display = 'none';
div.appendChild(scaleDiv);

export const updateEid = (newEid: number): void => {
  eid = newEid;
};

// TODO: Optimize. Updating each frame even without update is inefficient.
export const update = (world: IWorld): void => {
  if (eid === NULL_EID) {
    div.style.display = 'none';
  } else {
    div.style.display = 'block';    
    eidDiv.innerText = `eid: ${eid}`;

    if (hasComponent(world, EntityObject3D, eid)) {
      const obj = EntityObject3DProxy.get(eid).root;
      positionDiv.innerText = `position: ${obj.position.x.toFixed(2)} ${obj.position.y.toFixed(2)} ${obj.position.z.toFixed(2)}`;
      positionDiv.style.display = 'block';
      rotationDiv.innerText = `rotation: ${obj.rotation.x.toFixed(2)} ${obj.rotation.y.toFixed(2)} ${obj.rotation.z.toFixed(2)}`;
      rotationDiv.style.display = 'block';
      scaleDiv.innerText = `scale: ${obj.scale.x.toFixed(2)} ${obj.scale.y.toFixed(2)} ${obj.scale.z.toFixed(2)}`;
      scaleDiv.style.display = 'block';
    } else {
      positionDiv.style.display = 'none';
      rotationDiv.style.display = 'none';
      scaleDiv.style.display = 'none';
    }
  }
};
