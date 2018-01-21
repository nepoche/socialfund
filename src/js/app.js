App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function() {
    $.getJSON('ToastDAO.json', function(ToastDAOArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.ToastDAO = TruffleContract(ToastDAOArtifact);

      // Set the provider for our contract.
      App.contracts.ToastDAO.setProvider(App.web3Provider);

      // Listen for events
      App.listenToEvents();

      // Retrieve the fund from the smart contract
      return App.reloadfunds();
    });
  },

  reloadArticles: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ToastDAO.deployed().then(function(instance) {
      fundInstance = instance;
      return fundInstance.getFund();
    }).then(function(fundIds) {
      // Retrieve and clear the fund placeholder
      var fundsRow = $('#fundsRow');
      fundsRow.empty();

      for (var i = 0; i < fundIds.length; i++) {
        var fundId = fundIds[i];
        fundInstance.then(function(instance) {
          App.displayFund(fundInstance.getFund());
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.log(err.message);
      App.loading = false;
    });
  }
};

  // displayFund: function(owner, pv, roi) {
  //   // Retrieve the fund placeholder
  //   var fundsRow = $('#fundsRow');
  //
  //   var etherPrice = web3.fromWei(price, "ether");
  //
  //   // Retrieve and fill the fund template
  //   var fundTemplate = $('#fundTemplate');
  //   fundTemplate.find('.fund-roi').text(roi + "%");
  //   fundTemplate.find('.fund-pv').text(portfolioValue + " ETH");
  //   fundTemplate.find('.btn-buy').attr('data-value', etherPrice);
  //
  //   // seller?
  //   if (seller == App.account) {
  //     fundTemplate.find('.fund-seller').text("You");
  //     fundTemplate.find('.btn-buy').hide();
  //   } else {
  //   fundTemplate.find('.fundOwner').text(seller);
  //   fundTemplate.find('.btn-buy').show();
  //   }
  //
  //   // add this new fund
  //   fundsRow.append(fundTemplate.html());
  // },

  // createFund: function() {
    // retrieve details of the fund
  //   var _fund_name = $("#fund_name").val();
  //   var _description = $("#fund_description").val();
  //   var _price = web3.toWei(parseFloat($("#fund_price").val() || 0), "ether");
  //
  //   if ((_fund_name.trim() == '') || (_price == 0)) {
  //     // nothing to sell
  //     return false;
  //   }
  //
  //   App.contracts.ToastDAO.deployed().then(function(instance) {
  //     return instance.sellfund(_fund_name, _description, _price, {
  //       from: App.account,
  //       gas: 500000
  //     });
  //   }).then(function(result) {
  //
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // },

  // Listen for events raised from the contract
  // listenToEvents: function() {
  //   App.contracts.ToastDAO.deployed().then(function(instance) {
  //     instance.sellfundEvent({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       if (!error) {
  //         $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
  //       } else {
  //         console.error(error);
  //       }
  //       App.reloadfunds();
  //     });
  //
  //     instance.buyfundEvent({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       if (!error) {
  //         $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
  //       } else {
  //         console.error(error);
  //       }
  //       App.reloadfunds();
  //     });
  //   });
  // },

  // buyfund: function() {
//     event.preventDefault();
//
//     // retrieve the fund price
//     var _fundId = $(event.target).data('id');
//     var _price = parseFloat($(event.target).data('value'));
//
//     App.contracts.ToastDAO.deployed().then(function(instance) {
//       return instance.buyfund(_fundId, {
//         from: App.account,
//         value: web3.toWei(_price, "ether"),
//         gas: 500000
//       });
//     }).then(function(result) {
//
//     }).catch(function(err) {
//       console.error(err);
//     });
//   },
// };
//
// $(function() {
//   $(window).load(function() {
//     App.init();
//   });
// });
