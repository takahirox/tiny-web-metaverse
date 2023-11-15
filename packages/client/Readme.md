This document is T.B.D.

# Tiny Web Metaverse Client

This is a document for who are interested in Tiny Web Metaverse Client
or Client addons development.

## Client overview

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

## EntityObject3D

```typescript
const mesh = new Mesh(geometry, material);
addObject3D(world, mesh, eid);
```

```typescript
addComponent(world, EntityObject3D, eid);
EntityObject3DProxy.get(eid).allocate();
const root = EntityObject3DProxy.get(eid).root;
```

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
  FooComponent,
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

```

## App

```typescript

```

## Custom addons

```typescript

```
