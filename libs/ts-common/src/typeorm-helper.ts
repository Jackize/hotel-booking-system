import { DataSource } from 'typeorm';
export function createDataSource(options: ConstructorParameters<typeof DataSource>[0]) {
    const dataSource = new DataSource(options);
    return dataSource;
}