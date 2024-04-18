// greetUser.spec.js

describe('greetUser function', () => {
  it('should greet the user by name', () => {
    const name = 'John';
    const expectedGreeting = `Hello, ${name}!`;

    // Assuming greetUser is defined in easyProd (replace with actual implementation)
    function greetUser(name) {
      return `Hello, ${name}!`; // Example implementation
    }

    const actualGreeting = greetUser(name);

    expect(actualGreeting).toBe(expectedGreeting);
  });
});

  