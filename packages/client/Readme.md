This document is T.B.D.

# Tiny Web Metaverse Client

This is a document for who are interested in Tiny Web Metaverse Client
or Client addons development.

## Client overview

## Client core and addons

## Three.js

## bitECS

### ECS architecture

## Component

Component is a 

```typescript
// src/components/foo.ts
import { defineComponent } from "bitecs";

export const FooComponent = defineComponent();
```

```typescript
// src/components/foo.ts
import { defineComponent, Types } from "bitecs";

export const FooComponent = defineComponent(
  data: Types.f32
);

// somewhere
const data = FooComponent.data[eid];
FooComponent.data[eid] = newData;
```

```typescript
// src/components/foo.ts
import { defineComponent } from "bitecs";
import { Foo } from "foo";
import { NULL_EID } from "../common";

export const FooComponent = defineComponent();

export class FooProxy {
  private static instance: FooProxy = new FooProxy();
  private eid: number;
  private map: Map<number, Foo>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): Foo {
    FooProxy.instance.eid = eid;
    return FooProxy.instance;
  }

  allocate(foo: Foo): void {
    this.map.set(this.eid, foo);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get foo(): Foo {
    return this.map.get(this.eid)!;
  }
}
```

```typescript
// Initialization
addComponent(world, Foo, eid);
FooProxy.get(eid).allocate();

// Access
const foo = FooProxy.get(eid).foo;

// Release
FooProxy.get(eid).free();

import {
  defineQuery,
  exitQuery,
  IWorld,
} from "bitecs";

const exitFooQuery = exitQuery(defineQuery([FooComponent]));

export const fooSystem = (world: IWorld): void => {
  exitFooQuery(world).forEach(eid => {
    const proxy = FooProxy.get(eid);
    const foo = proxy.foo;
    foo.close();
    proxy.free();
  });
};
```

## System

System is a 

```typescript
import { IWorld } from "bitecs";

export const fooSystem = (world: IWorld): void => {
  ...
};
```

```typescript
import { defineQuery, IWorld } from "bitecs";
import { FooComponent, FooProxy } from "../components/foo";

const fooQuery = defineQuery([FooComponent]);

export const fooSystem = (world: IWorld): void => {
  fooQuery(world).forEach(eid => {
    const foo = FooProxy.get(eid).foo;
    foo.operation();
  });
};
```

## Coroutine

```typescript
// src/systems/load_foo.ts

import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  FooComponent,
  FooLoader,
  FooLoaderProxy,
  FooProxy
} from "../components/foo";
import { toGenerator } from "../utils/coroutine";

function* load(world: IWorld, eid: number): Generator {
  const url = FooLoaderProxy.get(eid).url;
  const foo = yield* toGenerator(loadFoo(url));
  addComponent(world, FooComponent, eid);
  FooProxy.get(eid).allocate(foo);
}

const loaderQuery = defineQuery([FooLoader]);
const enterLoaderQuery = enterQuery(loaderQuery);
const exitLoaderQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const loadFooSystem = (world: IWorld): void => {
  enterLoaderQuery(world).forEach(eid => {
    generators.set(eid, load(world, eid));
  });

  loaderQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      console.error(error);
      done = true;
    }
    if (done) {
      removeComponent(world, FooLoader, eid);
    }
  });

  exitLoaderQuery(world).forEach(eid => {
    generators.delete(eid);
    FooLoader.get(eid).free();
  });
};
```

## Three.js stuffs in Tiny Web Metaverse Client

### EntityObject3D

```typescript
addComponent(world, EntityObject3D, eid);
EntityObject3DProxy.get(eid).allocate();
const root = EntityObject3DProxy.get(eid).root;
```

```typescript
const mesh = new Mesh(geometry, material);
addObject3D(world, mesh, eid);
```

### InScene

## Prefab

Prefab is a 

```
// src/prefabs/foo
import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { FooComponent, FooProxy } from "../components/foo";

export const GltfPrefab = (world: IWorld, params: { fooData: number }): number => {
  const eid = addEntity(world);

  addComponent(world, FooComponent, eid);
  FooProxy.get(eid).allocate(fooData);

  return eid;
};
```

