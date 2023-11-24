# Tiny Web Metaverse Client core concept

This document describes the Tiny Web Metaverse Client core concept needed for
Client or Addons development.

## Client overview

Client is the software (Web page) that end-users directly operate in the Tiny
Web Metaverse framework, and it mainly plays the following roles.

- 3D graphics rendering using [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- VR/AR processing using [WebXR](https://immersiveweb.dev/), such as positional tracking
- Network synchronization of object states with remote clients using
  [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) via
  [State server](../state_server)
- Audio and video communication with remote clients using [WebRTC](https://webrtc.org/)
  via [Stream server](../stream_server)
- Input handling from input devices such as mouse, keyboard, touchscreen, VR headset,
  and so on

## Client core

Client provides the minimum and basic functions for the virtual 3D space.
Advanced functions are implemented extensively by framework users.

For example, Client provides a way to define an avatar, but setting the
model and other settings of the avatarthe is user's responsibility.

Additionally, Client detects input from input devices and shapes it into a form
that is easy to process, but the users implement how to process the input.

For example, the users implement how to move the avatar with which button when
keyboard input is received.

Moreover, Client does not involve in the 2D UI that is overlapped on the 3D
Canvas. The implementation of the 2D UI is the responsibility of the user.

Hereafter, The "Client that provides basic functions" will be referred to as
"Client core" when emphasizing it

## Addons

Framework users need to implement application-specific processing outside of
the Client core. However, many of these processes are highly reusable.

For example, the operation of an avatar using a keyboard is a similar process
in many applications. Such processes are published as [Addons](../addons).

By selectively importing Addons, framework users do not need to implement
highly reusable processes themselves.

If you want to fine-tune the functionality of an Addon, copy the source code
and edit it for use.

If you want to add an addon to Addons, please send a
[Pull Request](https://github.com/takahirox/tiny-web-metaverse/pulls).

## Core third-party libraries

### Three.js

Tiny Web Metaverse Client uses the JavaScript 3D graphics library [Three.js](https://threejs.org/)
to manage objects in 3D space, render 3D space using WebGL, and process VR and
AR using WebXR.

Three.js knowledge is essential for developing the Client core, Addon, and
user apps. If you are new to Three.js, please learn the basics from the
[documentation](https://threejs.org/docs/).

The following explanations assume that the reader has a basic understanding
of Three.js.

### bitECS

Tiny Web Metaverse Client uses the JavaScript ECS library
[bitECS](https://github.com/NateTheGreatt/bitECS).

Similarly to Three.js, basic knowledge of bitECS is required to develop a
Client, Addon, or user app. If you are not familiar with bitECS, I recommend
learning the basics from the [documentation](https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md).

From here on, this document assumes that the reader has basic knowledge of bitECS.

## ECS architecture

Tiny Web Metaverse Client adopts
[ECS (Entity Component System) architecture](https://en.wikipedia.org/wiki/Entity_component_system).

Entity Component System (ECS) is a software architectural pattern commonly used in game development for representing game world objects. It decomposes game objects into three distinct parts: entities, components, and systems.

- Entities: Entities represent the unique objects in the game world. They serve
  as mere identifiers and don't hold any data or behavior. Each entity is
  assigned a unique identifier, allowing systems to reference and operate on
  them.
- Components: Components are data containers that hold the attributes and
  properties of entities. They are essentially data structures that encapsulate
  the characteristics of an entity, such as position, velocity, health, sprite,
  and other relevant information.
- Systems: Systems are the functional units that act upon entities and
  components. They represent the behavior and logic of the game, processing
  data from components and modifying entities accordingly. Systems operate on
  groups of entities that possess specific components.

## ECS in Tiny Web Metaverse

### Entity

Use `addEntity()` of bitECS to create a new entity.

```typescript
import { addEntity, IWorld } from "bitecs";

const somewhere = (world: IWorld): void => {
  const eid = addEntity(world);
  ...
};

```

The essence of an entity is an integer, called an Entity ID. It is often
abbreviated as `eid` in Tiny Web Metaverse.

When an entity is deleted by the `removeEntity()` of bitECS, the Entity ID is
returned to a pool managed by bitECS. This ID can be reused later.

In Tiny Web Metaverse, we assume that the pool is large enough that Entity
IDs are not immediately reused, for simplicity.

### Component

Use `defineComponent()` of bitECS to define a component and `addComponent()`
to assign a component to an entity.

```typescript
// src/components/foo.ts

import { defineComponent } from "bitecs";

export const FooComponent = defineComponent();

// Add a component to an entity

import { IWorld } from "bitecs";
import { FooComponent } from "../components/foo";

const somewhere = (world: IWorld, eid: number): void => {
  addComponent(world, FooComponent, eid);
  ...
};

```

You can define component with component data definition.

```typescript
// src/components/foo.ts
import { defineComponent, Types } from "bitecs";

export const FooComponent = defineComponent({
  data: Types.f32
});

// Add a component to an entity and
// initialize the component data

import { IWorld } from "bitecs";
import { FooComponent } from "../components/foo";

const somewhere = (world: IWorld, eid: number): void => {
  addComponent(world, FooComponent, eid);
  FooComponent.data[eid] = 0.0;
  ...
};
```

bitECS doesn't support non-numeric data types natively. If you want to use
non-numeric data type, use [Component Proxy](https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md#-component-proxy)
style. (Our Component Proxy style is not exactly same as the bitECS one but
inspired by it.)We use static `get` method to reuse Proxy instance to maintain
high performance iteration.

```typescript
// src/components/foo.ts
import { defineComponent } from "bitecs";
import { Foo } from "foo-lib";
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

When you add a component that has proxy to an entity you also need to get
proxy and initialize the component data.

```typescript
import { IWorld } from "bitecs";
import { Foo } from "foo-lib";
import { FooComponent, FooProxy } from "../components/foo";

const somewhereToAdd = (world: IWorld, eid: number): void => {
  addComponent(world, FooComponent, eid);
  const proxy = FooProxy.get(eid);
  proxy.allocate(new Foo());
  ...
};
```

TODO: A mechanism is needed to ensure that a component and its data managed by
proxy have the same lifetime. Currently, this requires manual oversight, which
is prone to errors.

Note that only a single proxy instance exists for each component. If you need
to access components for multiple entities, obtain a new proxy after each
entity's operation is complete.

```typescript
// Bad
const proxy1 = FooProxy.get(eid1);
const proxy2 = FooProxy.get(eid2);

// This operation is wrong, proxy1 internally refers to eid2's component
proxy1.foo.operation();

proxy2.foo.operation();

// Good
const proxy1 = FooProxy.get(eid1);
proxy1.foo.operation();
const proxy2 = FooProxy.get(eid2);
proxy2.foo.operation();
```

TODO: This limitation can be an error prone because static type checking
can't detect the problem and it requires manual oversight.

### System

A system in Tiny Web Metaverse Client is just a function that takes `IWorld`
of bitECS.

```typescript
import { IWorld } from "bitecs";

export const fooSystem = (world: IWorld): void => {
  ...
};
```

Systems registered to `App` that is explained later are invoked once an
animation frame.

We highly recommend to use `query` of bitECS to access specific components.

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

### Remove entities

Removing an entity is a tricky part in Tiny Web Metaverse Client because
we use Component Proxy style described above. Just removing an entity
`removeEntity()` of `bitECS` doesn't release proxy and component data.
It can cause memory leak and also may cause a problem when an entity
is recycled.

To resolve this problem, a special flow has been introduced.

First, write a system for a component that has proxy to release the
component data when the component is removed from an entity.

```typescript
// src/systems/clear_foo.ts

import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  FooComponent,
  FooProxy
} from "../components/foo";

const exitFooQuery = exitQuery(defineQuery([FooComponent]));

export const clearFooSystem = (world: IWorld): void => {
  exitFooQuery(world).forEach(eid => {
    const proxy = FooProxy.get(eid);
    const foo = proxy.foo;
    foo.close();
    proxy.free();
  });
};
```

When you remove the component from an entity, just use `removeComponent()`
of bitECS. The component data will be released when the releasing system
is called next time.

```typescript
import { IWorld, removeComponent } from "bitecs";
import { FooComponent } from "../components/foo";

const somewhereToRemove = (world: IWorld, eid: number): void => {
  removeComponent(world, FooComponent, eid);
  ...
};
```

If you want to remove an entity, use built-in `removeComponentsAndThenEntity()`
utility function. It immediately removes all the components associated with
an entity, and then remove the entity after several animation frames. It allows
systems to release component data in that interval.

```typescript
import { IWorld } from "bitecs";
import { removeComponentsAndThenEntity } from "@tiny-web-metaverse/client/src";

const somewhereToRemove = (world: IWorld, eid: number): void => {
  removeComponentsAndThenEntity(world, eid);
  ...
};
```

## App

`App` in Client manages systems and calls registered systems once an animation
frame for each.

Framework user creates an `App` instance with [canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)
and `roomId` in their user applications. `roomId` is an identifier for room.
Only clients in the same room can see and communicate each other. In the
constructor built-in entities and systems are created or registered.

`App.start()` starts an application. This is an example of a minimal user
application. (But nothing is rendered because no entity has been created to
which Three.js objects are assigned. How to assign Three.js objects is
explained later.)

```typescript
import { App } from "@tiny-web-metaverse/client/src";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.start();
```

### registerSystem()

`App.registerSystem()` is a method for registering a system to `App`. A
registered system is called in animation loop at specified timing.

The method takes `system` and `orderPriority` as arguments. `system` is
a function that takes `IWorld` of bitECS. `orderPriority` is an integer.

Registered `system`s are called in the animation loop in the order of the
`orderPriority` numbers. Note that the order in which `system`s with the same
`orderPriority` value are called is not specified.

### System order

Systems are generally expected to be executed in the following order.

- Time: Get elapsed and delta time.
- EventHandling: Handling async events detected while ideling. 
- Setup: Set up any resource at the beginning of an animation loop.
- BeforeMatricesUpdate: Update transforms (position/rotation/scale).
- MatricesUpdate: `App` update scene graph matrices. See "Matrices update"
  section for the details.
- BeforeRender: Operate anything that use updated matrices and that don't need
  transform update. Or operate anything that should be done right before
  rendering.
- Render: `App` renders the scene with Three.js `WebGLRenderer.render()`
- AfterRender: Operate anything that should be done right after rendering.
- PostProcess: Apply post-processing visual effects.
- TearDown: Operate anything that should be done at the end of an animation
  loop, for example clearing event components.

We highly recommend to use predefined `SystemOrder` corresponsing to them to
specify systems execution order. The values are just integers so 

```typescript
export const SystemOrder = Object.freeze({
  Time: 0,
  EventHandling: 100,
  Setup: 200,
  BeforeMatricesUpdate: 300,
  MatricesUpdate: 400,
  BeforeRender: 500,
  Render: 600,
  AfterRender: 700,
  PostProcess: 800,
  TearDown: 900
});
```

This is an example.

```typescript
import { App, SystemOrder } from "@tiny-web-metaverse/client/src";
import { barSystem } from "./systems/bar";
import { fooSystem } from "./systems/foo";

const roomId = '1234';
const canvas = document.createElement('canvas');

const app = new App({ canvas, roomId });
document.body.appendChild(canvas);

app.registerSystem(fooSystem, SystemOrder.BeforeMatricesUpdate);
// "+ 1" is to ensure that barSystem runs after fooSystem
app.registerSystem(barSystem, SystemOrder.BeforeMatricesUpdate + 1);

app.start();
```

## Coroutine

Systems execution order is predictable in Tiny Web Metaverse Client. It makes
easier to control systems and improves the simplicity and maintainability.

Async/Await must not be used in systems to keep this policy. Instead, consider
to use Coroutine approach with JavaScript
[generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
and [yield*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*).
Some async/await operations may not be avoidable, for example calling async
functions in a third-party library. In that case, use built-in `toGenerator()`
utility function that allows to handle an async function as a generator function.

This is an example.

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
import { loadFooAsync } from "foo-lib";
import { toGenerator } from "@tiny-web-metaverse/client/src";
import {
  FooComponent,
  FooLoader,
  FooLoaderProxy,
  FooProxy
} from "../components/foo";

function* load(world: IWorld, eid: number): Generator {
  const url = FooLoaderProxy.get(eid).url;
  const foo = yield* toGenerator(loadFooAsync(url));
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

Note that any state can change while waiting for the completion of a generator
function. You must not use any data fetched before a generator function starts,
after a generator function has completed.

```typescript
// Bad
const data: number = BarProxy.get(eid).bar.data;
yield* generatorFunction();
operate(data);

// Good
yield* generatorFunction();
const data: number = BarProxy.get(eid).bar.data;
operate(data);
```

## Three.js stuffs

There are some limitations and restrictions for Three.js operations to
simplify and optimize.

### EntityObject3D

If you want to assign Three.js `Object3D`s to an entity, use built-in
`EntityObject3D` component and its proxy. `EntityObject3DProxy.allocate()`
allocates a new Three.js `Group`, called `EntityRootGroup`, as `root`.

You can access `root` via `EntityObject3DProxy.root`. You can control
the transform of an entity's Object3D immediately after assigning
`EntityObject3D`.

```typescript
import { addComponent, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "@tiny-web-metaverse/client/src";

const setupEntityObject3D = (world: IWorld, eid: number): void => {
  addComponent(world, EntityObject3D, eid);
  EntityObject3DProxy.get(eid).allocate();
  const root = EntityObject3DProxy.get(eid).root;
  root.position.set(0.0, 0.0, -2.0);
};
```

Call built-in `addObject3D()` utility function to add your Three.js `Object3D`
(eg: `Mesh`). You can call `addObject3D()` even before assiging
`EntityObject3D` component to an entity because the function assigns it
if the component is not assigned yet. Use built-in `removeObject3D()`
utility function to remove an Three.js `Object3D` from an entity.

When an `Object3D` is assigned to an entity, its transform must be identity
(identity matrix). Update the transform via `EntityObject3DProxy.root` after
assigning.

```typescript
import { IWorld } from "bitecs";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { addObject3D } from "@tiny-web-metaverse/client/src";

const addSphereMesh = (world: IWorld, eid: number): void => {
  const geometry = new SphereGeometry(1.0);
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);
  addObject3D(world, mesh, eid);
  EntityObject3DProxy.get(eid).root.position.set(0.0, 0.0, 2.0);
};
```

Multiple `Object3D`s can be assigned to an entity. `addObject3D()`
and `removeObject3D()` form the following Three.js objects structure as
optimization. When swapping the root object, they keep the transform
(position/rotation/scale/matrix). 

```
The number of assigned Object3Ds: 0

- EntityRootGroup (EntityObject3DProxy.root)

The number of assigned Object3Ds: 1

- Object3D (EntityObject3DProxy.root)

The number of assigned Object3Ds: 2-

- EntityRootGroup (EntityObject3DProxy.root)
  - Object3D_A
  - Object3D_B
  ...
```

`root` object can be swapped so it is a good practice to access
`EntityObject3DProxy.root` right before using it.

```typescript
// Bad
const root = EntityObject3DProxy.get(eid);
something(); // This function may add or remove Object3D from an entity
root.position.set(0.0, 0.0, 2.0);

// Good
something();
const root = EntityObject3DProxy.get(eid);
root.position.set(0.0, 0.0, 2.0);
```

TODO: Static type check can't detect misoperation like the bad one in the
above example code. Can we introduce a mechanism to avoid the problem?

TODO: Remove this optimization? It can be simpler.

### InScene

Add `InScene` built-in component to an entity to add its Three.js `Object3D`s to
Three.js `scene`. A built-in system adds them to the `scene`. If `InScene`
component is removed from an entity, the system removes its `Object3D`s from the
`scene`.

```typescript
import { addComponent, IWorld } from "bitecs";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { addObject3D, InScene } from "@tiny-web-metaverse/client/src";

const addSphereMesh = (world: IWorld, eid: number): void => {
  const geometry = new SphereGeometry(1.0);
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);
  addObject3D(world, mesh, eid);
  EntityObject3DProxy.get(eid).root.position.set(0.0, 0.0, 2.0);
  addComponent(world, InScene, eid);
};
```

### Scene hierarchy

In Tiny Web Metaverse Client, Three.js `Scene` is expected to have an identity
matrix and `Object3D`s assigned to an entity are expected to be not the children
of other `Object3D`s assigned to other entities for simplicity and optimization
as

- The scene graph can be kept shallow and scene graph matrices update cost
can be lower because a Three.js `Object3D`'s transform update doesn't affect
many `Object3D`s in the scene.
- The local transform of a `EntityObject3D`'s `root` match its world transform
so even when world transform is needed world transform calculation is not
needed.

If an entity's `Object3D` wants to be as if a child of other entity's `Object3D`
you can manipulate the matrix like this.

```typescript
import { entityExists, hasComponent, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "@tiny-web-metaverse/client/src";

const asIfChild = (world: IWorld, eid: number, parentEid: number): void => {
  if (!entityExists(world, parentEid) ||
    !hasComponent(world, EntityObject3D, parentEid) {
    return;
  }

  const root = EntityObject3DProxy.get(eid).root;
  const parent = EntityObject3DProxy.get(parentEid).root;

  root.updateMatrix();
  parent.updateMatrix();
  root.matrix.premultiply(parent.matrix);
  root.matrix.decompose(root.position, root.quaternion, root.scale);
};
```

TODO: Introduce a mechanism that allows entity's `Object3D` to act as if
a child of other entity's `Object3D`?

### Matrices update

`App` updates the entire scene graph matrices at `SystemOrder.MatricesUpdate` in
an animation loop. Systems that update transform(position/rotation/scale) should
run before it. And systemt that need updated matrices and don't update transform
should run after it for efficiency.

### Loading glTF

T.B.D.

## Event handling

As written above, we avoid async/await in systems for simplicity and predictable
execution order.

However, certain types of asynchronous event processing cannot be avoided, and
it is difficult to process them synchronously as-is. For example, input events
from input devices such as keyboard and mouse are generated by user operations,
so the timing of their occurrence cannot be predicted. Therefore, it is
generally common to listen for these asynchronous events and process them when
they occur. These asynchronous events typically occur during idle time.

Tiny Web Metaverse Client uses a trick to make these asynchronous events
processable synchronously within systems.

1. Add asynchronous events that occurred during idle time to a queue.
2. At the beginning of the next animation frame, a system notifies events to
entities that listen to that events by adding an event component to the
entities.
3. A system processes the entities that received the event notification.
4. At the end of the animation frame, a system deletes the event component.

Let's take a look at the details with some specific code examples.

First create an event and its listener components. The component holds events
as its component data.

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

export const FooEventListener = defineComponent();
```

And create a system that stores async events happened during the idle time to
a queue and notifies the events to entities that listen to that event by adding
the event component in an animation loop.

Also create a system that removes the event component.

```typescript
// src/systems/foo.ts

import {
  addComponent,
  defineQuery,
  enterQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  FooEvent,
  FooEventListener,
  FooEventProxy,
  FooEventType
} from "../components/foo";
import { NullComponent } from "../components/null";

const eventQueue: { type: FooEventType }[] = [];

// enterQuery + NullComponent is a hack for executing only at the first call
const initializeQuery = enterQuery(defineQuery([NullComponent]));

const listenerQuery = defineQuery([FooEventListener]);
const eventQuery = defineQuery([FooEvent]);

export const fooEventNotificationSystem = (world: IWorld): void => {
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

And then write a system that fetches entities that have the event component
and processes with the events.

```typescript
export const fooEventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    for (const e of FooEventProxy.get(eid).events) {
      ...
    }
  });
};
```

Finally, register the systems to `App`. We recommend `SystemOrder.EventHandling`
for systems that notify events to entities and `SystemOrder.TearDown` for
systems that remove event components. And systems that process with events need
to run between them.

```typescript
app.registerSystem(fooEventNotificationSyste, SystemOrder.EventHandling);
app.registerSystem(fooEventSystem, SystemOrder.BeforeMatricesUpdate);
app.registerSystem(clearFooEventSystem, SystemOrder.TearDown);
```

Event handling systems are ready. What you have to do last is to add a listener
component to entities that want to know events occurrence.

```typescript
const eid = addEntity(world);
addComponent(world, EventListener, eid);
```

### Input source interaction

T.B.D.

## 2D UI

As mentioned above, Client core doesn't take care of 2D UI controls that
overlaps 3D canvas. It is the responsibility of user-application (or addons);

If you want [HTML DOM elements](https://developer.mozilla.org/en-US/docs/Web/API/Element)
to interact entities or components, the implementation would be similar to
EventHandling described above, like storing events in idle time and processing
with them in animation loop. This is an example of system code.

```typescript
// src/systems/ui_button.ts

import { IWorld } from "bitecs";
import { FooComponent } from "../components/foo";
import { NullComponent } from "../components/null";

const enum ButtonEventType {
  Clicked
};

const eventQueue: { type: ButtonEventType }[] = [];

const button = document.createElement('button');
button.innerText = 'Click';
button.style.buttom = '10px';
button.style.left = '50%';
button.style.position = 'absolute';
button.style.transform = 'translate(-50%)';
button.style.zIndex = '1000';

button.addEventListener(() => {
  eventQueue.push({ type: ButtonEventType.Clicked });
});

// enterQuery + NullComponent is a hack for executing only at the first call
const initializeQuery = enterQuery(defineQuery([NullComponent]));
const fooQuery = defineQuery([FooComponent]);

export const buttonUISystem = (world: IWorld): void => {
  initializeQuery(world).forEach(() => {
    document.body.appendChild(button);
  });

  for (const e of eventQueue) {
    fooQuery(world).forEach(eid => {
      ...
    });
  }

  eventQueue.length = 0;
};
```

## Stream server connection

T.B.D.

## State server connection

T.B.D.

## Network sync

In Tiny Web Metaverse, the state of Entities can be selectively synchronized
with remote clients in the same room. Here, the state of an Entities refers to
the entity existence and the specified component data.

A synchronized Entity is called a Networked Entity, and its synchronized
components are called Networked Components.

Some built-in network systems perform network synchronization processing.

The network send system periodically checks for changes to the data in the
networked component. Only when changes are detected the system sends the
updated data to the remote client via the server. This helps to prevent network
data flooding.

The network receive system observes the network data sent from the remote
client. When data is received, the system reflects the data to the networked
components. Because data is only sent periodically, the system may interpolate
the data before reflecting it.

Network entities are bound to a client that created them. If a client leaves
the room, the network entities created by the client will be removed.

You need to do the following steps to create networked components and entities.

- Define networked components
- Write and register serializers/deserializers
- Write and register prefabs
- Create networked entity

Let's take a loot at one by one.

### Networked type

There are three networked types.

- Local: Local networked components/entities should be directly controlled only
by local client. Changes made to Local components/entities are sent to other
clients by built-in network send system. On remote clients, Local
components/entities appear as Remote.
- Remote: Remote networked components/entities should be directly controlled
only by a remote client that created them. Updates to remote entities are
received and applied to corresponding components/entities by built-in network
receive system. Remote components/entities appear as Local on a remote client
that created them and as Remote on other clients.
on their creator client and as Remote on other clients.
- Shared: Shared networked components/entities are controlled by any client.
Built-in network send and receive systems make them synced. Shared
components/entities appear as Shared on all clients.

### Networked Components

First you need to create a component that indicates another component is
networked. For instance, if you want to make `FooComponent` component
network-enabled, create `NetworkedFooComponent`. When both `FooComponent` and
`NetworkedFooComponent` are added to an entity, `FooComponent` becomes
networked. If only `FooComponent` is added, it remains non-networked.

```typescript
// src/components/foo.ts

import { defineComponent, Types } from "bitecs";

export const FooComponent = defineComponent({
  data: Types.f32
});
export const NetworkedFooComponent = defineComponent();

// Refer to the following "Serializer" section about this component
export const FooComponentInterpolation = defineComponent({
  target: Types.f32
});
```

### Serializer

Next, you have to write diff checkers, serializers, and deserializers for
networked components.

Diff checker is a function periodically called to check for changes of
networked component data.

Serializer is a function that serializes networked component data to send.
Deserializer is a function that deserializes serialized network component
data and reflects to component data.

You can define two deserializer types, one with interpolation and another
one for without interpolation. The non-interpolation one is used for component
data initialization and the other one is used for others.

In general, interpolation would be like 

Normally, interpolation is a process of gradually approaching the target value.
Such processing should be done in a system, and you need to write a system.
In the deserializer, you will need to add a component to drive the system.

```typescript
// src/serializers/position.ts

import {
  addComponent,
  hasComponent
} from "bitecs";
import {
  FooComponent,
  FooComponentInterpolation,
  NetworkedFooComponent
} from "../components/foo";

const EPSILON = 0.0001;
export type SerializedFoo = { data: number };

const checkFooDiff = (world: IWorld, eid: number, cache: SerializedFoo): boolean => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('checkFooDiff requires FooComponent component.');
  }
  return Math.abs(cache.data - FooComponent.data[eid]) > EPSILON;
};

const serializeFoo = (world: IWorld, eid: number): SerializedFoo => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('serializeFoo requires FooComponent component.');
  }
  return { data: FooComponent.data[eid] };
};

const deserializeFoo = (world: IWorld, eid: number, data: SerializedFoo): void => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('deserializeFoo requires FooComponent component.');
  }
  FooComponent.data[eid] = data.data;
};

