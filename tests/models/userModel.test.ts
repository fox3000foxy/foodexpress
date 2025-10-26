import User from '../../src/models/userModel';

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      role: 'user'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.role).toBe(userData.role);
  });

  it('should require email, username, and password', async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow();
  });
});
