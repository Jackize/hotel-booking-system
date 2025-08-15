import * as fs from 'fs';
import * as path from 'path';

export const InventoryHoldCreatedSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'inventory.created.avsc'), 'utf8'),
);
export const InventoryHoldReleasedSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'inventory.released.avsc'), 'utf8'),
);
