export function* toGenerator<T>(pending: Promise<T>): Generator<void, T> {
  let done = false;
  let error = null;
  let result = null;

  pending.then(res => {
    done = true;
    result = res;
  }).catch(e => {
    done = true;
    error = e;
  });  	

  while (!done) {
    yield;
  }

  if (error !== null) {
    throw error;
  }

  return result;
}