const networkDeserializeFoo = (world: IWorld, eid: number, data: SerializedFoo): void => {
  if (!hasComponent(world, FooComponent, eid)) {
    throw new Error('networkDeserializeFoo requires FooComponent component.');
  }
  // Add a component to drive a interpolation system.
  // Interpolation system implementation is omitted in this example.
  addComponent(world, FooComponentInterpolation, eid);
  FooComponentInterpolation.target[eid] = data.data;
};

export const fooSerializers = {
  deserializer: deserializeFoo,
  diffChecker: checkFooDiff,
  networkDeserializer: deserializeFoo,
  serializer: serializeFoo
};
```

And then you have to register the functions with the built-in
`registerSerializers()` function to establish a mapping between the functions
and the networked component.

The second argument is a unique key string within the application that
identifies this mapping. This key is used in built-in network systems.

The third and fourth arguments specify a networked component and functions
for mapping. These functions must be contained within an object that provides
the `diffChecker`, `serializer`, `deserializer`, and `networkDeserializer`.
Deserializer function without interpolation should be passed as
`deserializer`, while deserializer function with interpolation should be
passed as `networkDeserializer`.

```typescript
import { registerSerializers } from "@tiny-web-metaverse/client/src";
import { NetworkedFoo } from "../components/networked_position";
import { fooSerializers } from "../serializers/foo";

