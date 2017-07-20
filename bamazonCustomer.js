const inquirer = require("inquirer");
const Promises = require('bluebird');
const mysql = Promises.promisifyAll(require('mysql'));
Promises.promisifyAll(require("mysql/lib/Connection").prototype);
Promises.promisifyAll(require("mysql/lib/Pool").prototype);

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	//enter your information
	user: "",
	password: "",
	database: ""
});

connection.connect(function(err) {
  if (err) throw err;
});

var start = function() {
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
		    	if (data.stock_quantity < data.qty){
		    		console.log("Transaction Failed: Insufficient stock.");
		    	}
		    	else {
		    		connection.queryAsync(
						"UPDATE products SET stock_quantity = ? WHERE item_id = ?", 
						[data.qty, data.choice]
					);
		    		console.log("Your Order has been Placed.");
		    	}
		    })
		    .then(() => {
		    	connection.end();
		    })
		    .catch(err => {throw err});
	});
};

start();