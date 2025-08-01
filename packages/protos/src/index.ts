// Export inventory types with explicit naming
export * from './generated/inventory/inventory';

// Export Google protobuf empty types with explicit naming to avoid conflicts
export { Empty, GOOGLE_PROTOBUF_PACKAGE_NAME } from './generated/google/protobuf/empty';