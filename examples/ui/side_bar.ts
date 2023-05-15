import { addComponent, hasComponent, IWorld } from "bitecs";
import { Euler, Vector3 } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../../src/components/entity_object3d";
import { TransformUpdated } from "../../src/components/transform";
import { NULL_EID } from "../../src/common";

const vector3Keys = ['x', 'y', 'z'] as const;
let eid = NULL_EID;
let needsUpdate = false;

enum PropertyType {
  Position,
  Rotation,
  Scale
};

type OnInput = {
  property: PropertyType;
  key: 'x' | 'y' | 'z';
  value: number;
};

const onInputQueue: OnInput[] = [];

/*
<div>
  <div>eid: ${eid}</div>
  <div>position:
    <div>x: <span>${position.x}</span> <input type="range" /></div>
    <div>y: <span>${position.y}</span> <input type="range" /></div>
    <div>z: <span>${position.z}</span> <input type="range" /></div>
  </div>
  <div>rotation:
    <div>x: <span>${rotation.x}</span> <input type="range" /></div>
    <div>y: <span>${rotation.y}</span> <input type="range" /></div>
    <div>z: <span>${rotation.z}</span> <input type="range" /></div>
  </div>
  <div>scale:
    <div>x: <span>${scale.x}</span> <input type="range" /></div>
    <div>y: <span>${scale.y}</span> <input type="range" /></div>
    <div>z: <span>${scale.z}</span> <input type="range" /></div>
  </div>
</div>
*/

const createPropertyElement = (label: string): {
  div: HTMLDivElement,
  span: HTMLSpanElement,
  input: HTMLInputElement
} => {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.paddingLeft = '1em';
  div.innerText = `${label} `;

  const span = document.createElement('span');
  span.style.width = '6em';
  div.appendChild(span);

  const input = document.createElement('input');
  input.type = 'range';
  input.style.width = '100px';
  div.appendChild(input);

  return { div, span, input };
};

type Vector3Divs = {
  x: HTMLDivElement;
  y: HTMLDivElement;
  z: HTMLDivElement;
};

type Vector3Spans = {
  x: HTMLSpanElement;
  y: HTMLSpanElement;
  z: HTMLSpanElement;
};

type Vector3Inputs = {
  x: HTMLInputElement;
  y: HTMLInputElement;
  z: HTMLInputElement;
};

const createVector3Element = (label: string): {
  root: HTMLDivElement,
  divs: Vector3Divs,
  spans: Vector3Spans,
  inputs: Vector3Inputs
} => {
  const root = document.createElement('div');
  root.innerText = `${label}:`;
  root.style.display = 'none';

  const divs: Partial<Vector3Divs> = {};
  const spans: Partial<Vector3Spans> = {};
  const inputs: Partial<Vector3Inputs> = {};
  for (const key of vector3Keys) {
    const { div, span, input } = createPropertyElement(`${key}:`);
    divs[key as keyof Vector3Divs] = div;
    spans[key as keyof Vector3Spans] = span;
    inputs[key as keyof Vector3Inputs] = input;
    root.appendChild(div);
  }

  return {
    root,
    divs: divs as Vector3Divs,
    spans: spans as Vector3Spans,
    inputs: inputs as Vector3Inputs
  };
};

const createPositionElement = (): {
  root: HTMLDivElement,
  divs: Vector3Divs,
  spans: Vector3Spans,
  inputs: Vector3Inputs
} => {
  const result = createVector3Element('position');

  for (const key of vector3Keys) {
    const input = result.inputs[key as keyof Vector3Inputs];
    // TODO: Are these min and max good?
    input.min = '-10.00';
    input.max = '10.00';
    input.step = '0.01';
    input.addEventListener('input', () => {
      if (eid === NULL_EID) {
        return;
      }
      onInputQueue.push({
        property: PropertyType.Position,
        key: key,
        value: Number(input.value)
      });
    });
  }
  
  return result;
};

