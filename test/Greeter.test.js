const { expect } = require("chai");
// Load compiled artifacts

const Greeter = artifacts.require("Greeter");

// Start test block
contract("Greeter", function (accounts) {

    it("Should return the new greeting once it’s changed", async function () {
      const greeter = await Greeter.new("Hello world");
      expect(await greeter.greet()).to.equal("Hello world");
      const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
      // wait until the transaction is mined
      expect(await greeter.greet()).to.equal("Hola, mundo!");
    });
  });
