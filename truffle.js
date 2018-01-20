module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },


    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4" // Match any network id
    }

    live: {
      host: "localhost",
      port:8545,
      network_id: 1
      from: "address here"
      gas: 20000000 //max amount of gas that you are willing to pay
    }
  }
};
