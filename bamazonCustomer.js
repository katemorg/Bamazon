/*1. Upon start, read the database and display pretty list of all items, include ids, names, and prices.
2. Also prompt the user with two messages: 
	1. ask the user to select the id of the product they would like to buy.
	2. ask the user how many units of the product they would like to buy.
3. Once these are selected, check if the store has enough of the product to meet the customer's request. 
	1. if not, console.log("Insufficient quantity!"); and then prevent the order from going through
	2. if yes, fulfil the cusotmer's order by updating the database to reflect the remaining quantity.
		1. Also show the customer the total cost of the purchase*/

//requirements and connections
const inquirer = require("inquirer");
const Promises = require('bluebird');
const mysql = Promises.promisifyAll(require('mysql'));
Promises.promisifyAll(require("mysql/lib/Connection").prototype);
Promises.promisifyAll(require("mysql/lib/Pool").prototype);

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "1215",
	database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
});

var start = function() {
  // query the database for all available items
	connection.queryAsync("SELECT * FROM products").then(response => {
		choices = response.map ( item => {
			return {
				name : `${item.product_name}: ${item.price}`,
				value: item.item_id
			}	
		});

	    inquirer.prompt([
	      {
	        name: "choice",
	        type: "list",
	        choices: choices,
	        message: "What item would you like to purchase?"
	      },
	      {
	        name: "qty",
	        type: "input",
	        message: "How many would you like?"
	      }])
		    .then(data => {
		    	if (data.stock_quantity > parseInt(data.qty)){
		    		connection.queryAsync(
		    						"UPDATE products SET stock_quantity = ? WHERE item_id = ?", 
		    						[data.qty, data.choice]
		    					);
		    		console.log("Your Order has been Placed.");
		    	}
		    	else {
		    		console.log("Transaction Failed: Insufficient stock.");
		    	}
		    })
		    .then(() => {
		    	connection.end();
		    })
		    .catch(err => {throw err});
	});
};

start();