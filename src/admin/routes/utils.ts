export function chunkArray(array, chunkSize) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, (index + 1) * chunkSize)
    );
  }

export function copyObjectExceptKey(obj, keyToExclude) {
    // Destructure the object, excluding the specified key
    const { [keyToExclude]: _, ...newObj } = obj;
    return newObj;
  }