registerSerializers(world, 'foo', NetworkedFoo, fooSerializers);
```

### Prefab

Next, you have to write a prefab. Prefab is a function that takes bitECS `world`
and an optional parameter, and creates an entity with preset components. Prefab
may be said an entity template function.

A networked entity is created from a prefab. Networked components for a
networked entity must be set up in a prefab.

```typescript
// src/prefabs/foo.ts

import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { FooComponent, NetworkedFoo } from "../components/foo";

export const FooPrefab = (world: IWorld, params: { data: number }): number => {
  const eid = addEntity(world);

  addComponent(world, FooComponent, eid);
  FooComponent.data[eid] = params.data;
  addComponent(world, NetworkedFoo, eid);

  return eid;
};
```

Similar to serializers, prefab have to be registered with the built-in
`registerPrefab()` function.

The second argument is a unique key string within the application that
identifies this prefab. This key is used when creating a networked entity.

The third argument specifies a prefab to register.

```typescript
import { registerPrefab } from "@tiny-web-metaverse/client/src";
import { NetworkedFoo } from "../components/networked_position";
import { fooSerializers } from "../serializers/foo";

registerPrefab(world, 'foo', FooPrefab);
```

### createNetworkedEntity()

The set up for networked entity creation has been done. The last thing you
have to do is create networked entities.

You can create a networked entity with the built-in `createNetworkedEntity()`.

The second argument specifies the network type with the built-in `NetworkedType`
enum, `Local` or `Shared`. `Remote` entities creation is fired from a remote
client so they are created in built-in network systems.
`createNetworkedEntity()` is only for `Local` or `Shared` networked entities.

The third argument is a registered prefab key used to create a networked
entity from.

```typescript
import {
  createNetworkedEntity,
  NetworkedType
} from "@tiny-web-metaverse/client/src";

