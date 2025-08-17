import * as fs from 'fs';
import * as path from 'path';

export const PricingRateUpdatedSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'pricing.rate.updated.avsc'), 'utf8'),
);
