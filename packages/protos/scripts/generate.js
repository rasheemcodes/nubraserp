const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');

// Resolve path
const PROTOC_GEN_TS_PATH = path.resolve(
  './node_modules/.bin/protoc-gen-ts_proto.cmd'
);
const SRC_DIR = path.resolve(__dirname, '../src');
const OUT_DIR = path.resolve(SRC_DIR, 'generated');
const GOOGLE_PROTO_PATH = path.join(
  __dirname,
  '../../../node_modules/google-proto-files'
);
// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Find all .proto files
const protoFiles = fg.sync(['**/*.proto'], {
  cwd: SRC_DIR,
  absolute: true,
});

const command = `protoc \
  --plugin=protoc-gen-ts_proto="${PROTOC_GEN_TS_PATH}" \
  --ts_proto_out="${OUT_DIR}" \
  --ts_proto_opt=outputServices=grpc-js,returnPromise=true,addGrpcMetadata=true,esModuleInterop=true,returnPromise=true,nestJs=true \
  --proto_path="${SRC_DIR}" \
  --proto_path="${GOOGLE_PROTO_PATH}" \
  ${protoFiles.map((file) => `"${file}"`).join(' ')}`;

console.log('🚀 Running:', command);

// Execute
try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to generate protobuf types:', error.message);
  process.exit(1);
}
