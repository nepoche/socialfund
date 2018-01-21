var ToastDAO = artifacts.require("./ToastDAO.sol");

module.exports = function(deployer) {
  deployer.deploy(ToastDAO);
};