## Event handling

```typescript
// src/components/foo.ts

export const FooEvent = defineComponent();

export const enum FooEventType {
  Enter,
  Leave
};

export type FooEventValue = {
  type: FooEventType
};

export class FooEventProxy {
  private static instance: FooEventProxy = new FooEventProxy();
  private eid: number;
  private map: Map<number, FooEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): Foo {
    FooEventProxy.instance.eid = eid;
    return FooEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): FooEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const FooEventListener = defineQuery();

// src/systems/foo.ts

import {
  addComponent,
  defineQuery,
  enterQuery,
  hasComponent
} from "bitecs";
import {
  FooEvent,
  FooEventListener,
  FooEventProxy,
  FooEventType
} from "../components/foo";
import { NullComponent } from "../components/null";

const eventQueue: { type: FooEventType }[] = [];

const initializeQuery = enterQuery(defineQuery([NullComponent]));
const listenerQuery = defineQuery([FooEventListener]);
const eventQuery = defineQuery([FooEvent]);

export const fooEventSystem = (world: IWorld): void => {
  initializeQuery(world).forEach(() => {
    window.addEventListener('enterfoo', () => {
      eventQueue.push({ type: FooEventType.Enter });
    });

    window.addEventListener('leavefoo', () => {
      eventQueue.push({ type: FooEventType.Leave });
    });
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      if (!hasComponent(world, FooEvent, eid)) {
        addComponent(world, FooEvent, eid);
        FooEventProxy.get(eid).allocate();
      }
      FooEventProxy.get(eid).push({ type: e.type });
    });
  }

  eventQueue.length = 0;
};

export const clearFooEventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    const proxy = FooEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, FooEvent, eid);
  });
};
```

## Networking

```typescript
const eid = createNetworkedEntity(world, NetworkedType.Local, 'local');
```

NetworkedType
- Local:
- Remote:
- Shared:

## Serialization

```typescript
export type SerializedFoo = [data1: number, data2: number];

const serializeFoo = (world: IWorld, eid: number): SerializedPosition => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('serializeFoo requires FooComponent component.');
  }
  const foo = FooProxy.get(eid).foo;
  return [foo.data1, foo.data2];
};

const deserializeFoo = (world: IWorld, eid: number, data: SerializedFoo): void => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('deserializeFoo requires FooComponent component.');
  }
  const foo = FooProxy.get(eid).foo;
  foo.data1 = data[0];
  foo.data2 = data[1];
};

const deserializeNetworkedFoo = (world: IWorld, eid: number, data: SerializedFoo): void => {
  deserializeFoo(world, eid, data);
};

const checkFooDiff = (world: IWorld, eid: number, cache: SerializedFoo): boolean => {
  if (hasComponent(world, LinearTranslate, eid)) {
    return Math.abs(LinearTranslate.targetX[eid] - cache[0]) > F32_EPSILON ||
      Math.abs(LinearTranslate.targetY[eid] - cache[1]) > F32_EPSILON ||
      Math.abs(LinearTranslate.targetZ[eid] - cache[2]) > F32_EPSILON;
  }
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('checkPositionDiff requires LinearTranslate or EntityObject3D component.');
  }
  const position = EntityObject3DProxy.get(eid).root.position;
  return Math.abs(position.x - cache[0]) > F32_EPSILON ||
    Math.abs(position.y - cache[1]) > F32_EPSILON ||
    Math.abs(position.z - cache[2]) > F32_EPSILON;
};

export const positionSerializers = {
  deserializer: deserializePosition,
  diffChecker: checkPositionDiff,
  networkDeserializer: deserializeNetworkedPosition,
  serializer: serializePosition,
};
```

## Utilities

### removeComponentsAndThenEntity()

## App

```typescript

```

### SystemOrder

## User app

```typescript
// src/app.ts
import { App } from "@tiny-web-metaverse/client/src";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.start();
```

## Custom addons

