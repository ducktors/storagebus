# StorageBus

StorageBus is a storage abstraction context for treating filesystems, cloud object stores, and memory as interchangeable places to store and retrieve objects.

## Language

**Storage**:
The user-facing storage capability that accepts object writes and returns stored objects. A **Storage** uses exactly one **Adapter** for its lifetime.
_Avoid_: provider-specific storage, storage bus storage

**Adapter**:
The backend-specific connector that lets a **Storage** use a particular storage backend such as memory, a local filesystem, S3, or GCS.
_Avoid_: provider storage, storage implementation

**Storage Backend**:
The actual place where objects are stored, such as memory, a local filesystem, S3, or GCS.
_Avoid_: storage provider, storage type

**Object Key**:
A portable, POSIX-style relative identifier for an object inside a **Storage**. An **Object Key** is not a backend-native path or URI and must not escape the **Storage** boundary.
_Avoid_: filesystem path, object path, backend key

**BusFile**:
The file-like representation of a stored object returned by a **Storage** for an **Object Key**. A **BusFile** follows the File-style shape and exposes the Object Key as its name, without exposing backend-native locations.
_Avoid_: stored object, storage file

## Example Dialogue

Developer: Which Storage Backend should we use in tests?

Domain expert: Use the memory Adapter with the same Storage used in production.

Developer: Should the app switch imports when it moves from local development to GCS?

Domain expert: No. The app should keep the same Storage concept and choose a different Adapter for the target Storage Backend.

Developer: Can we write `../secrets.txt` as an object name when using the local Adapter?

Domain expert: No. That is not a valid Object Key because it escapes the Storage boundary.

Developer: Should a BusFile expose the absolute path used by the local filesystem Adapter?

Domain expert: No. A BusFile exposes the Object Key, not a backend-native location.