const createRotationElement = (): {
  root: HTMLDivElement,
  divs: Vector3Divs,
  spans: Vector3Spans,
  inputs: Vector3Inputs
} => {
  const result = createVector3Element('rotation');

  for (const key of vector3Keys) {
    const input = result.inputs[key as keyof Vector3Inputs];
    input.min = `-${Math.PI}`;
    input.max = `${Math.PI}`;
    input.step = '0.01';
    input.addEventListener('input', () => {
      if (eid === NULL_EID) {
        return;
      }
      onInputQueue.push({
        property: PropertyType.Rotation,
        key: key,
        value: Number(input.value)
      });
    });
  }
  
  return result;
};

const createScaleElement = (): {
  root: HTMLDivElement,
  divs: Vector3Divs,
  spans: Vector3Spans,
  inputs: Vector3Inputs
} => {
  const result = createVector3Element('scale');

  for (const key of vector3Keys) {
    const input = result.inputs[key as keyof Vector3Inputs];
    // TODO: Are these min and max good?
    input.min = '0.01';
    input.max = '10.0';
    input.step = '0.01';
    input.addEventListener('input', () => {
      if (eid === NULL_EID) {
        return;
      }
      onInputQueue.push({
        property: PropertyType.Scale,
        key: key,
        value: Number(input.value)
      });
    });
  }
  
  return result;
};

const updateVector3 = (
  spans: Vector3Spans,
  inputs: Vector3Inputs,
  value: Vector3 | Euler
): void => {
  for (const key of vector3Keys) {
    spans[key as keyof Vector3Spans].innerText = `${value[key].toFixed(2)}`;
    inputs[key as keyof Vector3Inputs].value = `${value[key]}`;
  }
};

const handleOnInputs = (world: IWorld, eid: number) => {
  if (hasComponent(world, EntityObject3D, eid)) {
    const obj = EntityObject3DProxy.get(eid).root;
    for (const input of onInputQueue) {
      switch (input.property) {
        case PropertyType.Position:
          obj.position[input.key] = input.value;
          break;
        case PropertyType.Rotation:
          obj.rotation[input.key] = input.value;
          break;
        case PropertyType.Scale:
          obj.scale[input.key] = input.value;
          break;
      }
      addComponent(world, TransformUpdated, eid);
    }
  }
  onInputQueue.length = 0;
};

const div = document.createElement('div');
div.style.width = 'calc(200px - 1.0em)';
div.style.height = 'calc(100% - 1.0em)';
div.style.display = 'none';
div.style.position = 'absolute';
div.style.background = 'rgba(255.0, 255.0, 255.0, 0.9)';
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

const {
  root: positionRootDiv,
  spans: positionSpans,
  inputs: positionInputs
} = createPositionElement();

const {
  root: rotationRootDiv,
  spans: rotationSpans,
  inputs: rotationInputs
} = createRotationElement();

const {
  root: scaleRootDiv,
  spans: scaleSpans,
  inputs: scaleInputs
} = createScaleElement();

div.appendChild(positionRootDiv);
div.appendChild(rotationRootDiv);
div.appendChild(scaleRootDiv);

export const notifyEid = (newEid: number): void => {
  if (eid !== newEid) {
    eid = newEid;
    needsUpdate = true;
  }
};

export const updateSidebarSystem = (world: IWorld): void => {
  if (eid === NULL_EID) {
    if (needsUpdate) {
      div.style.display = 'none';
    }
  } else {
    if (needsUpdate) {
      div.style.display = 'block';
      eidDiv.innerText = `eid: ${eid}`;

      if (hasComponent(world, EntityObject3D, eid)) {
        positionRootDiv.style.display = 'block';
        rotationRootDiv.style.display = 'block';
        scaleRootDiv.style.display = 'block';
      } else {
        positionRootDiv.style.display = 'none';
        rotationRootDiv.style.display = 'none';
        scaleRootDiv.style.display = 'none';
      }
    }

    handleOnInputs(world, eid);

    if (hasComponent(world, EntityObject3D, eid) &&
      (needsUpdate || hasComponent(world, TransformUpdated, eid))) {
      const obj = EntityObject3DProxy.get(eid).root;
      updateVector3(positionSpans, positionInputs, obj.position);
      updateVector3(rotationSpans, rotationInputs, obj.rotation);
      updateVector3(scaleSpans, scaleInputs, obj.scale);
    }
  }

  needsUpdate = false;
};