const eid = createNetworkedEntity(world, NetworkedType.Local, 'foo');
```

Networked entities have the built-in `Networked` component. And also they have
either `Local`, `Remote`, or `Shared` built-in component corresponding to
network type.

## Audio processing

T.B.D.

### Positional audio

T.B.D.

### Custom audio effect

T.B.D.

## Other utilities

### NULL_EID and NullComponent

`App` first creates an entity with the built-in `NullComponent` component in
the constructor. This first entity itself should not be used for any processing.

However, its Entity ID (which should be zero) can be used to indicate that the
entity does not exist. For instance, you could write a function that searches
for entities with a specific component and returns their Entity ID. If no such
entity is found, it returns zero. There is a built-in variable, NULL_EID, which
represents a nonexistent Entity ID.

```typescript
import {
  Component,
  defineQuery
  IWorld,
  removeQuery
} from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";
import { FooComponent } from "../components/foo";

const searchAnyEntity = (world: IWorld, c: Component): number => {
  const query = defineQuery([c]);
  const eids = query(world);
  removeQuery(world, query);
  return eids.length > 0 ? eids[0] : NULL_EID;
};

const func = (world: IWorld): void => {
  const eid = searchAnyEntity(world, FooComponent);
  if (eid !== NULL_EID) {
    // If found
  } else {
    // If not found
  }
};
```

And built-in `NullComponent` component should be added only to that world-first
entity. This `NullComponent` can be used for letting a system process something
only in the first call by using bitECS `defineQuery()` and `enterQuery()`.

```typescript
import {
  defineQuery,
  enterQuery,
  IWorld
} from "bitecs";
import { NullComponent } from "@tiny-web-metaverse/client/src";

const initializeQuery = enterQuery(defineQuery([NullComponent]));

export const barSystem = (world: IWorld): void => {
  initializeQuery(world).forEach(() => {
    // This code is only executed once, the first time the system is called.
  });
};
```

## User app examples

So far, you have learned the Client core concepts necessary to create your own
Client (User app). You can create your own Client on top of the Client Core by
adding Entities, Components, Systems, Prefabs, Serializers, UI, and so on. You
can also import [the Readme of addons package](../addons) or create and publish
addons for others to reuse.

A good starting point is to create a Client that displays avatars.

If you need more practical examples, see [the examples package](../examples).

### Avatar example

This is a very basic example to handle networked avatars. 

- An avatar appears as a sphere object in the scene
- Local avatar is moved with the arrow keys
- Remote avatars shown moved by remote clients

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

### Avatar example with addons

This example is based on the above example. Instead of implementing a custom
avatar key controls system, it imports controls addons and set them up.

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

## Built-in components

T.B.D.

## Network sync internal

T.B.D.
