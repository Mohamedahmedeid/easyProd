// greetUser.spec.js

describe('greetUser function', () => {
    it('should greet the user by name', () => {
      const name = 'John';
      const expectedGreeting = `Hello, ${name}!`;
  
      // Simulate calling the function from easyProd
      const actualGreeting = greetUser(name);
  
      expect(actualGreeting).toBe(expectedGreeting);
    });
  });
  