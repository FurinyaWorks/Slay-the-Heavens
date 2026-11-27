import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';

// Parse the verified archive in memory. Artifact paths are never used as
// filesystem paths, and only the caller's exact file inventory is returned.
export function readVerifiedArtifactZip(raw, artifact, names, maxEntryBytes = 64 * 1024 ** 2) {
  assert(Buffer.isBuffer(raw) || raw instanceof Uint8Array, 'Artifact adapter must return original ZIP bytes');
  const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  assert(artifact.size_in_bytes === undefined || bytes.length === artifact.size_in_bytes,
    'Artifact ZIP length differs from the immutable API record');
  assert.equal('sha256:' + createHash('sha256').update(bytes).digest('hex'), artifact.digest,
    'Artifact ZIP digest differs from immutable artifact');
  const end = bytes.length - 22;
  assert(end >= 0 && bytes.readUInt32LE(end) === 0x06054b50 && bytes.readUInt32LE(end + 4) === 0 &&
    bytes.readUInt16LE(end + 8) === names.length && bytes.readUInt16LE(end + 10) === names.length &&
    bytes.readUInt16LE(end + 20) === 0, 'Unexpected Artifact ZIP directory or file count');
  const offset = bytes.readUInt32LE(end + 16);
  assert(offset + bytes.readUInt32LE(end + 12) === end, 'Malformed Artifact ZIP directory');
  const allowed = new Set(names);
  const result = {};
  let directory = offset;
  const ranges = [];
  for (let index = 0; index < names.length; index++) {
    assert(directory + 46 <= end && bytes.readUInt32LE(directory) === 0x02014b50, 'Malformed Artifact ZIP directory');
    const flags = bytes.readUInt16LE(directory + 8);
    const method = bytes.readUInt16LE(directory + 10);
    const compressed = bytes.readUInt32LE(directory + 20);
    const size = bytes.readUInt32LE(directory + 24);
    const nameSize = bytes.readUInt16LE(directory + 28);
    const next = directory + 46 + nameSize + bytes.readUInt16LE(directory + 30) + bytes.readUInt16LE(directory + 32);
    const type = (bytes.readUInt32LE(directory + 38) >>> 28) & 15;
    const local = bytes.readUInt32LE(directory + 42);
    const nameBytes = bytes.subarray(directory + 46, directory + 46 + nameSize);
    const name = nameBytes.toString('utf8');
    assert(next <= end && allowed.delete(name) && Buffer.from(name).equals(nameBytes) &&
      (flags & 1) === 0 && [0, 8].includes(method) && [0, 8].includes(type) &&
      (bytes.readUInt32LE(directory + 38) & 16) === 0 &&
      size > 0 && size <= maxEntryBytes && local + 30 <= offset && bytes.readUInt32LE(local) === 0x04034b50 &&
      bytes.readUInt16LE(local + 6) === flags && bytes.readUInt16LE(local + 8) === method, 'Unexpected Artifact ZIP entry');
    const localName = bytes.readUInt16LE(local + 26);
    const start = local + 30 + localName + bytes.readUInt16LE(local + 28);
    const stop = start + compressed;
    assert(localName === nameSize && bytes.subarray(local + 30, local + 30 + localName).equals(nameBytes) &&
      stop <= offset && ranges.every(([from, to]) => stop <= from || local >= to), 'Artifact ZIP entry differs from its directory');
    ranges.push([local, stop]);
    const payload = bytes.subarray(start, stop);
    const data = method === 0 ? payload : inflateRawSync(payload, {maxOutputLength:size});
    assert(data.length === size, 'Artifact ZIP entry size differs');
    Object.defineProperty(result, name, {value:data, enumerable:true});
    directory = next;
  }
  assert(directory === end && allowed.size === 0, 'Unexpected Artifact ZIP directory contents');
  return result;
}