```typescript
// src/components/foo

import { defineComponent, Types } from "bitecs";

export const FooComponent = defineComponent({
  data: Types.f32
});

// src/systems/foo.ts

import { defineQuery } from "bitecs";
import { FooComponent } from "../components/foo";

const fooQuery = defineQuery([FooComponent]);

export const fooSystem = (world: IWorld): void => {
  fooQuery(world).forEach(eid => {
    FooComponent.data[eid] += 1.0;
  });
};

// src/app.ts

import { addComponent, addEntity } from "bitecs";
import { App, SystemOrder } from "@tiny-web-metaverse/client/src";
import { FooComponent } from "./components/foo";
import { fooSystem } from "./systems/foo";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.registerSystem(fooSystem, SystemOrder.BeforeMatricesUpdate);

const eid = addEntity(world);
addComponent(world, FooComponent, eid);
FooComponent.data[eid] = 0.0;

app.start();
```

## Example App - Avatar

```typescript
// src/prefabs/avatar.ts

import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import {
  addObject3D,
  Avatar,
  InScene,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale  
} from "@tiny-web-metaverse/client/src";

export const AvatarPrefab = (world: IWorld): number => {
  const eid = addEntity(world);

  addComponent(world, Avatar, eid);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, InScene, eid);

  const avatarObject = new Mesh(
    new SphereGeometry(0.25),
    new MeshBasicMaterial({ color: 0xaaaacc })    
  );
  addObject3D(world, avatarObject, eid);

  return eid;
};

// src/systems/avatar_key_controls.ts

import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Avatar,
  KeyEvent,
  KeyEventProxy,
  KeyEventType,
  LinearMoveBackward,
  LinearMoveForward,
  LinearMoveLeft,
  LinearMoveRight,
  Local
} from "@tiny-web-metaverse/client/src";

const eventQuery = defineQuery([Avatar, KeyEvent, Local]);

export const avatarKeyControlsSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    const speed = 1.0;
    for (const e of KeyEventProxy.get(eid).events) {
      if (e.code === 37) { // Left
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveLeft, eid);
          LinearMoveLeft.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveLeft, eid);
        }
      } else if (e.code === 38) { // Up
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveForward, eid);
          LinearMoveForward.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveForward, eid);
        }
      } else if (e.code === 39) { // Right
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveRight, eid);
          LinearMoveRight.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveRight, eid);
        }
      } else if (e.code === 40) { // Down
        if (e.type === KeyEventType.Down) {
          addComponent(world, LinearMoveBackward, eid);
          LinearMoveBackward.speed[eid] = speed;
        } else if (e.type === KeyEventType.Up) {
          removeComponent(world, LinearMoveBackward, eid);
        }
      }
    }
  });
};

// src/app.ts

import { addComponent, addEntity } from "bitecs";
import {
  App,
  AudioDestination,
  createNetworkedEntity,
  KeyEventListener,
  registerPrefab,
  SystemOrder
} from "@tiny-web-metaverse/client/src";
import { AvatarPrefab } from "./prefabs/avatar";
import { avatarKeyControlsSystem } from "./systems/avatar_key_controls";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.registerSystem(avatarKeyControls, SystemOrder.BeforeMatricesUpdate);

const world = app.getWorld();

registerPrefab(world, 'avatar', AvatarPrefab);

const avatarEid = createNetworkedEntity(world, NetworkedType.Local, 'avatar');
EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.75, 2.0);
addComponent(world, KeyEventListener, avatarEid);
addComponent(world, AudioDestination, avatarEid);

app.start();
```

## Example - with existing addons

```typescript
// src/app.ts

import { addComponent, addEntity } from "bitecs";
import { avatarKeyControlsSystem } from "@tiny-web-metaverse/addons/src";
import {
  App,
  AudioDestination,
  createNetworkedEntity,
  KeyEventListener,
  registerPrefab,
  SystemOrder
} from "@tiny-web-metaverse/client/src";
import { AvatarPrefab } from "./prefabs/avatar";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.registerSystem(avatarKeyControls, SystemOrder.BeforeMatricesUpdate);

const world = app.getWorld();

registerPrefab(world, 'avatar', AvatarPrefab);

const avatarEid = createNetworkedEntity(world, NetworkedType.Local, 'avatar');
EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.75, 2.0);
addComponent(world, KeyEventListener, avatarEid);
addComponent(world, AudioDestination, avatarEid);

app.start();
```