import {
  addComponent,
  defineQuery,
  entityExists,
  hasComponent,
  IWorld
} from "bitecs";
import { AnimationClip, Euler, Vector3 } from "three";
import {
  SelectedEvent,
  SelectedEventProxy,
  SelectedType
} from "@tiny-web-metaverse/addons/src";
import {
  ActiveAnimations,
  ActiveAnimationsProxy,
  ActiveAnimationsUpdated,
  addAnimation,
  EntityObject3D,
  EntityObject3DProxy,
  hasComponents,
  MixerAnimation,
  MixerAnimationProxy,
  NULL_EID,
  TransformUpdated
} from "@tiny-web-metaverse/client/src";
import { SideBar } from "../components/side_bar";

const vector3Keys = ['x', 'y', 'z'] as const;
let selectedEid = NULL_EID;

enum PropertyType {
  Position,
  Rotation,
  Scale
};

type OnTrsInput = {
  property: PropertyType;
  key: 'x' | 'y' | 'z';
  value: number;
};

const onTrsInputQueue: OnTrsInput[] = [];

type OnAnimationSelectInput = {
  index: number
};

const onAnimationSelectInputQueue: OnAnimationSelectInput[] = [];

/*
<div>
  <div id="eidDiv">eid: ${eid}</div>

  <div id="positionDiv">
    position:
    <div id="positionXDiv">
      x:
      <span id="positionXSpan">${position.x}</span>
      <input id="positionXInput" type="range" />
    </div>
    <div id="positionYDiv">
      y:
      <span id="positionYSpan">${position.y}</span>
      <input id="positionYInput" type="range" />
    </div>
    <div id="positionZDiv">
      z:
      <span id="positionZSpan">${position.z}</span>
      <input id="positionZInput" type="range" />
    </div>
  </div>
  <div id="rotationDiv">
    rotation:
    <div id="rotationXDiv">
      x:
      <span id="rotationXSpan">${rotation.x}</span>
      <input id="rotationXInput" type="range" />
    </div>
    <div>
      y:
      <span id="rotationYSpan">${rotation.y}</span>
      <input id="rotationYInput" type="range" />
    </div>
    <div>
      z:
      <span id="rotationZSpan">${rotation.z}</span>
      <input id="rotationZInput"type="range" />
    </div>
  </div>
  <div id="scaleDiv">
    scale:
    <div id="scaleXDiv">
      x:
      <span id="scaleXSpan">${scale.x}</span>
      <input id="scaleXInput" type="range" />
    </div>
    <div id="scaleYDiv">
      y:
      <span id="scaleYSpan">${scale.y}</span>
      <input id="scaleYInput" type="range" />
    </div>
    <div id="scaleZDiv">
      z:
      <span id="scaleZSpan">${scale.z}</span>
      <input id="scaleZInput" type="range" />
    </div>
  </div>

  <div id="animationsDiv">
    animations:
    <div id="animationClipsDiv">
      clips: <span></span>
	  <select id="animationClipSelect">
        <option value="-1">None</option>
        <option value="0">animation_0</option>
        ...
      </select>
    </div>
    <div id="animationTimeDiv">
      time:
      <span id="animationTimeSpan">${action.time}</span>
      <input id="animationTimeInput"
        type="range" min="0" max="${clip.duration}" value="${action.time}" />
    </div>
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
      if (selectedEid === NULL_EID) {
        return;
      }
      onTrsInputQueue.push({
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
      if (selectedEid === NULL_EID) {
        return;
      }
      onTrsInputQueue.push({
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
      if (selectedEid === NULL_EID) {
        return;
      }
      onTrsInputQueue.push({
        property: PropertyType.Scale,
        key: key,
        value: Number(input.value)
      });
    });
  }
  
  return result;
};

const createAnimationsElement = (): {
  root: HTMLDivElement,
  clipsDiv: HTMLDivElement,
  clipSelect: HTMLSelectElement,
  timeDiv: HTMLDivElement,
  timeSpan: HTMLSpanElement,
  timeInput: HTMLInputElement
} => {
  const root = document.createElement('div');
  root.innerText = `animations: `;

  const clipsDiv = document.createElement('div');
  clipsDiv.style.display = 'flex';
  clipsDiv.style.paddingLeft = '1em';
  clipsDiv.innerText = `clips: `;
  root.appendChild(clipsDiv);

  const clipsSpan = document.createElement('span');
  clipsSpan.style.width = '6em';
  clipsDiv.appendChild(clipsSpan);

  const clipSelect = document.createElement('select');
  clipSelect.style.width = '100px';
  clipSelect.addEventListener('change', () => {
    if (selectedEid === NULL_EID) {
      return;
    }
    onAnimationSelectInputQueue.push({
      index: Number(clipSelect.options[clipSelect.selectedIndex].value)
    });
  });
  clipsDiv.appendChild(clipSelect);

  const timeDiv = document.createElement('div');
  timeDiv.style.display = 'flex';
  timeDiv.style.paddingLeft = '1em';
  timeDiv.innerText = `time: `;
  root.appendChild(timeDiv);

  const timeSpan = document.createElement('span');
  timeSpan.style.width = '6em';
  timeDiv.appendChild(timeSpan);

  const timeInput = document.createElement('input');
  timeInput.type = 'range';
  timeInput.style.width = '100px';
  timeInput.min = '0';
  timeInput.step = '0.01';
  timeInput.value = '0';
  timeDiv.appendChild(timeInput);

  return { root, clipsDiv, clipSelect, timeDiv, timeSpan, timeInput };
};

//

const updateTrs = (
  spans: Vector3Spans,
  inputs: Vector3Inputs,
  value: Vector3 | Euler
): void => {
  for (const key of vector3Keys) {
    spans[key as keyof Vector3Spans].innerText = `${value[key].toFixed(2)}`;
    inputs[key as keyof Vector3Inputs].value = `${value[key]}`;
  }
};

const refreshAnimations = (world: IWorld, eid: number): void => {
  while (animationsClipSelect.firstChild) {
    animationsClipSelect.removeChild(animationsClipSelect.firstChild);
  }

  const activeClips = new WeakSet();

  if (hasComponent(world, ActiveAnimations, eid)) {
    for (const action of ActiveAnimationsProxy.get(eid).actions) {
      activeClips.add(action.getClip());
    }
  }

  const option = document.createElement('option');
  option.innerText = 'None';
  option.value = '-1';
  animationsClipSelect.appendChild(option);

  let suffix = 0;
  let clipIndex = 0;
  let foundActiveAnimation = false;

  if (hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    const root = EntityObject3DProxy.get(eid).root;
    root.traverse(obj => {
      for (const clip of obj.animations) {
        const option = document.createElement('option');
        option.innerText = clip.name || `animation_${suffix++}`;
        option.selected = activeClips.has(clip);
        option.value = `${clipIndex++}`;
        animationsClipSelect.appendChild(option);

        if (option.selected) {
          foundActiveAnimation = true;
        }
      }
    });
  }

  animationsTimeDiv.style.display = foundActiveAnimation ? 'block' : 'none';

  if (hasComponent(world, ActiveAnimations, eid)) {
    for (const action of ActiveAnimationsProxy.get(eid).actions) {
      animationsTimeInput.max = `${action.getClip().duration}`;
    }
  }

  animationsTimeInput.value = '0';
  animationsTimeSpan.innerText = (0.0).toFixed(2);
};

const updateAnimationTime = (world: IWorld, eid: number): void => {
  if (hasComponent(world, ActiveAnimations, eid)) {
    for (const action of ActiveAnimationsProxy.get(eid).actions) {
      animationsTimeSpan.innerText = `${action.time.toFixed(2)}`;
      animationsTimeInput.value = `${action.time}`;
    }
  }
};

//

const handleOnTrsInputs = (world: IWorld, eid: number) => {
  if (hasComponent(world, EntityObject3D, eid)) {
    const obj = EntityObject3DProxy.get(eid).root;
    for (const input of onTrsInputQueue) {
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
  onTrsInputQueue.length = 0;
};

const handleOnAnimationClipSelectInputs = (world: IWorld, eid: number) => {
  if (hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    const mixer = MixerAnimationProxy.get(eid).mixer;
    for (const input of onAnimationSelectInputQueue) {
      if (hasComponent(world, ActiveAnimations, eid)) {
        const actions = ActiveAnimationsProxy.get(eid).actions;
        for (const action of ActiveAnimationsProxy.get(eid).actions) {
          action.stop();
          mixer.uncacheAction(action.getClip(), action.getRoot());
        }
        actions.length = 0;
      }

      if (input.index === -1) {
        animationsTimeDiv.style.display = 'none';
        continue;
      }

      animationsTimeDiv.style.display = 'block';

      const clips: AnimationClip[] = [];
      const root = EntityObject3DProxy.get(eid).root;
      root.traverse(obj => {
        obj.animations.forEach(animation => clips.push(animation));
      });
      const clip = clips[input.index];
      const action = mixer.clipAction(clip, root);
      action.play();
      addAnimation(world, eid, action);
      animationsTimeInput.value = '0';
      animationsTimeInput.max = `${clip.duration}`;

      addComponent(world, ActiveAnimationsUpdated, eid);
    }
  }
  onAnimationSelectInputQueue.length = 0;
};

//

const domOverlayRoot = document.createElement('div');
// See addons/src/ui/webxr.ts
domOverlayRoot.id = 'WebXRDomOverlayRoot';
document.body.appendChild(domOverlayRoot);

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
domOverlayRoot.appendChild(div);

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

const {
  root: animationsRootDiv,
  //clipsDiv: animationsClipsDiv,
  clipSelect: animationsClipSelect,
  timeDiv: animationsTimeDiv,
  timeSpan: animationsTimeSpan,
  timeInput: animationsTimeInput
} = createAnimationsElement();

div.appendChild(positionRootDiv);
div.appendChild(rotationRootDiv);
div.appendChild(scaleRootDiv);
div.appendChild(animationsRootDiv);

//

const sideBarQuery = defineQuery([SelectedEvent, SideBar]);

export const updateSidebarSystem = (world: IWorld): void => {
  let needsUpdate = false;

  if (!entityExists(world, selectedEid)) {
    selectedEid = NULL_EID;
    div.style.display = 'none';
  }

  sideBarQuery(world).forEach(eventEid => {
    for (const event of SelectedEventProxy.get(eventEid).events) {
      switch (event.type) {
        case SelectedType.Deselected:
          if (selectedEid === event.eid) {
            selectedEid = NULL_EID;
            div.style.display = 'none';
          }
          break;
        case SelectedType.Selected:
          selectedEid = event.eid;
          needsUpdate = true;

          div.style.display = 'block';
          eidDiv.innerText = `eid: ${selectedEid}`;

          if (hasComponent(world, EntityObject3D, selectedEid)) {
            positionRootDiv.style.display = 'block';
            rotationRootDiv.style.display = 'block';
            scaleRootDiv.style.display = 'block';
          } else {
            positionRootDiv.style.display = 'none';
            rotationRootDiv.style.display = 'none';
            scaleRootDiv.style.display = 'none';
          }

          break;
      }
    }
  });

  handleOnTrsInputs(world, selectedEid);
  handleOnAnimationClipSelectInputs(world, selectedEid);

  if (hasComponent(world, EntityObject3D, selectedEid)) {
    if (needsUpdate || hasComponent(world, ActiveAnimationsUpdated, selectedEid)) {
      refreshAnimations(world, selectedEid);
    }

    if (hasComponent(world, ActiveAnimations, selectedEid) &&
      ActiveAnimationsProxy.get(selectedEid).actions.length > 0) {
      updateAnimationTime(world, selectedEid);
    }

    if (needsUpdate || hasComponent(world, TransformUpdated, selectedEid)) {
      const obj = EntityObject3DProxy.get(selectedEid).root;
      updateTrs(positionSpans, positionInputs, obj.position);
      updateTrs(rotationSpans, rotationInputs, obj.rotation);
      updateTrs(scaleSpans, scaleInputs, obj.scale);
    }
  }
};
