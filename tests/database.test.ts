import { initializeDatabase } from '../src/database';
import User from '../src/models/userModel';

describe('Database Initialization', () => {
  it('should initialize database if not seeded', async () => {
    jest.spyOn(User, 'countDocuments').mockResolvedValue(0);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await initializeDatabase();

    expect(consoleSpy).toHaveBeenCalledWith('Database not seeded. Initializing with seed data...');
    expect(consoleSpy).toHaveBeenCalledWith('Database initialization completed.');

    consoleSpy.mockRestore();
  });
});
