import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld
} from "bitecs";
import nipplejs from "nipplejs";
import {
  VirtualJoystickEvent,
  VirtualJoystickEventListener,
  VirtualJoystickEventProxy,
  VirtualJoystickEventType,
  VirtualJoystickType,
  VirtualJoystick,
  VirtualJoystickLeft,
  VirtualJoystickProxy,
  VirtualJoystickRight
} from "../components/virtual_joystick";

// UI + Event handler + VirtualJoystick component activation & update

// TODO: Configurable?

const COLOR = '#ffcccb';
const DIV_WIDTH = '150px';
const DIV_HEIGHT = '150px';
const MODE = 'static';
const STICK_SIZE = 100;
const STICK_HALF_SIZE = STICK_SIZE * 0.5;

const parentElement = document.body;
const eventQueue: {
  data?: {
    distance: number,
    x: number,
    y: number
  },
  stick: VirtualJoystickType,
  type: VirtualJoystickEventType
}[] = [];

// TODO: Add comment about append and remove children here

const leftJoystickDiv = document.createElement('div');
leftJoystickDiv.style.position = 'absolute';
leftJoystickDiv.style.left = '0';
leftJoystickDiv.style.bottom = '0';
leftJoystickDiv.style.width = DIV_WIDTH;
leftJoystickDiv.style.height = DIV_HEIGHT;
parentElement.appendChild(leftJoystickDiv);

const rightJoystickDiv = document.createElement('div');
rightJoystickDiv.style.position = 'absolute';
rightJoystickDiv.style.right = '0';
rightJoystickDiv.style.bottom = '0';
rightJoystickDiv.style.width = DIV_WIDTH;
rightJoystickDiv.style.height = DIV_HEIGHT;
parentElement.appendChild(rightJoystickDiv);

const leftJoystick = nipplejs.create({
  color: COLOR,
  mode: MODE,
  position: { left: '50%', top: '50%' },
  size: STICK_SIZE,
  zone: leftJoystickDiv
});

const addMoveEvent = (
  stick: VirtualJoystickType,
  x: number,
  y: number,
  distance: number
): void => {
  eventQueue.push({
    data: {
      distance: distance / STICK_HALF_SIZE,
      x: x,
      y: y
    },
    stick,
    type: VirtualJoystickEventType.Move,
  });
};

const addStartEvent = (stick: VirtualJoystickType): void => {
  eventQueue.push({ stick, type: VirtualJoystickEventType.Start });
};

const addEndEvent = (stick: VirtualJoystickType): void => {
  eventQueue.push({ stick, type: VirtualJoystickEventType.End });
};

leftJoystick.on('move', (_, { distance, vector }) => {
  addMoveEvent(VirtualJoystickType.Left, vector.x, vector.y, distance);
});

leftJoystick.on('start', () => {
  addStartEvent(VirtualJoystickType.Left);
});

leftJoystick.on('end', () => {
  addEndEvent(VirtualJoystickType.Left);
});

const rightJoystick = nipplejs.create({
  color: COLOR,
  mode: MODE,
  position: { left: '50%', top: '50%' },
  size: STICK_SIZE,
  zone: rightJoystickDiv
});

rightJoystick.on('move', (_, { distance, vector }) => {
  addMoveEvent(VirtualJoystickType.Right, vector.x, vector.y, distance);
});

rightJoystick.on('start', () => {
  addStartEvent(VirtualJoystickType.Right);
});

rightJoystick.on('end', () => {
  addEndEvent(VirtualJoystickType.Right);
});

parentElement.removeChild(leftJoystickDiv);
parentElement.removeChild(rightJoystickDiv);

// TODO: Rename?
const addEvent = (
  world: IWorld,
  eid: number,
  stick: VirtualJoystickType,
  type: VirtualJoystickEventType,
  data?: {
    distance: number,
    x: number,
    y: number
  },
): void => {
  if (!hasComponent(world, VirtualJoystickEvent, eid)) {
    addComponent(world, VirtualJoystickEvent, eid);
    VirtualJoystickEventProxy.get(eid).allocate();
  }
  VirtualJoystickEventProxy.get(eid).add(stick, type, data);
};

const leftStickQuery = defineQuery([VirtualJoystick, VirtualJoystickLeft]);
const enterLeftStickQuery = enterQuery(leftStickQuery);
const exitLeftStickQuery = exitQuery(leftStickQuery);

const rightStickQuery = defineQuery([VirtualJoystick, VirtualJoystickRight]);
const enterRightStickQuery = enterQuery(rightStickQuery);
const exitRightStickQuery = exitQuery(rightStickQuery);

const listenerQuery = defineQuery([VirtualJoystickEventListener]);

export const virtualJoystickUISystem = (world: IWorld): void => {
  // Assumes up to one right/left virtual stick entity for each

  exitLeftStickQuery(world).forEach(() => {
    parentElement.removeChild(leftJoystickDiv);
  });
  exitRightStickQuery(world).forEach(() => {
    parentElement.removeChild(rightJoystickDiv);
  });

  enterLeftStickQuery(world).forEach(() => {
    parentElement.appendChild(leftJoystickDiv);
  });
  enterRightStickQuery(world).forEach(() => {
    parentElement.appendChild(rightJoystickDiv);
  });

  // TODO: Optimize and simplify
  const leftStickEids = leftStickQuery(world);
  const rightStickEids = rightStickQuery(world);

  for (const e of eventQueue) {
    if ((e.stick === VirtualJoystickType.Left && leftStickEids.length > 0) ||
      (e.stick === VirtualJoystickType.Right && rightStickEids.length > 0)) {
      listenerQuery(world).forEach(eid => {
        addEvent(world, eid, e.stick, e.type, e.data);
      });

      const eids = e.stick === VirtualJoystickType.Left ? leftStickEids : rightStickEids;
      if (e.type === VirtualJoystickEventType.Move) {
        eids.forEach(eid => {
          VirtualJoystickProxy.get(eid).update(e.data!.x, e.data!.y, e.data!.distance);
        });
      } else if (e.type === VirtualJoystickEventType.Start) {
        eids.forEach(eid => {
          VirtualJoystickProxy.get(eid).activate(true);
        });
      } else if (e.type === VirtualJoystickEventType.End) {
        eids.forEach(eid => {
          VirtualJoystickProxy.get(eid).activate(false);
        });
      }
    }
  }

  eventQueue.length = 0;
};
