import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  TextComponent,
  TextProxy
} from "../components/text";

const textQuery = defineQuery([TextComponent]);
const exitTextQuery = exitQuery(textQuery);

export const textSystem = (world: IWorld): void => {
  exitTextQuery(world).forEach(eid => {
    const proxy = TextProxy.get(eid);
    // TODO: Take into account text object can be shared
    proxy.text.dispose();
    proxy.free();
  });

  textQuery(world).forEach(eid => {
    // sync() invokes async text processing in workers.
    // https://github.com/protectwise/troika/tree/main/packages//troika-three-text#handling-asynchronous-updates
    //
    // It is safe to call sync() every frame from the
    // performance and efficiency perspective because
    // sync() checks whether to invoke costly processing
    // inside.
    //
    // Assumes it is safe even if text object is
    // disposed before the async processing is done
    // because TroikaText properly handles
    //
    // TODO: Call sync() only when needed and also
    //       detect sync completion with coroutine?
    //       Test can be easier.
    TextProxy.get(eid).text.sync();
  });
};
